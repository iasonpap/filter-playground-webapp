import Plot from 'react-plotly.js';
import type { PlotData, Layout } from 'plotly.js';
import styles from './BodePlots.module.css';


const data: PlotData[] = [{
    x: [1, 2, 3, 4],
    y: [10, 15, 13, 17],
    type: 'scatter',
    mode: 'lines+markers',
    name: 'Series 1'
}];

const layout: Partial<Layout> = {
    title: 'Example Plot',
    xaxis: { 
        title: 'X Axis',
        gridcolor: '#eee'
    },
    yaxis: { 
        title: 'Y Axis',
        gridcolor: '#eee'
    },
    paper_bgcolor: 'white',
    plot_bgcolor: 'white',
    margin: { t: 50, b: 50, l: 50, r: 50 }
};

export default function TestPlotly() {
    return (
        <div className={styles.plotContainer}>
            <Plot 
                data={data}
                layout={layout}
                style={{ width: '100%', height: '100%' }}
                className={styles.plot}
                config={{ responsive: true}}
            />
        </div>
    );
}