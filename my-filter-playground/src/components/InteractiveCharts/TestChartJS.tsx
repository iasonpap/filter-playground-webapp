import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
} from 'chart.js';
import styles from './InteractiveCharts.module.css';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

export const TestChartJS = ({ theme = 'light' }: { theme?: 'light' | 'dark' }) => {
  const data = { 
    labels: ['A', 'B'], 
    datasets: [{ 
      label: 'X', 
      data: [1, 2],
      borderColor: theme === 'dark' ? '#4d94ff' : '#007bff'
    }] 
  };

  const options = { 
    responsive: true,
    scales: {
      x: {
        grid: { color: theme === 'dark' ? '#444' : '#eee' },
        ticks: { color: theme === 'dark' ? '#fff' : '#444' }
      },
      y: {
        grid: { color: theme === 'dark' ? '#444' : '#eee' },
        ticks: { color: theme === 'dark' ? '#fff' : '#444' }
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.chartWrapper} data-theme={theme}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};
