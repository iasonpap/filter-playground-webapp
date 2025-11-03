import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
} from 'chart.js';
import styles from './Zplane.module.css';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

const data = { labels: ['A', 'B'], datasets: [{ label: 'X', data: [1, 2] }] };
const options = { responsive: true };


export default function Zplane() {
  return (
    <div className={styles.container}>
      <div className={styles.chartWrapper}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};
