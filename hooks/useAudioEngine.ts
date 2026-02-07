
import { useEffect, useRef, useState, useCallback } from 'react';
import { SessionConfig, SessionMode } from '../types';

interface AudioBufferCache {
  [key: string]: AudioBuffer;
}

export const useAudioEngine = (mode: SessionMode, config: SessionConfig, isPlaying: boolean, volume: number) => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  // Effects
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);

  // Cache
  const bufferCacheRef = useRef<AudioBufferCache>({});

  // Track active source nodes to stop them later
  const activeSourcesRef = useRef<AudioScheduledSourceNode[]>([]);

  const [isReady, setIsReady] = useState(false);

  // --- 1. SETUP AUDIO CONTEXT ---
  useEffect(() => {
    const initAudio = () => {
      // Check if context already exists and is usable
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        setIsReady(true);
        return;
      }

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass({ latencyHint: 'interactive' });

      // Master Gain (Controlled by User Slider)
      const master = ctx.createGain();
      master.gain.value = volume;

      // Compressor (To prevent clipping)
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -10;
      compressor.ratio.value = 12;

      // Routing: Compressor -> Master -> Destination
      compressor.connect(master);
      master.connect(ctx.destination);

      masterGainRef.current = master;
      compressorRef.current = compressor;
      audioCtxRef.current = ctx;

      setIsReady(true);
      console.log('[AudioEngine] AudioContext initialized, state:', ctx.state);
    };

    initAudio();

    // NOTE: We intentionally do NOT close the AudioContext on cleanup
    // because React StrictMode and re-renders would close it prematurely.
    // The context will be garbage collected when the page unloads.
  }, []);

  // --- 2. HANDLE VOLUME SLIDER ---
  useEffect(() => {
    if (masterGainRef.current) {
      // Immediate response for UI slider
      // Use setTargetAtTime with a very fast constant to prevent zipper noise but feel instant
      masterGainRef.current.gain.setTargetAtTime(volume, audioCtxRef.current?.currentTime || 0, 0.01);
    }
  }, [volume]);

  // --- 3. BUFFER GENERATORS ---
  const getNoiseBuffer = useCallback((ctx: AudioContext, type: 'White' | 'Pink' | 'Brown') => {
    if (bufferCacheRef.current[type]) return bufferCacheRef.current[type];

    const bufferSize = 2 * ctx.sampleRate; // 2 seconds loop is enough
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const output = buffer.getChannelData(channel);
      if (type === 'White') {
        for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
      } else if (type === 'Pink') {
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          output[i] *= 0.11;
          b6 = white * 0.115926;
        }
      } else if (type === 'Brown') {
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5;
        }
      }
    }
    bufferCacheRef.current[type] = buffer;
    return buffer;
  }, []);

  // --- 4. PLAYBACK LOGIC ---
  const stopSound = useCallback(() => {
    // Stop all tracked sources
    activeSourcesRef.current.forEach(node => {
      try {
        // Ramp down gain if possible (requires tracking gain nodes, simplified here to stop)
        // For robustness, we just stop sources.
        node.stop();
        node.disconnect();
      } catch (e) { /* ignore */ }
    });
    activeSourcesRef.current = [];
  }, []);

  const startSound = useCallback(async () => {
    const ctx = audioCtxRef.current;
    const compressor = compressorRef.current;

    console.log('[AudioEngine] startSound called', { mode, isIdle: mode === SessionMode.IDLE, ctx: !!ctx, compressor: !!compressor });

    if (!ctx || !compressor || mode === SessionMode.IDLE) return;

    // IMPORTANT: Resume context if suspended (Browser Policy)
    if (ctx.state === 'suspended') {
      console.log('[AudioEngine] Resuming suspended context...');
      await ctx.resume();
    }

    console.log('[AudioEngine] Context state:', ctx.state);

    stopSound(); // Clear previous

    const t = ctx.currentTime;
    const fadeTime = 2; // 2 seconds fade in

    // --- LAYER 1: NOISE ATMOSPHERE ---
    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = getNoiseBuffer(ctx, config.noiseColor);
    noiseNode.loop = true;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, t);
    noiseGain.gain.linearRampToValueAtTime(0.4, t + fadeTime); // Max volume for noise

    // Filter noise to make it smoother
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 800;

    noiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(compressor);

    noiseNode.start(t);
    activeSourcesRef.current.push(noiseNode);

    // --- LAYER 2: BINAURAL/ISOCHRONIC TONES ---
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();

    // Carrier Frequency (Base tone)
    const carrier = mode === SessionMode.SLEEP ? 100 : 200;
    // Binaural Beat (Difference)
    const beat = (config.frequencyRange[0] + config.frequencyRange[1]) / 2;

    osc1.frequency.value = carrier;
    osc2.frequency.value = carrier + beat;
    osc1.type = 'sine';
    osc2.type = 'sine';

    // Stereo Separation
    const panner1 = ctx.createStereoPanner();
    panner1.pan.value = -1; // Left
    const panner2 = ctx.createStereoPanner();
    panner2.pan.value = 1; // Right

    // Tone Envelope
    const toneGain = ctx.createGain();
    toneGain.gain.setValueAtTime(0, t);
    toneGain.gain.linearRampToValueAtTime(0.5, t + fadeTime);

    // Isochronic Pulse (Modulation) - Optional addition for stronger effect
    const isoGain = ctx.createGain();
    isoGain.gain.value = 1;

    // Connect Chain
    osc1.connect(panner1);
    osc2.connect(panner2);
    panner1.connect(isoGain);
    panner2.connect(isoGain);
    isoGain.connect(toneGain);
    toneGain.connect(compressor);

    osc1.start(t);
    osc2.start(t);
    activeSourcesRef.current.push(osc1, osc2);

    // --- LAYER 3: ISOCHRONIC LFO (Pulsing volume) ---
    // This pulses the isoGain node created above
    const lfo = ctx.createOscillator();
    lfo.frequency.value = beat; // Pulse at the target frequency
    lfo.type = 'sine';

    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 0.3; // Depth of pulse

    // For AM synthesis: Signal * (1 + LFO)
    // Here we just modulate gain directly
    lfo.connect(lfoDepth);
    lfoDepth.connect(isoGain.gain);
    lfo.start(t);
    activeSourcesRef.current.push(lfo);

  }, [mode, config, getNoiseBuffer, stopSound]);

  // --- TRIGGER ---
  useEffect(() => {
    if (isPlaying) {
      startSound();
    } else {
      stopSound();
    }
  }, [isPlaying, startSound, stopSound]);

  return { isReady };
};
