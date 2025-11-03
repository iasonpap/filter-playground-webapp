/**
 * Complex number class for DSP calculations
 */
export class Complex {
  re: number;
  im: number;

  constructor(re: number, im: number) {
    this.re = re;
    this.im = im;
  }

  static add(a: Complex, b: Complex): Complex {
    return new Complex(a.re + b.re, a.im + b.im);
  }

  static sub(a: Complex, b: Complex): Complex {
    return new Complex(a.re - b.re, a.im - b.im);
  }

  static mul(a: Complex, b: Complex): Complex {
    return new Complex(
      a.re * b.re - a.im * b.im,
      a.re * b.im + a.im * b.re
    );
  }

  static div(a: Complex, b: Complex): Complex {
    const denom = b.re * b.re + b.im * b.im;
    return new Complex(
      (a.re * b.re + a.im * b.im) / denom,
      (a.im * b.re - a.re * b.im) / denom
    );
  }

  static exp(a: Complex): Complex {
    const expRe = Math.exp(a.re);
    return new Complex(
      expRe * Math.cos(a.im),
      expRe * Math.sin(a.im)
    );
  }

  abs(): number {
    return Math.sqrt(this.re * this.re + this.im * this.im);
  }

  arg(): number {
    return Math.atan2(this.im, this.re);
  }

  toString(): string {
    const sign = this.im >= 0 ? '+' : '';
    return `${this.re.toFixed(3)}${sign}${this.im.toFixed(3)}j`;
  }
}
