import { useState } from 'react'
import './App.css'
import { TestPlotly } from './components/BodePlots/TestPlotly'
import { TestChartJS } from './components/InteractiveCharts/TestChartJS'
import { ThemeToggle } from './components/ThemeToggle/ThemeToggle'

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return (
    <>
      <ThemeToggle theme={theme} onToggle={toggleTheme} />
      <TestPlotly theme={theme} />
      <TestChartJS theme={theme} />
      <footer>
        <p>© 2025 Filter Playground</p>
      </footer>
    </>
  )
}

export default App
