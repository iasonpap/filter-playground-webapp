import { BiquadSection } from '../models/FilterChain';
import './BiquadList.css';

interface BiquadListProps {
  biquads: BiquadSection[];
  selectedBiquadId: string | null;
  onSelectBiquad: (id: string) => void;
  onAddBiquad: () => void;
  onRemoveBiquad: (id: string) => void;
  onToggleBiquad: (id: string) => void;
  onRenameBiquad: (id: string, name: string) => void;
}

export default function BiquadList({
  biquads,
  selectedBiquadId,
  onSelectBiquad,
  onAddBiquad,
  onRemoveBiquad,
  onToggleBiquad,
  onRenameBiquad,
}: BiquadListProps) {
  return (
    <div className="biquad-list">
      <div className="biquad-list-header">
        <h3>Filter Chain</h3>
        <button onClick={onAddBiquad} className="add-button">
          + Add Biquad
        </button>
      </div>
      
      <div className="biquad-sections">
        {biquads.length === 0 ? (
          <p className="empty-message">No biquad sections. Add one to get started!</p>
        ) : (
          biquads.map((biquad) => (
            <div
              key={biquad.id}
              className={`biquad-item ${selectedBiquadId === biquad.id ? 'selected' : ''} ${!biquad.enabled ? 'disabled' : ''}`}
              onClick={() => onSelectBiquad(biquad.id)}
            >
              <div
                className="biquad-color-indicator"
                style={{ backgroundColor: biquad.color }}
              />
              
              <div className="biquad-info">
                <input
                  type="text"
                  value={biquad.name}
                  onChange={(e) => {
                    e.stopPropagation();
                    onRenameBiquad(biquad.id, e.target.value);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="biquad-name-input"
                />
                <div className="biquad-stats">
                  <span>{biquad.poles.length} poles</span>
                  <span>{biquad.zeros.length} zeros</span>
                </div>
              </div>
              
              <div className="biquad-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleBiquad(biquad.id);
                  }}
                  className={`toggle-button ${biquad.enabled ? 'enabled' : 'disabled'}`}
                  title={biquad.enabled ? 'Disable' : 'Enable'}
                >
                  {biquad.enabled ? '👁️' : '👁️‍🗨️'}
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Remove "${biquad.name}"?`)) {
                      onRemoveBiquad(biquad.id);
                    }
                  }}
                  className="remove-button"
                  title="Remove"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {biquads.length > 0 && (
        <div className="biquad-summary">
          <strong>Total: {biquads.length}</strong> sections
          <span>({biquads.filter(b => b.enabled).length} enabled)</span>
        </div>
      )}
    </div>
  );
}