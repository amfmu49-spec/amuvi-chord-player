export interface ChordToken {
  chord: string;
  charIndex: number; // 0-indexed character position in lyric string where chord appears
}

export interface ParsedLine {
  id: string;
  time: number | null; // Seconds, e.g. 15.25. Null if no timestamp
  rawText: string;
  lyrics: string;
  chords: ChordToken[];
}

export interface SongData {
  id: string;
  title: string;
  artist: string;
  originalKey: string;
  capo: number;
  audioUrl?: string;
  useSynth?: boolean;
  lrcContent: string;
  parsedLines: ParsedLine[];
}

export interface ChordDiagramData {
  name: string;
  frets: (number | 'x')[]; // 6 strings from low E (6th) to high E (1st)
  baseFret?: number;
  barres?: number[];
  fingerings?: (number | null)[];
}
