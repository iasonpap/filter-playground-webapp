/**
 * High-Performance Digital Signal Processing Library
 * Implements freqz, FFT/IFFT, and ZPK utilities following best practices
 * for speed, accuracy, and extensibility in JavaScript
 */
import Complex from './Complex';
// ============================================================================
// POLYNOMIAL UTILITIES
// ============================================================================

/**
 * TODO: read about Horner's method + do the math on paper
 * Evaluate polynomial using Horner's method for speed
 * @param {Float64Array} coeffs - Polynomial coefficients [a0, a1, ..., an]
 * @param {Complex} z - Point to evaluate at
 * @returns {Complex} - Polynomial value at z
 */
function polyval(coeffs: Float64Array, z: Complex): Complex {
  if (coeffs.length === 0) return new Complex(0, 0);
  
  let result = new Complex(coeffs[coeffs.length - 1], 0);
  for (let i = coeffs.length - 2; i >= 0; i--) {
    result = Complex.add(Complex.mul(result, z), new Complex(coeffs[i], 0));
  }
  return result;
}

/**
 * Multiply two polynomials represented as coefficient arrays
 * @param {Float64Array} a - First polynomial coefficients
 * @param {Float64Array} b - Second polynomial coefficients
 * @returns {Float64Array} - Product polynomial coefficients
 */
function polymul(a: Float64Array, b: Float64Array): Float64Array {
  const result = new Float64Array(a.length + b.length - 1);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      result[i + j] += a[i] * b[j];
    }
  }
  return result;
}

/**
 * TODO: do the math on paper to understand the logic
 * Expand polynomial from roots: (x - r1)(x - r2)...(x - rn)
 * @param {Array<Complex>} roots - Array of complex roots
 * @returns {Float64Array} - Polynomial coefficients
 */
function poly(roots: Array<{re: number, im: number}>): Float64Array {
  if (roots.length === 0) return new Float64Array([1]);

  let coeffs = new Float64Array([1]);

  for (let i = 0; i < roots.length; i++) {
    const root = roots[i];

    if (Math.abs(root.im) <= 1e-10) {
      // Real root
      coeffs = polymul(coeffs, new Float64Array([1, -root.re]));
    } else {
      // Complex root: must be paired with its conjugate
      if (
        i + 1 >= roots.length ||
        Math.abs(root.re - roots[i + 1].re) > 1e-10 ||
        Math.abs(root.im + roots[i + 1].im) > 1e-10
      ) {
        throw new Error(
          `Complex root at index ${i} is not followed by its conjugate.`
        );
      }
      // (x - (a + jb))(x - (a - jb)) = x^2 - 2a x + (a^2 + b^2)
      coeffs = polymul(
        coeffs,
        new Float64Array([
          1,
          -2 * root.re,
          root.re * root.re + root.im * root.im,
        ])
      );
      i++; // Skip the conjugate
    }
  }

  return coeffs;
}
// ============================================================================
// ZPK TO TRANSFER FUNCTION CONVERSION
// ============================================================================

/**
 * TODO: do the math on paper to understand the logic
 * Convert zeros, poles, and gain to transfer function coefficients
 * @param {Array<Complex>} zeros - Array of complex zeros
 * @param {Array<Complex>} poles - Array of complex poles
 * @param {number} gain - System gain
 * @returns {Object} - {b, a} numerator and denominator coefficients
 */
function zpk2tf(zeros, poles, gain) {
  // Expand numerator polynomial from zeros
  const b_raw = poly(zeros);
  const b = new Float64Array(b_raw.length);
  for (let i = 0; i < b_raw.length; i++) {
    b[i] = gain * b_raw[i];
  }
  
  // Expand denominator polynomial from poles
  const a = poly(poles);
  
  return { b, a };
}

// ============================================================================
// FREQUENCY RESPONSE COMPUTATION
// ============================================================================

/**
 * Generate frequency grid
 * @param {number} worN - Number of frequency points
 * @param {number} fs - Sampling frequency
 * @param {string} spacing - 'linear' or 'log'
 * @returns {Float64Array} - Frequency array
 */
function generateFreqGrid(worN, fs = 2 * Math.PI, spacing = 'linear') {
  const w = new Float64Array(worN);
  
  if (spacing === 'linear') {
    for (let i = 0; i < worN; i++) {
      w[i] = (i * fs) / (2 * worN);
    }
  } else if (spacing === 'log') {
    const logStart = Math.log10(fs / (2 * worN));
    const logEnd = Math.log10(fs / 2);
    const logStep = (logEnd - logStart) / (worN - 1);
    
    for (let i = 0; i < worN; i++) {
      w[i] = Math.pow(10, logStart + i * logStep);
    }
  }
  
  return w;
}

