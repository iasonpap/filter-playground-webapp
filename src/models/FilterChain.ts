// FilterChain.ts - Model for managing multiple biquad filters in cascade

import { PoleZero, BiquadCoefficients, poleZeroToBiquad, generateId } from '../utils/dsp';

export interface BiquadSection {
  id: string;
  name: string;
  enabled: boolean;
  poles: PoleZero[];
  zeros: PoleZero[];
  coefficients: BiquadCoefficients;
  color: string;
}

export class FilterChain {
  private biquads: BiquadSection[] = [];
  private colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
  ];

  constructor() {
    // Initialize with one default biquad
    this.addBiquad();
  }

  addBiquad(name?: string): BiquadSection {
    const id = generateId();
    const colorIndex = this.biquads.length % this.colors.length;
    
    // Create default poles and zeros for a basic filter
    const defaultPoles: PoleZero[] = [
      { id: generateId(), real: 0.5, imag: 0.5, type: 'pole' },
      { id: generateId(), real: 0.5, imag: -0.5, type: 'pole' },
    ];
    
    const defaultZeros: PoleZero[] = [
      { id: generateId(), real: -0.5, imag: 0.5, type: 'zero' },
      { id: generateId(), real: -0.5, imag: -0.5, type: 'zero' },
    ];
    
    const newBiquad: BiquadSection = {
      id,
      name: name || `Biquad ${this.biquads.length + 1}`,
      enabled: true,
      poles: defaultPoles,
      zeros: defaultZeros,
      coefficients: { b0: 1, b1: 0, b2: 0, a1: 0, a2: 0 },
      color: this.colors[colorIndex],
    };

    // Calculate initial coefficients
    this.recalculateCoefficients(id);
    
    this.biquads.push(newBiquad);
    return newBiquad;
  }

  removeBiquad(id: string): void {
    this.biquads = this.biquads.filter(bq => bq.id !== id);
  }

  getBiquad(id: string): BiquadSection | undefined {
    return this.biquads.find(bq => bq.id === id);
  }

  getAllBiquads(): BiquadSection[] {
    return [...this.biquads];
  }

  getEnabledBiquads(): BiquadSection[] {
    return this.biquads.filter(bq => bq.enabled);
  }

  updateBiquadPoles(id: string, poles: PoleZero[]): void {
    const biquad = this.getBiquad(id);
    if (biquad) {
      biquad.poles = poles;
      this.recalculateCoefficients(id);
    }
  }

  updateBiquadZeros(id: string, zeros: PoleZero[]): void {
    const biquad = this.getBiquad(id);
    if (biquad) {
      biquad.zeros = zeros;
      this.recalculateCoefficients(id);
    }
  }

  addPoleZero(biquadId: string, poleZero: PoleZero): void {
    const biquad = this.getBiquad(biquadId);
    if (!biquad) return;

    if (poleZero.type === 'pole') {
      biquad.poles.push(poleZero);
    } else {
      biquad.zeros.push(poleZero);
    }
    
    this.recalculateCoefficients(biquadId);
  }

  removePoleZero(biquadId: string, poleZeroId: string): void {
    const biquad = this.getBiquad(biquadId);
    if (!biquad) return;

    biquad.poles = biquad.poles.filter(p => p.id !== poleZeroId);
    biquad.zeros = biquad.zeros.filter(z => z.id !== poleZeroId);
    
    this.recalculateCoefficients(biquadId);
  }

  updatePoleZeroPosition(biquadId: string, poleZeroId: string, real: number, imag: number): void {
    const biquad = this.getBiquad(biquadId);
    if (!biquad) return;

    const poleZero = [...biquad.poles, ...biquad.zeros].find(pz => pz.id === poleZeroId);
    if (poleZero) {
      poleZero.real = real;
      poleZero.imag = imag;
      this.recalculateCoefficients(biquadId);
    }
  }

  toggleBiquad(id: string): void {
    const biquad = this.getBiquad(id);
    if (biquad) {
      biquad.enabled = !biquad.enabled;
    }
  }

  private recalculateCoefficients(biquadId: string): void {
    const biquad = this.getBiquad(biquadId);
    if (!biquad) return;

    biquad.coefficients = poleZeroToBiquad(biquad.zeros, biquad.poles);
  }

  renameBiquad(id: string, name: string): void {
    const biquad = this.getBiquad(id);
    if (biquad) {
      biquad.name = name;
    }
  }

  clearAll(): void {
    this.biquads = [];
  }
}