import Plotly from 'plotly.js-dist-min';
import { useEffect } from 'react';
import styles from './BodePlots.module.css';

interface TestPlotlyProps {
  theme?: 'light' | 'dark';
}

export const TestPlotly = ({ theme = 'light' }: TestPlotlyProps) => {
  useEffect(() => {
    const trace = {
      x: [1, 2, 3],
      y: [2, 6, 3],
      type: 'scatter'
    };

    const layout = {
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: { color: theme === 'dark' ? '#fff' : '#444' },
      xaxis: { gridcolor: theme === 'dark' ? '#444' : '#eee' },
      yaxis: { gridcolor: theme === 'dark' ? '#444' : '#eee' }
    };

    Plotly.newPlot('plotlyDiv', [trace], layout, { responsive: true });
  }, [theme]);

  return <div id="plotlyDiv" className={styles.plotContainer} data-theme={theme}></div>;
};