/**
 * TODO: do the math on paper to understand the logic. 
 * TODO: validate logic with github copilot
 * Compute frequency response from transfer function coefficients
 * @param {Float64Array} b - Numerator coefficients
 * @param {Float64Array} a - Denominator coefficients  
 * @param {number|Float64Array} worN - Number of points or frequency array
 * @param {number} fs - Sampling frequency
 * @param {string} spacing - Frequency spacing ('linear' or 'log')
 * @returns {Object} - {w, h} frequency and response arrays
 */
function freqz(b, a = null, worN = 512, fs = 2 * Math.PI, spacing = 'linear') {
  // Default denominator to [1] if not provided
  if (a === null) {
    a = new Float64Array([1]);
  }
  
  // Handle frequency grid
  let w;
  if (typeof worN === 'number') {
    w = generateFreqGrid(worN, fs, spacing);
  } else {
    w = worN; // User-provided frequency array
    worN = w.length;
  }
  
  const h = new Array(worN);
  
  // Vectorized computation using typed arrays
  const bTyped = b instanceof Float64Array ? b : new Float64Array(b);
  const aTyped = a instanceof Float64Array ? a : new Float64Array(a);
  
  // Precompute for efficiency
  const bLen = bTyped.length;
  const aLen = aTyped.length;
  
  for (let i = 0; i < worN; i++) {
    const omega = w[i];
    
    // Evaluate numerator polynomial at e^(-jω)
    let num = new Complex(0, 0);
    for (let k = 0; k < bLen; k++) {
      const angle = -omega * k;
      const expTerm = Complex.exp(angle);
      num = Complex.add(num, Complex.mul(new Complex(bTyped[k], 0), expTerm));
    }
    
    // Evaluate denominator polynomial at e^(-jω)
    let den = new Complex(0, 0);
    for (let k = 0; k < aLen; k++) {
      const angle = -omega * k;
      const expTerm = Complex.exp(angle);
      den = Complex.add(den, Complex.mul(new Complex(aTyped[k], 0), expTerm));
    }
    
    // Complex division: H(ejω) = num/den
    h[i] = Complex.div(num, den);
  }
  
  return { w, h };
}

/**
 * Compute frequency response from zeros, poles, and gain
 * @param {Array<Complex>} zeros - Array of complex zeros
 * @param {Array<Complex>} poles - Array of complex poles
 * @param {number} gain - System gain
 * @param {number|Float64Array} worN - Number of points or frequency array
 * @param {number} fs - Sampling frequency
 * @param {string} spacing - Frequency spacing
 * @returns {Object} - {w, h} frequency and response arrays
 */
function freqzZPK(zeros, poles, gain, worN = 512, fs = 2 * Math.PI, spacing = 'linear') {
  // Convert to transfer function and use freqz
  const { b, a } = zpk2tf(zeros, poles, gain);
  return freqz(b, a, worN, fs, spacing);
}

/**
 * Alternative direct ZPK evaluation (more numerically stable for high-order systems)
 */
function freqzZPKDirect(zeros, poles, gain, worN = 512, fs = 2 * Math.PI, spacing = 'linear') {
  let w;
  if (typeof worN === 'number') {
    w = generateFreqGrid(worN, fs, spacing);
  } else {
    w = worN;
    worN = w.length;
  }
  
  const h = new Array(worN);
  
  for (let i = 0; i < worN; i++) {
    const ejw = Complex.exp(w[i]);
    
    // Product of (e^jω - z_k) for all zeros
    let num = new Complex(gain, 0);
    for (const zero of zeros) {
      num = Complex.mul(num, Complex.sub(ejw, zero));
    }
    
    // Product of (e^jω - p_k) for all poles
    let den = new Complex(1, 0);
    for (const pole of poles) {
      den = Complex.mul(den, Complex.sub(ejw, pole));
    }
    
    h[i] = Complex.div(num, den);
  }
  
  return { w, h };
}

// ============================================================================
// FFT IMPLEMENTATION (Radix-2 Cooley-Tukey)
// ============================================================================

/**
 * In-place FFT using Cooley-Tukey radix-2 algorithm
 * @param {Array<Complex>} x - Input/output array (modified in-place)
 */
