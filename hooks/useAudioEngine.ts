
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
  // Removed eager initialization. 
  // We now initialize exclusively via user interaction in initializeAudio()
  // to comply with iOS/Android autoplay policies.

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
    // Simplified Volume (No Ramp to ensure mobile works)
    noiseGain.gain.value = 0.4;

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

    // Stereo Separation (Robust Polyfill for Safari/iOS)
    let panner1: AudioNode;
    let panner2: AudioNode;

    if (ctx.createStereoPanner) {
      // Modern Browsers
      const p1 = ctx.createStereoPanner();
      p1.pan.value = -1;
      panner1 = p1;

      const p2 = ctx.createStereoPanner();
      p2.pan.value = 1;
      panner2 = p2;
    } else {
      // Old Safari / WebKit Fallback
      const p1 = ctx.createPanner();
      p1.panningModel = 'equalpower';
      p1.setPosition(-1, 0, 0);
      panner1 = p1;

      const p2 = ctx.createPanner();
      p2.panningModel = 'equalpower';
      p2.setPosition(1, 0, 0);
      panner2 = p2;
    }

    // Tone Envelope
    const toneGain = ctx.createGain();
    // Simplified Volume (No Ramp)
    toneGain.gain.value = 0.5;

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

  const [audioState, setAudioState] = useState<AudioContextState>('suspended');

  // --- EXPOSED CONTROL ---
  const initializeAudio = useCallback(async () => {
    // 1. Lazy Initialization (safe for iOS if done here)
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass({ latencyHint: 'interactive' });

      // Setup nodes for new context
      const ctx = audioCtxRef.current;
      const master = ctx.createGain();
      master.gain.value = volume;
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -10;
      compressor.ratio.value = 12;
      compressor.connect(master);
      master.connect(ctx.destination);

      masterGainRef.current = master;
      compressorRef.current = compressor;
      setIsReady(true);

      // Listen for state changes
      ctx.onstatechange = () => {
        setAudioState(ctx.state);
      };
    }

    const ctx = audioCtxRef.current;
    if (!ctx) return;

    // 2. iOS Unlock Hack: Play a silent buffer IMMEDIATELY (Do not await anything)
    // This creates a valid "sound" triggering the audio engine
    try {
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    } catch (e) {
      console.error('[AudioEngine] Buffer unlock failed', e);
    }

    // 3. Keep trying to resume standardly
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (e) {
        console.error('[AudioEngine] Resume failed', e);
      }
    }

    setAudioState(ctx.state);
  }, [volume]);

  // --- TRIGGER ---
  useEffect(() => {
    if (isPlaying) {
      startSound();
    } else {
      stopSound();
    }
  }, [isPlaying, startSound, stopSound]);

  return { isReady, initializeAudio, audioState };
};
