import { useState } from 'react';
import './App.css';
import { FilterChain, BiquadSection } from './models/FilterChain';
import BiquadList from './components/BiquadList';
import ZPlaneChart from './components/ZPlaneChart';
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

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Interactive Filter Playground</h1>
        <p>Design and visualize digital filters in real-time</p>
      </header>

      <div className="main-layout">
        {/* Left Column: Biquad List and Controls */}
        <div className="sidebar">
          <BiquadList
            biquads={biquads}
            selectedBiquadId={selectedBiquadId}
            onSelectBiquad={setSelectedBiquadId}
            onAddBiquad={handleAddBiquad}
            onRemoveBiquad={handleRemoveBiquad}
            onToggleBiquad={handleToggleBiquad}
            onRenameBiquad={handleRenameBiquad}
          />

          <div className="sample-rate-control">
            <label htmlFor="sample-rate">
              Sample Rate (Hz):
              <input
                type="number"
                id="sample-rate"
                value={sampleRate}
                onChange={(e) => setSampleRate(Number(e.target.value))}
                min="8000"
                max="192000"
                step="1000"
              />
            </label>
          </div>
        </div>

        {/* Middle Column: Z-Plane */}
        <div className="middle-panel">
          <ZPlaneChart
            biquads={biquads}
            selectedBiquadId={selectedBiquadId}
            onPoleZeroMove={handlePoleZeroMove}
            onPoleZeroAdd={handlePoleZeroAdd}
          />
        </div>

        {/* Right Column: Frequency Response */}
        <div className="right-panel">
          <BodePlot
            biquads={biquads}
            sampleRate={sampleRate}
            showIndividual={true}
          />
        </div>
      </div>

      <footer className="app-footer">
        <p>
          Inspired by{' '}
          <a href="https://imdea.ant-novak.com/DF/Ztransform/" target="_blank" rel="noopener noreferrer">
            imdea.ant-novak.com
          </a>
          {' '}and{' '}
          <a href="https://github.com/dsego/complex-plane" target="_blank" rel="noopener noreferrer">
            dsego/complex-plane
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
