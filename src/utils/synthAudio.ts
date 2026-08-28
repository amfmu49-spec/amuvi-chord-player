/**
 * Web Audio API Acoustic Guitar & Rhythm Backing Track Synthesizer
 * Allows demo playing without needing external audio files!
 */

class SynthAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private startTime = 0;
  private pauseTime = 0;
  private playbackRate = 1.0;
  private timerId: number | null = null;

  private onTimeUpdateCallback: ((time: number) => void) | null = null;
  private onEndedCallback: (() => void) | null = null;

  public duration = 60; // 60 seconds demo

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setTimeUpdateListener(cb: (time: number) => void) {
    this.onTimeUpdateCallback = cb;
  }

  public setEndedListener(cb: () => void) {
    this.onEndedCallback = cb;
  }

  public play(fromTime?: number) {
    const ctx = this.getContext();
    if (this.isPlaying) return;

    if (fromTime !== undefined) {
      this.pauseTime = fromTime;
    }

    this.startTime = ctx.currentTime - (this.pauseTime / this.playbackRate);
    this.isPlaying = true;

    this.tick();
  }

  public pause() {
    if (!this.isPlaying) return;
    this.pauseTime = this.getCurrentTime();
    this.isPlaying = false;
    if (this.timerId) {
      cancelAnimationFrame(this.timerId);
      this.timerId = null;
    }
  }

  public seek(time: number) {
    this.pauseTime = time;
    if (this.isPlaying && this.ctx) {
      this.startTime = this.ctx.currentTime - (time / this.playbackRate);
    }
    if (this.onTimeUpdateCallback) {
      this.onTimeUpdateCallback(time);
    }
  }

  public setRate(rate: number) {
    if (this.isPlaying) {
      const current = this.getCurrentTime();
      this.playbackRate = rate;
      this.seek(current);
    } else {
      this.playbackRate = rate;
    }
  }

  public getCurrentTime(): number {
    if (!this.isPlaying || !this.ctx) return this.pauseTime;
    const elapsed = (this.ctx.currentTime - this.startTime) * this.playbackRate;
    if (elapsed >= this.duration) {
      this.pause();
      if (this.onEndedCallback) this.onEndedCallback();
      return this.duration;
    }
    return Math.min(elapsed, this.duration);
  }

  private lastStrumSec = -1;

  private tick = () => {
    if (!this.isPlaying) return;
    const now = this.getCurrentTime();

    if (this.onTimeUpdateCallback) {
      this.onTimeUpdateCallback(now);
    }

    // Play guitar strum sound on beats (every 2 seconds roughly)
    const strumIndex = Math.floor(now / 2);
    if (strumIndex > this.lastStrumSec) {
      this.lastStrumSec = strumIndex;
      this.playGuitarStrum(strumIndex);
    }

    this.timerId = requestAnimationFrame(this.tick);
  };

  /**
   * Synthesizes an acoustic guitar chord strum sound
   */
  private playGuitarStrum(index: number) {
    if (!this.ctx) return;
    const ctx = this.ctx;

    // Chord pitch triads for C, G, Am, F cycle
    const chordsFreqs = [
      [261.63, 329.63, 392.00, 523.25], // C Major
      [196.00, 246.94, 293.66, 392.00], // G Major
      [220.00, 261.63, 329.63, 440.00], // A Minor
      [174.61, 220.00, 261.63, 349.23]  // F Major
    ];

    const notes = chordsFreqs[index % chordsFreqs.length];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 1.2);

      // Slightly stagger notes to simulate guitar strumming
      const strumDelay = i * 0.035;
      const t = ctx.currentTime + strumDelay;

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 1.6);
    });
  }
}

export const synthEngine = new SynthAudioEngine();