function fft(x) {
  const N = x.length;
  if (N <= 1) return x;
  
  // Ensure power of 2
  if ((N & (N - 1)) !== 0) {
    throw new Error('FFT input length must be a power of 2');
  }
  
  // Bit-reverse permutation
  for (let i = 1, j = 0; i < N; i++) {
    let bit = N >> 1;
    for (; j & bit; bit >>= 1) {
      j ^= bit;
    }
    j ^= bit;
    
    if (i < j) {
      [x[i], x[j]] = [x[j], x[i]];
    }
  }
  
  // Cooley-Tukey decimation-in-time radix-2 FFT
  for (let len = 2; len <= N; len <<= 1) {
    const wlen = Complex.exp(-2 * Math.PI / len);
    for (let i = 0; i < N; i += len) {
      let w = new Complex(1, 0);
      for (let j = 0; j < len / 2; j++) {
        const u = x[i + j];
        const v = Complex.mul(x[i + j + len / 2], w);
        x[i + j] = Complex.add(u, v);
        x[i + j + len / 2] = Complex.sub(u, v);
        w = Complex.mul(w, wlen);
      }
    }
  }
  
  return x;
}

/**
 * Inverse FFT
 * @param {Array<Complex>} x - Input array
 * @returns {Array<Complex>} - IFFT result
 */
function ifft(x) {
  const N = x.length;
  
  // Conjugate input
  for (let i = 0; i < N; i++) {
    x[i] = x[i].conj();
  }
  
  // Forward FFT
  fft(x);
  
  // Conjugate output and scale
  for (let i = 0; i < N; i++) {
    x[i] = new Complex(x[i].conj().re / N, x[i].conj().im / N);
  }
  
  return x;
}

/**
 * Convert real array to complex array for FFT
 * @param {Float64Array} realArray - Real input
 * @returns {Array<Complex>} - Complex array
 */
function real2complex(realArray) {
  return Array.from(realArray, val => new Complex(val, 0));
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Compute magnitude response in dB
 * @param {Array<Complex>} h - Complex frequency response
 * @returns {Float64Array} - Magnitude in dB
 */
function mag2db(h) {
  return new Float64Array(h.map(val => 20 * Math.log10(val.abs())));
}

/**
 * Compute phase response in radians
 * @param {Array<Complex>} h - Complex frequency response
 * @returns {Float64Array} - Phase in radians
 */
function phase(h) {
  return new Float64Array(h.map(val => val.arg()));
}

/**
 * Unwrap phase to remove 2π discontinuities
 * @param {Float64Array} phases - Phase array
 * @returns {Float64Array} - Unwrapped phase
 */
function unwrap(phases) {
  const unwrapped = new Float64Array(phases.length);
  unwrapped[0] = phases[0];
  
  for (let i = 1; i < phases.length; i++) {
    let diff = phases[i] - phases[i - 1];
    
    // Unwrap by adding/subtracting 2π
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    
    unwrapped[i] = unwrapped[i - 1] + diff;
  }
  
  return unwrapped;
}

// ============================================================================
// EXPORTS AND EXAMPLES
// ============================================================================

// Export all functions
const DSP = {
  Complex,
  freqz,
  freqzZPK,
  freqzZPKDirect,
  zpk2tf,
  fft,
  ifft,
  real2complex,
  mag2db,
  phase,
  unwrap,
  polyval,
  polymul,
  poly,
  generateFreqGrid
};

// Example usage:
if (typeof window !== 'undefined') {
  window.DSP = DSP;
}

// Example: Design a 2nd-order Butterworth lowpass filter
function butterworthExample() {
  // 2nd-order Butterworth lowpass, normalized frequency = 0.2
  const wc = 0.2 * Math.PI; // Cutoff frequency
  
  // Poles for 2nd-order Butterworth
  const poles = [
    new Complex(-Math.sin(Math.PI/4) * wc, Math.cos(Math.PI/4) * wc),
    new Complex(-Math.sin(Math.PI/4) * wc, -Math.cos(Math.PI/4) * wc)
  ];
  const zeros = []; // No zeros for lowpass
  const gain = wc * wc; // DC gain = 1
  
  // Compute frequency response
  const result = freqzZPKDirect(zeros, poles, gain, 1024);
  
  console.log('Butterworth filter example:');
  console.log('Magnitude at DC:', result.h[0].abs());
  console.log('Magnitude at Nyquist:', result.h[result.h.length - 1].abs());
  
  return result;
}

// Performance test
function performanceTest() {
  console.time('freqz performance');
  
  // High-order filter
  const b = new Float64Array(50).fill(0);
  b[0] = 1; b[49] = 0.5;
  const a = new Float64Array(50).fill(0);
  a[0] = 1; a[10] = 0.3; a[20] = 0.1;
  
  const result = freqz(b, a, 8192);
  
  console.timeEnd('freqz performance');
  console.log('Computed', result.h.length, 'frequency points');
}

// Uncomment to run examples:
// butterworthExample();
// performanceTest();

export default DSP;