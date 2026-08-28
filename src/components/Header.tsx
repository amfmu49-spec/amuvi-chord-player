import React from 'react';
import type { SongData } from '../types';
import { SAMPLE_SONGS } from '../data/sampleSongs';
import { Music, Edit3, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';
import { transposeNote } from '../utils/chordUtils';

interface Props {
  currentSong: SongData;
  onSelectSong: (song: SongData) => void;
  transposedSemitones: number;
  onSetTranspose: (semitones: number) => void;
  capo: number;
  onSetCapo: (capo: number) => void;
  fontSize: number;
  onSetFontSize: (size: number) => void;
  autoScroll: boolean;
  onToggleAutoScroll: () => void;
  onOpenEditor: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Header: React.FC<Props> = ({
  currentSong,
  onSelectSong,
  transposedSemitones,
  onSetTranspose,
  capo,
  onSetCapo,
  fontSize,
  onSetFontSize,
  autoScroll,
  onToggleAutoScroll,
  onOpenEditor,
  onFileUpload
}) => {
  const currentKeyNote = transposeNote(currentSong.originalKey, transposedSemitones);

  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="logo-badge">
          <Music size={22} />
        </div>
        <div className="brand-text">
          <h1>AMUVI <span className="highlight">Chord Player</span></h1>
          <p className="subtitle">コード＆歌詞 同期プレイヤー</p>
        </div>
      </div>

      <div className="header-controls">
        {/* Song Selector */}
        <div className="control-group">
          <label className="control-label">曲選択:</label>
          <select
            className="select-input"
            value={currentSong.id}
            onChange={(e) => {
              const selected = SAMPLE_SONGS.find(s => s.id === e.target.value);
              if (selected) onSelectSong(selected);
            }}
          >
            {SAMPLE_SONGS.map((song) => (
              <option key={song.id} value={song.id}>
                {song.title} ({song.artist})
              </option>
            ))}
          </select>
        </div>

        {/* Key Transpose Control */}
        <div className="control-group">
          <label className="control-label">キー (移調):</label>
          <div className="btn-group">
            <button
              className="btn btn-sm"
              onClick={() => onSetTranspose(transposedSemitones - 1)}
              title="1半音下げる"
            >
              <ArrowDown size={14} />
            </button>
            <span className="key-badge">
              {currentKeyNote} <small>({transposedSemitones >= 0 ? `+${transposedSemitones}` : transposedSemitones})</small>
            </span>
            <button
              className="btn btn-sm"
              onClick={() => onSetTranspose(transposedSemitones + 1)}
              title="1半音上げる"
            >
              <ArrowUp size={14} />
            </button>
            {transposedSemitones !== 0 && (
              <button
                className="btn btn-sm btn-icon"
                onClick={() => onSetTranspose(0)}
                title="原曲キーに戻す"
              >
                <RotateCcw size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Capo Setting */}
        <div className="control-group">
          <label className="control-label">カポタスト:</label>
          <select
            className="select-input select-sm"
            value={capo}
            onChange={(e) => onSetCapo(Number(e.target.value))}
          >
            {[0, 1, 2, 3, 4, 5, 6, 7].map((c) => (
              <option key={c} value={c}>
                {c === 0 ? 'Capo 0 (なし)' : `Capo ${c} (Play: ${transposeNote(currentKeyNote, -c)})`}
              </option>
            ))}
          </select>
        </div>

        {/* Font Size & Auto Scroll */}
        <div className="control-group">
          <button
            className={`btn btn-sm ${autoScroll ? 'btn-active' : ''}`}
            onClick={onToggleAutoScroll}
          >
            {autoScroll ? 'スクロール: ON' : 'スクロール: OFF'}
          </button>
          <div className="font-controls">
            <button className="btn btn-sm" onClick={() => onSetFontSize(Math.max(14, fontSize - 2))}>A-</button>
            <button className="btn btn-sm" onClick={() => onSetFontSize(Math.min(32, fontSize + 2))}>A+</button>
          </div>
        </div>

        {/* Editor & File Upload */}
        <div className="header-actions">
          <label className="btn btn-secondary btn-sm file-btn">
            音源ファイル読み込み
            <input type="file" accept="audio/*" onChange={onFileUpload} hidden />
          </label>
          <button className="btn btn-primary btn-sm" onClick={onOpenEditor}>
            <Edit3 size={14} /> エディター
          </button>
        </div>
      </div>
    </header>
  );
};
