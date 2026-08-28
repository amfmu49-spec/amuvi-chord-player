import React, { useState, useEffect, useCallback } from 'react';
import type { SongData } from './types';
import { SAMPLE_SONGS } from './data/sampleSongs';
import { Header } from './components/Header';
import { ChordSheet } from './components/ChordSheet';
import { PlayerControls } from './components/PlayerControls';
import { ChordDiagramModal } from './components/ChordDiagramModal';
import { EditorModal } from './components/EditorModal';
import { synthEngine } from './utils/synthAudio';
import { parseLrcWithChords } from './utils/lrcChordParser';
import './index.css';

export function App() {
  const [currentSong, setCurrentSong] = useState<SongData>(SAMPLE_SONGS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(60);
  const [transposedSemitones, setTransposedSemitones] = useState(0);
  const [capo, setCapo] = useState(0);
  const [fontSize, setFontSize] = useState(22);
  const [autoScroll, setAutoScroll] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  const [selectedChord, setSelectedChord] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Sync synth engine playback
  useEffect(() => {
    if (currentSong.useSynth) {
      synthEngine.setTimeUpdateListener((time) => {
        setCurrentTime(time);
      });
      synthEngine.setEndedListener(() => {
        setIsPlaying(false);
      });
      setDuration(synthEngine.duration);
    }
  }, [currentSong]);

  // Auto-import LRC & Audio from URL Hash or Search Params (AMUVI / Suno Bookmarklet integration)
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));

    const lrcData = searchParams.get('lrc') || hashParams.get('lrc');
    const audioUrlParam = searchParams.get('audio_url') || hashParams.get('audio_url');
    const titleParam = searchParams.get('title') || hashParams.get('title') || 'Webインポート楽曲';
    const artistParam = searchParams.get('artist') || hashParams.get('artist') || 'AMUVI Suno Import';

    if (lrcData) {
      try {
        const decoded = decodeURIComponent(lrcData);
        const parsed = parseLrcWithChords(decoded);
        const importedSong: SongData = {
          id: `import-${Date.now()}`,
          title: titleParam,
          artist: artistParam,
          originalKey: 'C',
          capo: 0,
          audioUrl: audioUrlParam || undefined,
          useSynth: !audioUrlParam,
          lrcContent: decoded,
          parsedLines: parsed
        };
        setCurrentSong(importedSong);
      } catch (err) {
        console.error('Failed to parse URL LRC parameter', err);
      }
    }
  }, []);

  // Handle Play / Pause toggle
  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      if (currentSong.useSynth) {
        synthEngine.pause();
      }
      setIsPlaying(false);
    } else {
      if (currentSong.useSynth) {
        synthEngine.play(currentTime);
      }
      setIsPlaying(true);
    }
  }, [isPlaying, currentTime, currentSong]);

  // Handle Seek
  const handleSeek = (time: number) => {
    setCurrentTime(time);
    if (currentSong.useSynth) {
      synthEngine.seek(time);
    }
  };

  // Handle Speed change
  const handleSetSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (currentSong.useSynth) {
      synthEngine.setRate(rate);
    }
  };

  // Handle Custom Audio File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const updated: SongData = {
      ...currentSong,
      title: file.name.replace(/\.[^/.]+$/, ""),
      audioUrl: url,
      useSynth: false
    };

    if (isPlaying) {
      synthEngine.pause();
      setIsPlaying(false);
    }

    setCurrentSong(updated);
  };

  // Handle Song Selection
  const handleSelectSong = (song: SongData) => {
    if (isPlaying) {
      synthEngine.pause();
      setIsPlaying(false);
    }
    setCurrentSong(song);
    setCurrentTime(0);
    setTransposedSemitones(0);
    setCapo(0);
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <Header
        currentSong={currentSong}
        onSelectSong={handleSelectSong}
        transposedSemitones={transposedSemitones}
        onSetTranspose={setTransposedSemitones}
        capo={capo}
        onSetCapo={setCapo}
        fontSize={fontSize}
        onSetFontSize={setFontSize}
        autoScroll={autoScroll}
        onToggleAutoScroll={() => setAutoScroll(!autoScroll)}
        onOpenEditor={() => setIsEditorOpen(true)}
        onFileUpload={handleFileUpload}
      />

      {/* Song Title & Key Banner */}
      <div className="song-banner">
        <div className="song-info">
          <h2>{currentSong.title}</h2>
          <p className="artist">{currentSong.artist}</p>
        </div>
        <div className="key-info-pills">
          <span className="pill">原曲Key: <strong>{currentSong.originalKey}</strong></span>
          <span className="pill highlight">
            演奏Key: <strong>{currentSong.originalKey} ({transposedSemitones >= 0 ? `+${transposedSemitones}` : transposedSemitones})</strong>
          </span>
          {capo > 0 && <span className="pill capo">Capo {capo} 装着</span>}
        </div>
      </div>

      {/* Main Chord & Lyric Sheet Container */}
      <main className="main-content">
        <ChordSheet
          parsedLines={currentSong.parsedLines}
          currentTime={currentTime}
          transposedSemitones={transposedSemitones}
          onSelectChord={setSelectedChord}
          onSeekToLine={handleSeek}
          fontSize={fontSize}
          autoScrollEnabled={autoScroll}
        />
      </main>

      {/* Bottom Audio Player Bar */}
      <PlayerControls
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        playbackRate={playbackRate}
        onTogglePlay={handleTogglePlay}
        onSeek={handleSeek}
        onSetSpeed={handleSetSpeed}
        audioUrl={currentSong.audioUrl}
        useSynth={currentSong.useSynth}
        onAudioTimeUpdate={setCurrentTime}
        onAudioDurationChange={setDuration}
        onAudioEnded={() => setIsPlaying(false)}
      />

      {/* Interactive Chord Fretboard Diagram Modal */}
      <ChordDiagramModal
        chordName={selectedChord}
        onClose={() => setSelectedChord(null)}
      />

      {/* Editor Modal */}
      <EditorModal
        currentSong={currentSong}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSaveSong={(updated) => {
          setCurrentSong(updated);
        }}
      />
    </div>
  );
}

export default App;
