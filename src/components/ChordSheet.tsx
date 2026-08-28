import React, { useEffect, useRef } from 'react';
import type { ParsedLine } from '../types';
import { ChordLineView } from './ChordLineView';

interface Props {
  parsedLines: ParsedLine[];
  currentTime: number;
  transposedSemitones: number;
  onSelectChord: (chord: string) => void;
  onSeekToLine: (time: number) => void;
  fontSize: number;
  autoScrollEnabled: boolean;
}

export const ChordSheet: React.FC<Props> = ({
  parsedLines,
  currentTime,
  transposedSemitones,
  onSelectChord,
  onSeekToLine,
  fontSize,
  autoScrollEnabled
}) => {
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Find active line index based on current playback timestamp
  let activeIndex = -1;
  for (let i = 0; i < parsedLines.length; i++) {
    const lineTime = parsedLines[i].time;
    if (lineTime !== null && lineTime <= currentTime) {
      activeIndex = i;
    } else if (lineTime !== null && lineTime > currentTime) {
      break;
    }
  }

  // Smooth auto-scroll active line to center of screen
  useEffect(() => {
    if (autoScrollEnabled && activeIndex >= 0 && lineRefs.current[activeIndex]) {
      lineRefs.current[activeIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeIndex, autoScrollEnabled]);

  if (parsedLines.length === 0) {
    return (
      <div className="empty-sheet">
        <p>コード・歌詞データが読み込まれていません。</p>
        <p className="sub">「LRCエディター」から歌詞とコードを入力またはデモ曲を選択してください。</p>
      </div>
    );
  }

  return (
    <div className="chord-sheet-container">
      <div className="chord-sheet-wrapper">
        {parsedLines.map((line, idx) => (
          <div
            key={line.id}
            ref={(el) => { lineRefs.current[idx] = el; }}
          >
            <ChordLineView
              line={line}
              isActive={idx === activeIndex}
              transposedSemitones={transposedSemitones}
              onSelectChord={onSelectChord}
              onSeekToLine={onSeekToLine}
              fontSize={fontSize}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
