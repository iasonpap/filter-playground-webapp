import { useState } from 'react'
import './App.css'

import TestPlotly from './components/BodePlots/TestPlotly'
import TestChartJS from './components/InteractiveCharts/TestChartJS'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <TestPlotly />
      <TestChartJS />
    </>
  )
}

export default App
