import type { ChordDiagramData } from '../types';

const SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Map note aliases
const NOTE_MAP: Record<string, number> = {
  'C': 0, 'B#': 0,
  'C#': 1, 'Db': 1,
  'D': 2,
  'D#': 3, 'Eb': 3,
  'E': 4, 'Fb': 4,
  'F': 5, 'E#': 5,
  'F#': 6, 'Gb': 6,
  'G': 7,
  'G#': 8, 'Ab': 8,
  'A': 9,
  'A#': 10, 'Bb': 10,
  'B': 11, 'Cb': 11
};

/**
 * Transposes a single note by semitones
 */
export function transposeNote(note: string, semitones: number, preferFlat = false): string {
  if (!(note in NOTE_MAP)) return note;
  const originalIndex = NOTE_MAP[note];
  let newIndex = (originalIndex + semitones) % 12;
  if (newIndex < 0) newIndex += 12;
  
  return preferFlat ? FLATS[newIndex] : SHARPS[newIndex];
}

/**
 * Transposes a chord symbol (e.g. Cmaj7, F#m7/G, Bbadd9)
 */
export function transposeChord(chord: string, semitones: number): string {
  if (semitones === 0 || !chord.trim()) return chord;

  // Handle slash chords like C/G or F#m/C#
  if (chord.includes('/')) {
    const parts = chord.split('/');
    return `${transposeChord(parts[0], semitones)}/${transposeNote(parts[1], semitones)}`;
  }

  // Regex to extract root note (A-G with optional # or b) and suffix
  const match = chord.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return chord;

  const root = match[1];
  const suffix = match[2];

  const preferFlat = root.includes('b') || chord.includes('b');
  const transposedRoot = transposeNote(root, semitones, preferFlat);

  return `${transposedRoot}${suffix}`;
}

/**
 * Built-in Chord Diagram Library (Standard Tuning E A D G B E)
 * Strings: [6th(Low E), 5th(A), 4th(D), 3rd(G), 2nd(B), 1st(High E)]
 */
export const KNOWN_CHORDS: Record<string, ChordDiagramData> = {
  'C': { name: 'C', frets: ['x', 3, 2, 0, 1, 0] },
  'G': { name: 'G', frets: [3, 2, 0, 0, 0, 3] },
  'Am': { name: 'Am', frets: ['x', 0, 2, 2, 1, 0] },
  'F': { name: 'F', frets: [1, 3, 3, 2, 1, 1], baseFret: 1, barres: [1] },
  'Em': { name: 'Em', frets: [0, 2, 2, 0, 0, 0] },
  'Dm': { name: 'Dm', frets: ['x', 'x', 0, 2, 3, 1] },
  'D': { name: 'D', frets: ['x', 'x', 0, 2, 3, 2] },
  'E': { name: 'E', frets: [0, 2, 2, 1, 0, 0] },
  'A': { name: 'A', frets: ['x', 0, 2, 2, 2, 0] },
  'B7': { name: 'B7', frets: ['x', 2, 1, 2, 0, 2] },
  'Bm': { name: 'Bm', frets: ['x', 2, 4, 4, 3, 2], baseFret: 2, barres: [2] },
  'G7': { name: 'G7', frets: [3, 2, 0, 0, 0, 1] },
  'C7': { name: 'C7', frets: ['x', 3, 2, 3, 1, 0] },
  'Fmaj7': { name: 'Fmaj7', frets: ['x', 3, 3, 2, 1, 0] },
  'FM7': { name: 'FM7', frets: ['x', 3, 3, 2, 1, 0] },
  'Am7': { name: 'Am7', frets: ['x', 0, 2, 0, 1, 0] },
  'Dm7': { name: 'Dm7', frets: ['x', 'x', 0, 2, 1, 1] },
  'E7': { name: 'E7', frets: [0, 2, 0, 1, 0, 0] },
  'Cadd9': { name: 'Cadd9', frets: ['x', 3, 2, 0, 3, 0] },
  'Dsus4': { name: 'Dsus4', frets: ['x', 'x', 0, 2, 3, 3] },
  'Csus4': { name: 'Csus4', frets: ['x', 3, 3, 0, 1, 1] },
  'Gsus4': { name: 'Gsus4', frets: [3, 3, 0, 0, 1, 3] }
};

/**
 * Tries to find a diagram for a chord, or returns a basic fallback
 */
export function getChordDiagram(chordName: string): ChordDiagramData {
  const cleanName = chordName.split('/')[0].trim();
  if (KNOWN_CHORDS[cleanName]) return KNOWN_CHORDS[cleanName];

  // Simple fallbacks for base triads
  const rootMatch = cleanName.match(/^([A-G][#b]?)(.*)$/);
  if (rootMatch) {
    const root = rootMatch[1];
    const isMinor = rootMatch[2].startsWith('m') && !rootMatch[2].startsWith('maj');
    const baseChordName = isMinor ? `${root}m` : root;
    if (KNOWN_CHORDS[baseChordName]) {
      return { ...KNOWN_CHORDS[baseChordName], name: chordName };
    }
  }

  return {
    name: chordName,
    frets: ['x', 'x', 0, 2, 3, 2] // Fallback diagram shape
  };
}
