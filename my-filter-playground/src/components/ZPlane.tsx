import { useEffect, useRef } from 'react';
import Plot from 'react-plotly.js';
import { PoleZero } from '../utils/dsp';
import { BiquadSection } from '../models/FilterChain';

interface ZPlaneProps {
  biquads: BiquadSection[];
  onPoleZeroMove: (biquadId: string, poleZeroId: string, real: number, imag: number) => void;
  onPoleZeroAdd: (biquadId: string, real: number, imag: number, type: 'pole' | 'zero') => void;
}

export default function ZPlane({ biquads, onPoleZeroMove, onPoleZeroAdd }: ZPlaneProps) {
  // Generate unit circle data
  const generateUnitCircle = () => {
    const theta = Array.from({ length: 100 }, (_, i) => (2 * Math.PI * i) / 99);
    return {
      x: theta.map(t => Math.cos(t)),
      y: theta.map(t => Math.sin(t)),
      mode: 'lines',
      line: { color: '#ccc', width: 2 },
      name: 'Unit Circle',
      showlegend: false,
      hoverinfo: 'skip',
    };
  };

  // Generate axes data
  const generateAxes = () => [
    {
      x: [-1.5, 1.5],
      y: [0, 0],
      mode: 'lines',
      line: { color: '#ddd', width: 1 },
      showlegend: false,
      hoverinfo: 'skip',
    },
    {
      x: [0, 0],
      y: [-1.5, 1.5],
      mode: 'lines',
      line: { color: '#ddd', width: 1 },
      showlegend: false,
      hoverinfo: 'skip',
    },
  ];

  // Generate pole/zero traces for all biquads
  const generatePoleZeroTraces = () => {
    const traces: any[] = [];

    biquads.forEach(biquad => {
      if (!biquad.enabled) return;

      // Zeros (circles)
      if (biquad.zeros.length > 0) {
        traces.push({
          x: biquad.zeros.map(z => z.real),
          y: biquad.zeros.map(z => z.imag),
          mode: 'markers',
          marker: {
            symbol: 'circle-open',
            size: 15,
            color: biquad.color,
            line: { width: 3 },
          },
          name: `${biquad.name} - Zeros`,
          text: biquad.zeros.map((z, i) => `Zero ${i + 1}: ${z.real.toFixed(3)} ${z.imag >= 0 ? '+' : ''}${z.imag.toFixed(3)}j`),
          hoverinfo: 'text',
        });
      }

      // Poles (X marks)
      if (biquad.poles.length > 0) {
        traces.push({
          x: biquad.poles.map(p => p.real),
          y: biquad.poles.map(p => p.imag),
          mode: 'markers',
          marker: {
            symbol: 'x',
            size: 15,
            color: biquad.color,
            line: { width: 3 },
          },
          name: `${biquad.name} - Poles`,
          text: biquad.poles.map((p, i) => `Pole ${i + 1}: ${p.real.toFixed(3)} ${p.imag >= 0 ? '+' : ''}${p.imag.toFixed(3)}j`),
          hoverinfo: 'text',
        });
      }
    });

    return traces;
  };

  const data = [
    generateUnitCircle(),
    ...generateAxes(),
    ...generatePoleZeroTraces(),
  ];

  const layout = {
    title: 'Z-Plane (Pole-Zero Plot)',
    xaxis: {
      title: 'Real',
      range: [-1.5, 1.5],
      zeroline: false,
      showgrid: true,
      gridcolor: '#f0f0f0',
    },
    yaxis: {
      title: 'Imaginary',
      range: [-1.5, 1.5],
      zeroline: false,
      showgrid: true,
      gridcolor: '#f0f0f0',
      scaleanchor: 'x',
    },
    width: 600,
    height: 600,
    hovermode: 'closest',
    dragmode: 'pan',
    showlegend: true,
    legend: {
      x: 1.02,
      y: 1,
    },
  };

  const config = {
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
  };

  return (
    <div className="z-plane-container">
      <Plot
        data={data}
        layout={layout}
        config={config}
      />
      <div className="z-plane-controls">
        <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
          Click on the plot to add poles and zeros. Use the controls below to manage them.
        </p>
      </div>
    </div>
  );
}