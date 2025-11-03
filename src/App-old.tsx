import { useState } from 'react';
import './App.css';
import { FilterChain, BiquadSection } from './models/FilterChain';
import BiquadList from './components/BiquadList';
import ZPlane from './components/ZPlane';
import BodePlot from './components/BodePlot';
import { PoleZero, generateId } from './utils/dsp';

function App() {
  const [filterChain] = useState(() => new FilterChain());
  const [biquads, setBiquads] = useState<BiquadSection[]>(filterChain.getAllBiquads());
  const [selectedBiquadId, setSelectedBiquadId] = useState<string | null>(
    biquads.length > 0 ? biquads[0].id : null
  );
  const [sampleRate, setSampleRate] = useState(48000);

  const refreshBiquads = () => {
    setBiquads([...filterChain.getAllBiquads()]);
  };

  const handleAddBiquad = () => {
    const newBiquad = filterChain.addBiquad();
    refreshBiquads();
    setSelectedBiquadId(newBiquad.id);
  };

  const handleRemoveBiquad = (id: string) => {
    filterChain.removeBiquad(id);
    refreshBiquads();
    if (selectedBiquadId === id) {
      const remaining = filterChain.getAllBiquads();
      setSelectedBiquadId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleToggleBiquad = (id: string) => {
    filterChain.toggleBiquad(id);
    refreshBiquads();
  };

  const handleRenameBiquad = (id: string, name: string) => {
    filterChain.renameBiquad(id, name);
    refreshBiquads();
  };

  const handlePoleZeroMove = (biquadId: string, poleZeroId: string, real: number, imag: number) => {
    filterChain.updatePoleZeroPosition(biquadId, poleZeroId, real, imag);
    refreshBiquads();
  };

  const handlePoleZeroAdd = (biquadId: string, real: number, imag: number, type: 'pole' | 'zero') => {
    const poleZero: PoleZero = {
      id: generateId(),
      real,
      imag,
      type,
    };
    filterChain.addPoleZero(biquadId, poleZero);
    refreshBiquads();
  };

  const handleAddPole = useCallback((re: number, im: number) => {
    const newId = `p${Date.now()}`;
    setPoles(prev => [...prev, { id: newId, re, im }]);
  }, []);

  const handleAddZero = useCallback((re: number, im: number) => {
    const newId = `z${Date.now()}`;
    setZeros(prev => [...prev, { id: newId, re, im }]);
  }, []);

  const handleDeletePole = useCallback((id: string) => {
    setPoles(prev => prev.filter(p => p.id !== id));
  }, []);

  const handleDeleteZero = useCallback((id: string) => {
    setZeros(prev => prev.filter(z => z.id !== id));
  }, []);

  const response = getFrequencyResponse();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        Interactive Filter Playground
      </Typography>
      
      <Grid container spacing={3}>
        {/* Left Column: Controls and Z-Plane */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <FilterControls
              gain={gain}
              setGain={setGain}
              sampleRate={sampleRate}
              setSampleRate={setSampleRate}
              zeros={zeros}
              poles={poles}
              onDeletePole={handleDeletePole}
              onDeleteZero={handleDeleteZero}
            />
          </Paper>
          
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Z-Plane
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Drag poles (×) and zeros (○) or click to add new ones
            </Typography>
            <ZPlaneInteractive
              zeros={zeros}
              poles={poles}
              onPoleMove={handlePoleMove}
              onZeroMove={handleZeroMove}
              onAddPole={handleAddPole}
              onAddZero={handleAddZero}
            />
          </Paper>
        </Grid>

        {/* Right Column: Frequency Response */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Frequency Response
            </Typography>
            <FrequencyResponse
              freq={Array.from(response.freq)}
              magnitude={Array.from(response.magnitude)}
              phase={Array.from(response.phase)}
            />
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Inspired by{' '}
          <a href="https://imdea.ant-novak.com/DF/Ztransform/" target="_blank" rel="noopener noreferrer">
            imdea.ant-novak.com
          </a>
          {' '}and{' '}
          <a href="https://dsego.github.io/complex-plane/" target="_blank" rel="noopener noreferrer">
            dsego/complex-plane
          </a>
        </Typography>
      </Box>
    </Container>
  )
}

export default App
