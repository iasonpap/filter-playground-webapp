import Zplane from './views/Zplane/Zplane'
import FilterDesignUI from './views/FilterDesignForm/FilterDesignUI'
import BodePlot from './views/BodePlots/BodePlot'
import Box from '@mui/material/Box'

import { BodePlotProps, TraceData } from './types/plotTypes'
import Typography from '@mui/material/Typography'

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

export default function App() {
  return (
    <Box id="app-main-layout">
        <Box id="app-row-1">
            <Box id="app-col-1">
                <FilterDesignUI />
            </Box>
        </Box>
        <Box id="app-row-2">
            <BodePlot {...dummyProps} />
        </Box>
    </Box>
    
  );
}