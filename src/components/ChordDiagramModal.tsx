import React from 'react';
import { X } from 'lucide-react';
import { getChordDiagram } from '../utils/chordUtils';

interface Props {
  chordName: string | null;
  onClose: () => void;
}

export const ChordDiagramModal: React.FC<Props> = ({ chordName, onClose }) => {
  if (!chordName) return null;

  const diagram = getChordDiagram(chordName);
  const strings = [6, 5, 4, 3, 2, 1]; // Low E to High E
  const stringNames = ['E', 'A', 'D', 'G', 'B', 'E'];
  const frets = [1, 2, 3, 4]; // 4-fret view grid

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card chord-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>コード図: <span className="highlight-text">{diagram.name}</span></h3>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="chord-diagram-container">
          <div className="fretboard-grid">
            {/* Nut / Base fret indicator */}
            <div className="fretboard-nut">
              {diagram.baseFret && diagram.baseFret > 1 ? `${diagram.baseFret}fr` : 'NUT'}
            </div>

            {/* Strings Header: X, O or Fret number */}
            <div className="string-indicators">
              {diagram.frets.map((fret, i) => (
                <div key={i} className="string-marker">
                  {fret === 'x' ? <span className="muted">✕</span> : fret === 0 ? <span className="open">○</span> : <span className="fret-num">{fret}</span>}
                </div>
              ))}
            </div>

            {/* Fretboard SVG / Grid */}
            <div className="fretboard-neck">
              {/* Vertical Strings */}
              <div className="strings-layer">
                {strings.map((_, i) => (
                  <div key={i} className="guitar-string" />
                ))}
              </div>

              {/* Horizontal Frets */}
              <div className="frets-layer">
                {frets.map((fretNum) => (
                  <div key={fretNum} className="fret-line">
                    <span className="fret-number-label">{fretNum}</span>
                  </div>
                ))}
              </div>

              {/* Finger Dots Layer */}
              <div className="dots-layer">
                {diagram.frets.map((fretVal, stringIdx) => {
                  if (typeof fretVal !== 'number' || fretVal === 0) return null;
                  
                  // Adjust fret offset if baseFret is defined
                  const effectiveFret = diagram.baseFret && diagram.baseFret > 1 ? fretVal - diagram.baseFret + 1 : fretVal;
                  if (effectiveFret < 1 || effectiveFret > 4) return null;

                  return (
                    <div
                      key={stringIdx}
                      className="finger-dot"
                      style={{
                        left: `${(stringIdx / 5) * 100}%`,
                        top: `${((effectiveFret - 0.5) / 4) * 100}%`
                      }}
                    >
                      {fretVal}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* String Labels at Bottom */}
            <div className="string-labels">
              {stringNames.map((name, i) => (
                <span key={i}>{name}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>閉じる</button>
        </div>
      </div>
    </div>
  );
};
