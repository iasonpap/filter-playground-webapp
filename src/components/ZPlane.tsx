import { useState } from 'react';
import Plot from 'react-plotly.js';
import type { PlotMouseEvent } from 'plotly.js';
import { BiquadSection } from '../models/FilterChain';

interface ZPlaneProps {
  biquads: BiquadSection[];
  onPoleZeroMove: (biquadId: string, poleZeroId: string, real: number, imag: number) => void;
  onPoleZeroAdd: (biquadId: string, real: number, imag: number, type: 'pole' | 'zero') => void;
}

export default function ZPlane({ biquads, onPoleZeroMove, onPoleZeroAdd }: ZPlaneProps) {
  const [addMode, setAddMode] = useState<'pole' | 'zero' | null>(null);
  const [selectedBiquadId, setSelectedBiquadId] = useState<string | null>(
    biquads.length > 0 ? biquads[0].id : null
  );

  // Generate unit circle data
  const generateUnitCircle = () => {
    const theta = Array.from({ length: 100 }, (_, i) => (2 * Math.PI * i) / 99);
    return {
      x: theta.map(t => Math.cos(t)),
      y: theta.map(t => Math.sin(t)),
      mode: 'lines' as const,
      line: { color: '#ccc', width: 2 },
      name: 'Unit Circle',
      showlegend: false,
      hoverinfo: 'skip' as const,
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
    const traces: Array<Record<string, unknown>> = [];

    biquads.forEach((biquad) => {
      if (!biquad.enabled) return;

      // Zeros (circles) - one trace per zero for individual dragging
      if (biquad.zeros.length > 0) {
        biquad.zeros.forEach((zero, idx) => {
          traces.push({
            x: [zero.real],
            y: [zero.imag],
            mode: 'markers' as const,
            marker: {
              symbol: 'circle-open',
              size: 15,
              color: biquad.color,
              line: { width: 3 },
            },
            name: `${biquad.name} - Zero ${idx + 1}`,
            text: `Zero: ${zero.real.toFixed(3)} ${zero.imag >= 0 ? '+' : ''}${zero.imag.toFixed(3)}j`,
            hoverinfo: 'text' as const,
            customdata: [{ biquadId: biquad.id, poleZeroId: zero.id, type: 'zero' }],
          });
        });
      }

      // Poles (X marks) - one trace per pole for individual dragging
      if (biquad.poles.length > 0) {
        biquad.poles.forEach((pole, idx) => {
          traces.push({
            x: [pole.real],
            y: [pole.imag],
            mode: 'markers' as const,
            marker: {
              symbol: 'x',
              size: 15,
              color: biquad.color,
              line: { width: 3 },
            },
            name: `${biquad.name} - Pole ${idx + 1}`,
            text: `Pole: ${pole.real.toFixed(3)} ${pole.imag >= 0 ? '+' : ''}${pole.imag.toFixed(3)}j`,
            hoverinfo: 'text' as const,
            customdata: [{ biquadId: biquad.id, poleZeroId: pole.id, type: 'pole' }],
          });
        });
      }
    });

    return traces;
  };

  const handlePlotClick = (event: Readonly<PlotMouseEvent>) => {
    if (!addMode || !selectedBiquadId) return;
    
    const point = event.points[0];
    if (!point) return;

    // Check if we clicked on the background (not on a marker)
    if (point.data.mode === 'lines') {
      const x = point.x as number;
      const y = point.y as number;
      
      onPoleZeroAdd(selectedBiquadId, x, y, addMode);
      setAddMode(null); // Reset add mode after adding
    }
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
      scaleanchor: 'x' as const,
    },
    width: 600,
    height: 600,
    hovermode: 'closest' as const,
    dragmode: addMode ? ('pan' as const) : ('zoom' as const),
    showlegend: false,
  };

  const config = {
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['lasso2d' as const, 'select2d' as const],
  };

  return (
    <div className="z-plane-container">
      <Plot
        data={data}
        layout={layout}
        config={config}
        onClick={handlePlotClick}
        style={{ width: '100%', height: '100%' }}
      />
      <div className="z-plane-controls" style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setAddMode(addMode === 'pole' ? null : 'pole')}
            style={{
              padding: '8px 16px',
              backgroundColor: addMode === 'pole' ? '#FF6B6B' : '#fff',
              color: addMode === 'pole' ? '#fff' : '#333',
              border: '2px solid #FF6B6B',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            {addMode === 'pole' ? '✓ Adding Pole' : 'Add Pole (X)'}
          </button>
          <button
            onClick={() => setAddMode(addMode === 'zero' ? null : 'zero')}
            style={{
              padding: '8px 16px',
              backgroundColor: addMode === 'zero' ? '#4ECDC4' : '#fff',
              color: addMode === 'zero' ? '#fff' : '#333',
              border: '2px solid #4ECDC4',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            {addMode === 'zero' ? '✓ Adding Zero' : 'Add Zero (O)'}
          </button>
        </div>
        
        {biquads.length > 1 && (
          <select
            value={selectedBiquadId || ''}
            onChange={(e) => setSelectedBiquadId(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '2px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            {biquads.map(bq => (
              <option key={bq.id} value={bq.id}>
                Add to: {bq.name}
              </option>
            ))}
          </select>
        )}
      </div>
      
      <p style={{ fontSize: '14px', color: '#666', marginTop: '10px', textAlign: 'center' }}>
        {addMode 
          ? `Click on the plot to add a ${addMode}. Click the button again to cancel.`
          : 'Click "Add Pole" or "Add Zero" button, then click on the plot to place it.'
        }
      </p>
    </div>
  );
}