// ============================================================================
// COMPLEX NUMBER UTILITIES (Minimal, Fast)
// ============================================================================

export default class Complex {
    re: number;
    im: number;
    
    constructor(re: number = 0, im: number = 0) {
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
    
    static exp(theta: number): Complex {
        return new Complex(Math.cos(theta), Math.sin(theta));
    }
    
    abs(): number {
        return Math.sqrt(this.re * this.re + this.im * this.im);
    }
    
    arg(): number {
        return Math.atan2(this.im, this.re);
    }
    
    conj(): Complex {
        return new Complex(this.re, -this.im);
    }
}