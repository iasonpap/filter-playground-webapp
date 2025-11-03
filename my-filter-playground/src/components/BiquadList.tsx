import React, { useState } from 'react';

interface BiquadSection {
  id: number;
  name: string;
  active: boolean;
  color: string;
}

const BiquadList: React.FC = () => {
  const [biquadSections, setBiquadSections] = useState<BiquadSection[]>([]);
  const [nextId, setNextId] = useState<number>(1);

  const addSection = () => {
    const newSection: BiquadSection = {
      id: nextId,
      name: `Biquad ${nextId}`,
      active: false,
      color: 'grey'
    };
    setBiquadSections([...biquadSections, newSection]);
    setNextId(nextId + 1);
  };

  const removeSection = (id: number) => {
    setBiquadSections(biquadSections.filter(section => section.id !== id));
  };

  const toggleSection = (id: number) => {
    setBiquadSections(biquadSections.map(section => 
      section.id === id ? { ...section, active: !section.active, color: section.active ? 'grey' : 'green' } : section
    ));
  };

  const renameSection = (id: number, newName: string) => {
    setBiquadSections(biquadSections.map(section => 
      section.id === id ? { ...section, name: newName } : section
    ));
  };

  return (
    <div>
      <h2>Biquad Sections</h2>
      <button onClick={addSection}>Add Biquad Section</button>
      <ul>
        {biquadSections.map(section => (
          <li key={section.id} style={{ color: section.color }}>
            {section.name}
            <button onClick={() => toggleSection(section.id)}>Toggle</button>
            <button onClick={() => removeSection(section.id)}>Remove</button>
            <button onClick={() => renameSection(section.id, prompt('New name:', section.name) || section.name)}>Rename</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BiquadList;