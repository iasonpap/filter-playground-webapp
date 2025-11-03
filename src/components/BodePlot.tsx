import Plot from 'react-plotly.js';
import { BiquadSection } from '../models/FilterChain';
import { calculateBiquadFrequencyResponse, combineBiquadResponses } from '../utils/dsp';
import type { PlotData } from 'plotly.js';

interface BodePlotProps {
  biquads: BiquadSection[];
  sampleRate?: number;
  showIndividual?: boolean;
}

export default function BodePlot({ biquads, sampleRate = 48000, showIndividual = true }: BodePlotProps) {
  const enabledBiquads = biquads.filter(b => b.enabled);
  
  if (enabledBiquads.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
        <p>No enabled biquads. Add and enable a biquad section to see the frequency response.</p>
      </div>
    );
  }

  // Calculate individual responses
  const individualResponses = enabledBiquads.map(biquad =>
    calculateBiquadFrequencyResponse(biquad.coefficients, sampleRate)
  );

  // Calculate combined response
  const combinedResponse = combineBiquadResponses(individualResponses);

  // Create magnitude plot traces
  const magnitudeTraces: Partial<PlotData>[] = [];
  
  if (showIndividual) {
    enabledBiquads.forEach((biquad, idx) => {
      magnitudeTraces.push({
        x: individualResponses[idx].frequencies,
        y: individualResponses[idx].magnitude,
        name: biquad.name,
        mode: 'lines',
        line: {
          color: biquad.color,
          width: 1.5,
          dash: 'dot',
        },
        opacity: 0.6,
        showlegend: true,
      });
    });
  }

  // Add combined response trace
  if (enabledBiquads.length > 0) {
    magnitudeTraces.push({
      x: combinedResponse.frequencies,
      y: combinedResponse.magnitude,
      name: 'Combined',
      mode: 'lines',
      line: {
        color: '#FF6B6B',
        width: 3,
      },
      showlegend: true,
    });
  }

  // Create phase plot traces
  const phaseTraces: Partial<PlotData>[] = [];
  
  if (showIndividual) {
    enabledBiquads.forEach((biquad, idx) => {
      phaseTraces.push({
        x: individualResponses[idx].frequencies,
        y: individualResponses[idx].phase,
        name: biquad.name,
        mode: 'lines',
        line: {
          color: biquad.color,
          width: 1.5,
          dash: 'dot',
        },
        opacity: 0.6,
        showlegend: false,
      });
    });
  }

  // Add combined phase trace
  if (enabledBiquads.length > 0) {
    phaseTraces.push({
      x: combinedResponse.frequencies,
      y: combinedResponse.phase,
      name: 'Combined',
      mode: 'lines',
      line: {
        color: '#FF6B6B',
        width: 3,
      },
      showlegend: false,
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Plot
        data={magnitudeTraces}
        layout={{
          title: 'Magnitude Response',
          xaxis: {
            title: 'Frequency (Hz)',
            type: 'log',
            gridcolor: '#eee',
          },
          yaxis: {
            title: 'Magnitude (dB)',
            gridcolor: '#eee',
          },
          paper_bgcolor: 'white',
          plot_bgcolor: 'white',
          margin: { t: 50, b: 50, l: 60, r: 20 },
          height: 300,
          showlegend: true,
          legend: {
            x: 1.02,
            y: 1,
          },
        }}
        config={{
          responsive: true,
          displayModeBar: true,
          displaylogo: false,
        }}
        style={{ width: '100%' }}
      />
      
      <Plot
        data={phaseTraces}
        layout={{
          title: 'Phase Response',
          xaxis: {
            title: 'Frequency (Hz)',
            type: 'log',
            gridcolor: '#eee',
          },
          yaxis: {
            title: 'Phase (degrees)',
            gridcolor: '#eee',
          },
          paper_bgcolor: 'white',
          plot_bgcolor: 'white',
          margin: { t: 50, b: 50, l: 60, r: 20 },
          height: 300,
          showlegend: false,
        }}
        config={{
          responsive: true,
          displayModeBar: true,
          displaylogo: false,
        }}
        style={{ width: '100%' }}
      />
    </div>
  );
}
