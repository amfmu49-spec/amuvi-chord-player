import React, { useRef, useEffect } from 'react';
import { Play, Pause, FastForward } from 'lucide-react';

interface Props {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onSetSpeed: (speed: number) => void;
  audioUrl?: string;
  useSynth?: boolean;
  onAudioTimeUpdate?: (time: number) => void;
  onAudioDurationChange?: (dur: number) => void;
  onAudioEnded?: () => void;
}

export const PlayerControls: React.FC<Props> = ({
  isPlaying,
  currentTime,
  duration,
  playbackRate,
  onTogglePlay,
  onSeek,
  onSetSpeed,
  audioUrl,
  useSynth,
  onAudioTimeUpdate,
  onAudioDurationChange,
  onAudioEnded
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  // Sync HTML5 Audio element if audioUrl is provided
  useEffect(() => {
    if (!useSynth && audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl;
      audioRef.current.playbackRate = playbackRate;
    }
  }, [audioUrl, useSynth]);

  useEffect(() => {
    if (!useSynth && audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate, useSynth]);

  useEffect(() => {
    if (!useSynth && audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, useSynth]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="player-bar-container">
      {/* Hidden HTML5 Audio Element */}
      {!useSynth && audioUrl && (
        <audio
          ref={audioRef}
          onTimeUpdate={() => {
            if (audioRef.current && onAudioTimeUpdate) {
              onAudioTimeUpdate(audioRef.current.currentTime);
            }
          }}
          onLoadedMetadata={() => {
            if (audioRef.current && onAudioDurationChange) {
              onAudioDurationChange(audioRef.current.duration);
            }
          }}
          onEnded={() => {
            if (onAudioEnded) onAudioEnded();
          }}
        />
      )}

      <div className="player-bar">
        {/* Play/Pause Button */}
        <button
          className="play-main-btn"
          onClick={onTogglePlay}
          title={isPlaying ? '一時停止' : '再生'}
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} className="play-icon-offset" />}
        </button>

        {/* Time display */}
        <span className="time-display">{formatTime(currentTime)}</span>

        {/* Progress Slider */}
        <div className="progress-container">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            className="seek-slider"
            onChange={(e) => onSeek(Number(e.target.value))}
            style={{
              background: `linear-gradient(to right, #6366f1 0%, #a855f7 ${progressPercent}%, rgba(255,255,255,0.1) ${progressPercent}%, rgba(255,255,255,0.1) 100%)`
            }}
          />
        </div>

        {/* Duration display */}
        <span className="time-display">{formatTime(duration)}</span>

        {/* Speed Control */}
        <div className="speed-control">
          <FastForward size={16} className="text-muted" />
          <select
            className="select-input select-sm"
            value={playbackRate}
            onChange={(e) => onSetSpeed(Number(e.target.value))}
          >
            <option value={0.5}>0.5x (ゆっくり)</option>
            <option value={0.75}>0.75x</option>
            <option value={1.0}>1.0x (標準)</option>
            <option value={1.25}>1.25x</option>
          </select>
        </div>

        {/* Audio Mode Badge */}
        <div className="audio-mode-badge">
          {useSynth ? '🎸 アコギシンセ音源' : '🎵 カスタムMP3音源'}
        </div>
      </div>
    </div>
  );
};
