import { useRef, useMemo } from 'react';
import { Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { BiquadSection } from '../models/FilterChain';

// Import and register the dragdata plugin
import 'chartjs-plugin-dragdata';

// Register Chart.js components
ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

interface ZPlaneChartProps {
  biquads: BiquadSection[];
  selectedBiquadId: string | null;
  onPoleZeroMove: (biquadId: string, poleZeroId: string, real: number, imag: number) => void;
  onPoleZeroAdd: (biquadId: string, real: number, imag: number, type: 'pole' | 'zero') => void;
}

export default function ZPlaneChart({
  biquads,
  selectedBiquadId,
  onPoleZeroMove,
  onPoleZeroAdd,
}: ZPlaneChartProps) {
  const chartRef = useRef(null);

  // Generate unit circle points
  const generateUnitCircle = () => {
    const N = 100;
    return Array.from({ length: N + 1 }, (_, i) => ({
      x: Math.cos((2 * Math.PI * i) / N),
      y: Math.sin((2 * Math.PI * i) / N),
    }));
  };

  // Round to prevent floating point issues
  const myRound = (num: number, precision: number = 5) => {
    const factor = Math.pow(10, precision);
    return Math.round(num * factor) / factor;
  };

  // Build datasets for Chart.js
  const datasets = useMemo(() => {
    const result: any[] = [];

    // Unit circle (not draggable)
    result.push({
      label: 'Unit Circle',
      borderColor: '#ccc',
      backgroundColor: 'transparent',
      data: generateUnitCircle(),
      showLine: true,
      pointRadius: 0,
      dragData: false,
      pointHoverRadius: 0,
    });

    // Add axes
    result.push({
      label: 'X-axis',
      borderColor: '#e0e0e0',
      backgroundColor: 'transparent',
      data: [
        { x: -1.2, y: 0 },
        { x: 1.2, y: 0 },
      ],
      showLine: true,
      pointRadius: 0,
      dragData: false,
      pointHoverRadius: 0,
    });

    result.push({
      label: 'Y-axis',
      borderColor: '#e0e0e0',
      backgroundColor: 'transparent',
      data: [
        { x: 0, y: -1.2 },
        { x: 0, y: 1.2 },
      ],
      showLine: true,
      pointRadius: 0,
      dragData: false,
      pointHoverRadius: 0,
    });

    // Add poles and zeros for each biquad
    biquads.forEach((biquad) => {
      if (!biquad.enabled) return;

      // Zeros (circles)
      if (biquad.zeros.length > 0) {
        result.push({
          label: `${biquad.name} - Zeros`,
          borderColor: biquad.color,
          backgroundColor: 'transparent',
          data: biquad.zeros.map((z) => ({ x: z.real, y: z.imag })),
          pointRadius: 8,
          pointStyle: 'circle',
          borderWidth: 3,
          hoverRadius: 10,
          hoverBorderWidth: 4,
          dragData: true,
          showLine: false,
          // Store metadata for drag callbacks
          biquadId: biquad.id,
          poleZeroIds: biquad.zeros.map((z) => z.id),
          poleZeroType: 'zero',
        });
      }

      // Poles (X marks)
      if (biquad.poles.length > 0) {
        result.push({
          label: `${biquad.name} - Poles`,
          borderColor: biquad.color,
          backgroundColor: 'transparent',
          data: biquad.poles.map((p) => ({ x: p.real, y: p.imag })),
          pointRadius: 8,
          pointStyle: 'crossRot',
          borderWidth: 3,
          hoverRadius: 10,
          hoverBorderWidth: 4,
          dragData: true,
          showLine: false,
          // Store metadata for drag callbacks
          biquadId: biquad.id,
          poleZeroIds: biquad.poles.map((p) => p.id),
          poleZeroType: 'pole',
        });
      }
    });

    return result;
  }, [biquads]);

  const options: ChartOptions<'scatter'> = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1,
    animation: {
      duration: 0,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context) => {
            const dataset = context.dataset as any;
            if (dataset.dragData === false) return '';
            const x = myRound(context.parsed.x, 3);
            const y = myRound(context.parsed.y, 3);
            return `${dataset.label}: ${x} ${y >= 0 ? '+' : ''}${y}j`;
          },
        },
      },
      dragData: {
        round: 5,
        showTooltip: false,
        dragX: true,
        dragY: true,
        onDragStart: (_e: any, datasetIndex: number, _index: number, _value: any) => {
          const dataset = datasets[datasetIndex] as any;
          // Only allow dragging if dragData is true
          return dataset.dragData === true;
        },
        onDrag: (_e: any, datasetIndex: number, index: number, value: any) => {
          const dataset = datasets[datasetIndex] as any;
          if (!dataset.dragData) return false;

          let x = value.x;
          let y = value.y;

          // Snap to zero if close to axis
          if (Math.abs(y) < 0.03) y = 0;
          if (Math.abs(x) < 0.03) x = 0;

          // For poles, constrain to inside unit circle
          if (dataset.poleZeroType === 'pole') {
            const magnitude = Math.sqrt(x * x + y * y);
            if (magnitude > 0.99) {
              const angle = Math.atan2(y, x);
              x = 0.99 * Math.cos(angle);
              y = 0.99 * Math.sin(angle);
            }
          }

          // Round values
          x = myRound(x, 5);
          y = myRound(y, 5);

          // Update the dragged point
          value.x = x;
          value.y = y;

          // Handle complex conjugate pairs (assuming they come in pairs)
          if (Math.abs(y) > 0 && dataset.data.length > 1) {
            const conjugateIndex = 1 - index; // Toggle between 0 and 1
            if (conjugateIndex >= 0 && conjugateIndex < dataset.data.length) {
              dataset.data[conjugateIndex].x = x;
              dataset.data[conjugateIndex].y = -y;
            }
          }

          return true;
        },
        onDragEnd: (_e: any, datasetIndex: number, index: number, value: any) => {
          const dataset = datasets[datasetIndex] as any;
          if (!dataset.dragData) return;

          const biquadId = dataset.biquadId;
          const poleZeroId = dataset.poleZeroIds[index];

          if (biquadId && poleZeroId) {
            onPoleZeroMove(biquadId, poleZeroId, value.x, value.y);

            // Also update conjugate if exists
            if (Math.abs(value.y) > 0 && dataset.data.length > 1) {
              const conjugateIndex = 1 - index;
              const conjugatePoleZeroId = dataset.poleZeroIds[conjugateIndex];
              if (conjugatePoleZeroId) {
                onPoleZeroMove(biquadId, conjugatePoleZeroId, value.x, -value.y);
              }
            }
          }
        },
      } as any,
    },
    scales: {
      x: {
        type: 'linear',
        title: {
          display: true,
          text: 'Real',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        min: -1.2,
        max: 1.2,
        grid: {
          color: '#f0f0f0',
        },
      },
      y: {
        type: 'linear',
        title: {
          display: true,
          text: 'Imaginary',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        min: -1.2,
        max: 1.2,
        grid: {
          color: '#f0f0f0',
        },
      },
    },
  };

  const chartData = {
    datasets,
  };

  return (
    <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
      <h3 style={{ textAlign: 'center', marginBottom: '16px', color: '#333' }}>Z-Plane</h3>
      <Scatter ref={chartRef} data={chartData} options={options} />
      <p style={{ textAlign: 'center', fontSize: '14px', color: '#666', marginTop: '12px' }}>
        Drag poles (X) and zeros (O) to adjust the filter. Poles are constrained inside the unit circle.
      </p>
    </div>
  );
}
