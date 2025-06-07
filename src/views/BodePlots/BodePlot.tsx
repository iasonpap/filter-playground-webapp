import Plot from 'react-plotly.js';
import type { PlotData, Layout } from 'plotly.js';
import styles from './BodePlots.module.css';
import { BodePlotProps, TraceData } from '../../types/plotTypes';



export default function BodePlot({ traces, title, xLabel, yLabel }: BodePlotProps) {
    // Convert traces to Plotly format
    console.log('BodePlot traces:', traces);
    console.log('BodePlot title:', title);
    const plotData: Partial<PlotData>[] = traces.map(trace => ({
        x: trace.x,
        y: trace.y,
        name: trace.label,
        mode: 'lines',
        type: 'scatter'
    }));

    const layout: Partial<Layout> = {
        title: title,
        xaxis: { 
            title: xLabel,
            gridcolor: '#eee',
            type: 'log'  // for frequency response plots
        },
        yaxis: { 
            title: yLabel,
            gridcolor: '#eee'
        },
        paper_bgcolor: 'white',
        plot_bgcolor: 'white',
        margin: { t: 50, b: 50, l: 50, r: 50 },
        showlegend: true
    };
    
    
    return (
        <div className='app-row-2'>
            <div className={styles.plotContainer}>
                <Plot 
                    data={plotData}
                    layout={layout}
                    style={{ width: '100%', height: '100%' }}
                    className={styles.plot}
                    config={{ responsive: true }}
                />
            </div>
        </div>
        
    );
}