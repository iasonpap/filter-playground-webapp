import TestChartJS from './views/InteractiveCharts/TestChartJS'
import FilterDesignUI from './views/FilterDesigner/FilterDesignUI'
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
    
    <div className='main-app-layout'>
      <div className="app-col-1">
        <div className="app-row-1">
            <FilterDesignUI />
            <TestChartJS />
        </div>
        <BodePlot {...dummyProps} />
      </div>
      <div className="app-col-2">
        <h1>3D Transfer Function</h1>
      </div>
    </div>
  )
}

export default App
