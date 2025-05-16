import './App.css'

import TestChartJS from './views/InteractiveCharts/TestChartJS'
import FilterDesigner from './views/FilterDesigner/FilterDesigner'
import BodePlot from './views/BodePlots/BodePlot'

import { BodePlotProps, TraceData } from './types/plotTypes'

const dummyProps: BodePlotProps = {
  traces: [
    {
        x: [1, 2, 3, 4],
        y: [10, 20, 30, 40],
        label: 'Magnitude'
    },
    {
        x: [1, 2, 3, 4],
        y: [5, 15, 25, 35],
        label: 'Phase'
    }
  ],
  title: 'Bode Plot',
  xLabel: 'Frequency (Hz)',
  yLabel: 'Magnitude (dB)'
}

function App() {
  return (
    <>
      <FilterDesigner />
      <BodePlot {...dummyProps} />
      <TestChartJS />
    </>
  )
}

export default App
