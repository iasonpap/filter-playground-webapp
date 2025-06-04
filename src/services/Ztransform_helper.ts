import { 
    complex,
    Complex, 
    dotDivide, 
    dotMultiply, 
    add, 
    subtract, 
    multiply, 
    abs, 
    arg, 
    mod } from "mathjs";

export const fig_margins = {
  t: 40, //top margin
  l: 40, //left margin
  r: 20, //right margin
  b: 40, //bottom margin
};

export function meshGrid(start, stop, step) {
  // ****************************
  // Prepare a square MeshGrid for 3D graph
  // vecor start:step:stop
  // ****************************
  let N = Math.floor((stop - start) / step + 1);

  let X = [...Array(N).keys()].map((y) => [...Array(N).keys()].map((x) => x * step + start));
  let Y = [...Array(N).keys()].map((y) => [...Array(N).keys()].map((x) => y * step + start));

  return { X, Y };
}

export function unitCircle(N) {
  let re_unit_circle = Array(N);
  let im_unit_circle = Array(N);

  for (let i = 0; i < N + 1; i++) {
    let phi = (2 * Math.PI * i) / N;
    re_unit_circle[i] = Math.cos(phi);
    im_unit_circle[i] = Math.sin(phi);
  }

  return { re_unit_circle, im_unit_circle };
}

export function transferFunction(reZ, imZ, poles, zeros, gain) {
  // ****************************
  // Calculate the complex valued - complex TF (Transfere Function)
  // ┌─────────────────────────────────────────────────────┐
  // │                (z - zero) * (z - conj(zero))        │
  // │  H = gain *  ──────────────────────────────────     │
  // │                (z - pole) * (z - conj(pole))        │
  // └────────────────────────────────────────────────────-┘
  //
  // reZ, imZ ... 2D arrays
  // zero     ... zero position (1 of roots of numerator)
  // pole     ... pole position (1 of roots of denominator)
  // ****************************

  let is_2D = reZ[0].length > 1;

  // prepare z^(-1) and z^(-1)
  let Z = calculateZ(reZ, imZ, is_2D);

  // calculate the TF
  let numerator = dotMultiply(subtract(Z, zeros[0]), subtract(Z, zeros[1]));
  let denominator = dotMultiply(subtract(Z, poles[0]), subtract(Z, poles[1]));
  let Hx = multiply(gain, dotDivide(numerator, denominator));

  return Hx;
  //   // return limited output
  //   if (is_2D) {
  //     return Hx;
  //     //return [...Hx].map((row) => [...row].map((value) => (abs(value) > zlim ? zlim : value)));
  //   } else {
  //     return [...Hx].map((value) => (abs(value) > zlim ? NaN : value));
  //   }
}

function calculateZ(reZ, imZ, is_2D) {
  // ****************************
  // Prepare z^(-1) and z^(-1) from real and imaginary part
  //
  // reZ, imZ ... 1D or 2D arrays
  // ****************************

  let N = reZ.length;

  let Z = Array(N);

  for (let i = 0; i < N; i++) {
    if (is_2D) {
      Z[i] = Array(N);
      for (let j = 0; j < N; j++) {
        Z[i][j] = Complex(reZ[i][j], imZ[i][j]);
      }
    } else {
      Z[i] = Complex(reZ[i], imZ[i]);
    }
  }

  return Z;
}

export function lowPassFilter(fc, fs, Q) {
  let wc = (2 * Math.PI * fc) / fs;
  let alpha = Math.sin(wc) / (2 * Q);

  let b0 = (1 - Math.cos(wc)) / 2;
  let b1 = 1 - Math.cos(wc);
  let b2 = (1 - Math.cos(wc)) / 2;
  let a0 = 1 + alpha;
  let a1 = -2 * Math.cos(wc);
  let a2 = 1 - alpha;

  let b = [b0 / a0, b1 / a0, b2 / a0];
  let a = [1, a1 / a0, a2 / a0];

  return { b, a };
}

export function argFromReIm(re, im) {
  return re.map((re, idx) => mod(arg(Complex(re, im[idx])), 2 * Math.PI));
}

export function roots(abs_val, arg_val) {
  let r1 = Complex({ abs: abs_val, arg: arg_val });
  let r2 = Complex({ abs: abs_val, arg: -arg_val });
  return [r1, r2];
}

export function poly(roots, gain) {
  return [
    gain,
    multiply(gain, add(roots[0], roots[1]).neg()).re,
    multiply(gain, roots[0], roots[1]).re,
  ];
}

export function myRound(x, N) {
  let coef = Math.pow(10, N);
  return Math.round((x + Number.EPSILON) * coef) / coef;
}
