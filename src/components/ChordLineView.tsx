import React from 'react';
import type { ParsedLine } from '../types';
import { transposeChord } from '../utils/chordUtils';
import { Play } from 'lucide-react';

interface Props {
  line: ParsedLine;
  isActive: boolean;
  transposedSemitones: number;
  onSelectChord: (chord: string) => void;
  onSeekToLine: (time: number) => void;
  fontSize: number;
}

export const ChordLineView: React.FC<Props> = ({
  line,
  isActive,
  transposedSemitones,
  onSelectChord,
  onSeekToLine,
  fontSize
}) => {
  const { lyrics, chords, time } = line;

  // Format time display (e.g. 01:23)
  const formatTime = (sec: number | null) => {
    if (sec === null) return '--:--';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Build character grid with assigned chords
  const charArray = Array.from(lyrics.length > 0 ? lyrics : ' ');
  const chordMap: Record<number, string[]> = {};

  chords.forEach((c) => {
    const idx = Math.min(c.charIndex, Math.max(0, charArray.length - 1));
    const transposed = transposeChord(c.chord, transposedSemitones);
    if (!chordMap[idx]) chordMap[idx] = [];
    chordMap[idx].push(transposed);
  });

  return (
    <div
      className={`chord-line-item ${isActive ? 'active-line' : ''}`}
      onClick={() => time !== null && onSeekToLine(time)}
    >
      {/* Time & Play Indicator */}
      <div className="line-meta">
        <button
          className="time-badge"
          title="この位置から再生"
          onClick={(e) => {
            e.stopPropagation();
            if (time !== null) onSeekToLine(time);
          }}
        >
          <Play size={12} className="play-icon" />
          <span>{formatTime(time)}</span>
        </button>
        {isActive && <span className="active-badge">PLAYING</span>}
      </div>

      {/* Lyrics + Chords Aligned Content */}
      <div className="line-content" style={{ fontSize: `${fontSize}px` }}>
        {charArray.map((char, charIdx) => {
          const charChords = chordMap[charIdx];

          return (
            <div key={charIdx} className="char-cell">
              {/* Chord Container Above Character */}
              <div className="chord-slot">
                {charChords && charChords.map((chordName, chordIdx) => (
                  <span
                    key={chordIdx}
                    className="chord-badge"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectChord(chordName);
                    }}
                    title="クリックでダイアグラム表示"
                  >
                    {chordName}
                  </span>
                ))}
              </div>

              {/* Character */}
              <span className="lyric-char">{char === ' ' ? '\u00A0' : char}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
