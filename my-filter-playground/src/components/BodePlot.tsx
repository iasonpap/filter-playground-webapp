import React from 'react';
import { Plot } from 'react-plotly.js';

// Function to compute frequency response of a biquad filter
const calculateBiquadResponse = (b: number[], a: number[], freq: number[]): { magnitude: number[], phase: number[] } => {
    const magnitude = [];  
    const phase = [];
    const w = freq.map(f => 2 * Math.PI * f);

    // Calculate response at each frequency
    for (let i = 0; i < w.length; i++) {
        const numerator = b.reduce((acc, bi, idx) => acc + bi * Math.pow(Math.complex(0, w[i]), idx), 0);
        const denominator = a.reduce((acc, ai, idx) => acc + ai * Math.pow(Math.complex(0, w[i]), idx), 0);
        const response = numerator / denominator;
        magnitude.push(20 * Math.log10(Math.abs(response)));
        phase.push(Math.atan2(response.im, response.re) * (180 / Math.PI));
    }
    return { magnitude, phase };
};

// BodePlot component
const BodePlot: React.FC<{ biquadCoefficients: Array<{ b: number[], a: number[] }> }> = ({ biquadCoefficients }) => {
    const frequencies = Array.from({ length: 100 }, (_, i) => i / 100); // Normalized frequency from 0 to 1
    const combinedMagnitude = new Array(frequencies.length).fill(0);
    const combinedPhase = new Array(frequencies.length).fill(0);

    // Calculate responses for each biquad
    biquadCoefficients.forEach(({ b, a }) => {
        const response = calculateBiquadResponse(b, a, frequencies);

        response.magnitude.forEach((mag, i) => {
            combinedMagnitude[i] += mag;
            combinedPhase[i] += response.phase[i];
        });
    });

    return (
        <div>
            <h2>Bode Plot</h2>
            <Plot
                data={[
                    {
                        x: frequencies,
                        y: combinedMagnitude,
                        type: 'scatter',
                        mode: 'lines',
                        name: 'Magnitude',
                    },
                    {
                        x: frequencies,
                        y: combinedPhase,
                        type: 'scatter',
                        mode: 'lines',
                        name: 'Phase',
                    },
                ]}
                layout={{ title: 'Bode Plot', xaxis: { title: 'Normalized Frequency (0 to 1)' }, yaxis: { title: 'Magnitude (dB) / Phase (degrees)', rangemode: 'tozero' } }}
            />
        </div>
    );
};

export default BodePlot;
