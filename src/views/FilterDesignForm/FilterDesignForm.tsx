import { useState } from 'react';
import { SelectField,  } from '@react-ui-org/react-ui';
import './FilterDesignUI.module.css';

export default function FilterDesignForm() {
  const [filterType, setFilterType] = useState<string>('--');
  const [sampleFrequency, setSampleFrequency] = useState<number>(48000);

  return (
    <form className='filter-design-ui'>
        <label>
            Fs:
            <input 
                type="number" 
                name="sample-frequency" 
                id="sample-frequency" 
                aria-label="Sample Frequency (Hz)"
                value={sampleFrequency}
                onChange={(e) => setSampleFrequency(Number(e.target.value))}
            />
        </label>
        <label htmlFor="filter-select">Filter Type:</label>
        <select 
            id="filter-select" 
            name="filter-select" 
            aria-label="Filter Type"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            >
                <option value="--">Select BQ Filter</option>
                <option value="lowpass">Low Pass</option>
                <option value="highpass">High Pass</option>
                <option value="allpass">All Pass</option>
            </select>
    </form>
  )
}
