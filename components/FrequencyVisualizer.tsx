
import React, { useEffect, useRef } from 'react';

interface Props {
  isActive: boolean;
  color: string;
  speed: number;
  volume: number;
  fullScreen?: boolean;
}

// --- SHADERS ---

const VERTEX_SHADER = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec3 u_color;
  uniform float u_volume;
  uniform float u_speed;
  uniform bool u_isActive;

  // Pseudo-random function
  float hash(float n) { return fract(sin(n) * 43758.5453123); }

  // Noise function for organic movement
  float noise(float x) {
      float i = floor(x);
      float f = fract(x);
      float u = f * f * (3.0 - 2.0 * f);
      return mix(hash(i), hash(i + 1.0), u);
  }

  void main() {
    // Normalize coordinates to -1.0 to 1.0, correcting aspect ratio
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution) / u_resolution.y;
    
    vec3 finalColor = vec3(0.0);
    
    // Parameters based on state
    float time = u_time * (0.5 + (u_speed * 0.05));
    float amplitudeBase = u_isActive ? 0.3 + (u_volume * 0.4) : 0.02;
    float glowBase = u_isActive ? 0.02 + (u_volume * 0.03) : 0.005;
    
    // --- WAVE LAYERS ---
    // We draw 3 overlapping waves for the "Neuro" look
    
    for (float i = 0.0; i < 3.0; i++) {
        // Unique characteristics for each layer
        float freq = 2.0 + i * 1.5;
        float speedOffset = i * 0.5;
        float phase = time + (i * 12.35); // Random offset
        
        // Calculate Wave Y position
        // Basic Sine + Noise for organic jitter + Modulation
        float noiseVal = noise(uv.x * 2.0 + time * 2.0);
        float modulation = sin(time * 0.5 + i) * 0.5 + 1.0;
        
        float waveY = sin(uv.x * freq + phase) * amplitudeBase * modulation;
        
        // Add "Jitter" based on volume (high frequency noise)
        if (u_isActive) {
            waveY += (noise(uv.x * 20.0 + time * 10.0) - 0.5) * u_volume * 0.2;
        }

        // Distance field to the line
        float dist = abs(uv.y - waveY);
        
        // Glow calculation (Hyperbolic falloff: 1/x)
        // This creates the "Neon" look better than Gaussian
        float intensity = glowBase / (dist + 0.001);
        
        // Attenuate edges (Vignette for the line)
        intensity *= smoothstep(1.8, 0.5, abs(uv.x));
        
        // Layer Color nuances
        // Main layer matches theme, others are slightly offset/whiter
        vec3 layerColor = u_color;
        if (i > 0.0) layerColor = mix(u_color, vec3(1.0), 0.3); // Add harmonics

        finalColor += layerColor * intensity;
    }

    // --- BACKGROUND FX ---
    
    // Center baseline (Clinial look)
    if (!u_isActive) {
        float lineDist = abs(uv.y);
        float lineInt = 0.002 / lineDist;
        lineInt *= smoothstep(1.0, 0.0, abs(uv.x)); // Fade out ends
        finalColor += vec3(1.0) * lineInt * 0.1;
    }

    // Scanline effect (CRT style)
    float scanline = sin(gl_FragCoord.y * 0.5 + u_time * 5.0) * 0.02;
    finalColor -= scanline;

    // Output
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// Helper: Convert Hex to RGB [0-1]
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255,
      ]
    : [1, 1, 1]; // Default white
};

const FrequencyVisualizer: React.FC<Props> = ({ isActive, color, speed, volume, fullScreen = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  // WebGL Context Refs (to avoid recreation)
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const locationsRef = useRef<any>(null);
  const startTimeRef = useRef<number>(Date.now());

  // 1. Initialize WebGL
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { 
        alpha: true, 
        antialias: false, // We do AA in shader via distance field
        preserveDrawingBuffer: false
    });
    
    if (!gl) {
        console.error("WebGL not supported");
        return;
    }
    glRef.current = gl;

    // Helper to create Shader
    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vert = createShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const frag = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

    if (!vert || !frag) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }
    
    gl.useProgram(program);
    programRef.current = program;

    // Define Geometry (Full screen quad)
    // Two triangles covering [-1, -1] to [1, 1]
    const vertices = new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
       1.0,  1.0,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Get Attribute/Uniform Locations
    const positionLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    locationsRef.current = {
      resolution: gl.getUniformLocation(program, 'u_resolution'),
      time: gl.getUniformLocation(program, 'u_time'),
      color: gl.getUniformLocation(program, 'u_color'),
      volume: gl.getUniformLocation(program, 'u_volume'),
      speed: gl.getUniformLocation(program, 'u_speed'),
      isActive: gl.getUniformLocation(program, 'u_isActive'),
    };
    
    // Handle Cleanup
    return () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        // Basic cleanup
        if (gl && program) {
            gl.deleteProgram(program);
        }
    };
  }, []);

  // 2. Resize Handler
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current && glRef.current) {
         const dpr = window.devicePixelRatio || 1;
         const w = containerRef.current.clientWidth;
         const h = containerRef.current.clientHeight;
         
         canvasRef.current.width = w * dpr;
         canvasRef.current.height = h * dpr;
         
         glRef.current.viewport(0, 0, w * dpr, h * dpr);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Init size

    return () => window.removeEventListener('resize', handleResize);
  }, [fullScreen]);

  // 3. Animation Loop
  useEffect(() => {
    const gl = glRef.current;
    const loc = locationsRef.current;
    
    if (!gl || !loc) return;

    const render = () => {
       // Calc Time
       const now = (Date.now() - startTimeRef.current) / 1000;
       
       // Update Uniforms
       gl.uniform1f(loc.time, now);
       gl.uniform2f(loc.resolution, gl.canvas.width, gl.canvas.height);
       
       const rgb = hexToRgb(color);
       gl.uniform3f(loc.color, rgb[0], rgb[1], rgb[2]);
       
       // Smooth volume transition could be done here, but passing directly for reactivity
       gl.uniform1f(loc.volume, volume);
       gl.uniform1f(loc.speed, speed);
       gl.uniform1i(loc.isActive, isActive ? 1 : 0);

       // Draw
       gl.drawArrays(gl.TRIANGLES, 0, 6);

       animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
       if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [color, isActive, volume, speed]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <canvas 
        ref={canvasRef} 
        className="block w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default FrequencyVisualizer;
