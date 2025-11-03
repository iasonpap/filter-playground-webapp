// DSP utility functions for filter calculations
import { Complex } from '../services/Complex';

export interface PoleZero {
  id: string;
  real: number;
  imag: number;
  type: 'pole' | 'zero';
}

export interface BiquadCoefficients {
  b0: number;
  b1: number;
  b2: number;
  a1: number;
  a2: number;
}

export interface FrequencyResponse {
  frequencies: number[];
  magnitude: number[];
  phase: number[];
}

let idCounter = 0;
export function generateId(): string {
  return `pz_${Date.now()}_${idCounter++}`;
}

/**
 * Convert poles and zeros to biquad coefficients
 */
export function poleZeroToBiquad(zeros: PoleZero[], poles: PoleZero[]): BiquadCoefficients {
  // Default passthrough
  if (zeros.length === 0 && poles.length === 0) {
    return { b0: 1, b1: 0, b2: 0, a1: 0, a2: 0 };
  }

  // Get coefficients from poles and zeros
  const b = polyFromRoots(zeros);
  const a = polyFromRoots(poles);

  // Normalize so a[0] = 1
  const a0 = a[0] || 1;
  
  return {
    b0: (b[0] || 0) / a0,
    b1: (b[1] || 0) / a0,
    b2: (b[2] || 0) / a0,
    a1: (a[1] || 0) / a0,
    a2: (a[2] || 0) / a0,
  };
}

/**
 * Get polynomial coefficients from roots
 */
function polyFromRoots(roots: PoleZero[]): number[] {
  if (roots.length === 0) return [1];

  let coeffs = [1];

  for (const root of roots) {
    const isReal = Math.abs(root.imag) < 1e-10;
    
    if (isReal) {
      // Real root: (z - r) = z - r
      coeffs = convolve(coeffs, [1, -root.real]);
    } else if (root.imag > 0) {
      // Complex root pair: (z - r)(z - r*) = z^2 - 2*Re(r)*z + |r|^2
      const twoRe = 2 * root.real;
      const magSq = root.real * root.real + root.imag * root.imag;
      coeffs = convolve(coeffs, [1, -twoRe, magSq]);
    }
    // Skip conjugate (imag < 0) as it's already handled
  }

  return coeffs;
}

/**
 * Convolve two polynomial coefficient arrays
 */
function convolve(a: number[], b: number[]): number[] {
  const result = new Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      result[i + j] += a[i] * b[j];
    }
  }
  return result;
}

/**
 * Evaluate polynomial at complex point z using Horner's method
 */
function polyval(coeffs: number[], z: Complex): Complex {
  if (coeffs.length === 0) return new Complex(0, 0);
  
  let result = new Complex(coeffs[coeffs.length - 1], 0);
  for (let i = coeffs.length - 2; i >= 0; i--) {
    result = Complex.add(Complex.mul(result, z), new Complex(coeffs[i], 0));
  }
  return result;
}

/**
 * Calculate frequency response for a single biquad
 */
export function calculateBiquadFrequencyResponse(
  coeffs: BiquadCoefficients,
  sampleRate: number = 48000,
  numPoints: number = 512
): FrequencyResponse {
  const frequencies: number[] = [];
  const magnitude: number[] = [];
  const phase: number[] = [];

  const b = [coeffs.b0, coeffs.b1, coeffs.b2];
  const a = [1, coeffs.a1, coeffs.a2];

  for (let i = 0; i < numPoints; i++) {
    const f = (i / numPoints) * (sampleRate / 2);
    const w = (2 * Math.PI * f) / sampleRate;
    
    // z = e^(jw)
    const z = new Complex(Math.cos(w), Math.sin(w));
    
    // Evaluate numerator and denominator polynomials
    const num = polyval(b, z);
    const den = polyval(a, z);
    
    // H(z) = num / den
    const H = Complex.div(num, den);
    
    frequencies.push(f);
    magnitude.push(20 * Math.log10(H.abs() || 1e-10)); // Avoid log(0)
    phase.push((H.arg() * 180) / Math.PI);
  }

  return { frequencies, magnitude, phase };
}

/**
 * Combine multiple biquad frequency responses (cascade)
 */
export function combineBiquadResponses(responses: FrequencyResponse[]): FrequencyResponse {
  if (responses.length === 0) {
    return { frequencies: [], magnitude: [], phase: [] };
  }

  const combined = {
    frequencies: responses[0].frequencies.slice(),
    magnitude: responses[0].magnitude.map(() => 0),
    phase: responses[0].phase.map(() => 0),
  };

  responses.forEach(response => {
    response.magnitude.forEach((mag, i) => {
      combined.magnitude[i] += mag; // dB addition
    });
    response.phase.forEach((ph, i) => {
      combined.phase[i] += ph; // Phase addition
    });
  });

  return combined;
}

/**
 * Check if poles are stable (inside unit circle)
 */
export function isStable(poles: PoleZero[]): boolean {
  return poles.every(pole => {
    const mag = Math.sqrt(pole.real * pole.real + pole.imag * pole.imag);
    return mag < 1.0;
  });
}