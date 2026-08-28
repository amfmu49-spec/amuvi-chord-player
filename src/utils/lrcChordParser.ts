import type { ParsedLine, ChordToken } from '../types';

/**
 * Parses raw LRC / Chord text into structured ParsedLine[]
 * Supports formats:
 * - Time + inline chords: [00:15.20][C]かえるの[G]うたが [Am]きこえて[F]くるよ
 * - Time + pure chords: [00:18.00]C  G  Am  F
 * - Plain lyrics with inline chords: [C]かえるの[G]うたが
 */
export function parseLrcWithChords(rawText: string): ParsedLine[] {
  const lines = rawText.split('\n');
  const result: ParsedLine[] = [];

  const timeRegex = /^\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/;
  const chordBracketRegex = /\[([A-G][#b]?[^\]]*)\]/g;

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    let timestamp: number | null = null;
    let content = trimmed;

    // Check for timestamp prefix [mm:ss.xx]
    const timeMatch = content.match(timeRegex);
    if (timeMatch) {
      const minutes = parseInt(timeMatch[1], 10);
      const seconds = parseInt(timeMatch[2], 10);
      const millis = timeMatch[3] ? parseInt(timeMatch[3].padEnd(3, '0').slice(0, 3), 10) : 0;
      timestamp = minutes * 60 + seconds + millis / 1000;
      content = content.replace(timeRegex, '').trim();
    }

    // Ignore LRC metadata headers like [ti:Title], [ar:Artist]
    if (content.startsWith('[ti:') || content.startsWith('[ar:') || content.startsWith('[by:') || content.startsWith('[al:')) {
      return;
    }

    const chords: ChordToken[] = [];
    let cleanLyrics = '';
    let match: RegExpExecArray | null;

    // Parse inline bracket chords e.g. [C]かえるの[G]うたが
    let lastIndex = 0;
    const regexCopy = new RegExp(chordBracketRegex.source, 'g');

    while ((match = regexCopy.exec(content)) !== null) {
      // Append lyric snippet preceding this chord
      const textBefore = content.substring(lastIndex, match.index);
      cleanLyrics += textBefore;

      const chordName = match[1].trim();
      chords.push({
        chord: chordName,
        charIndex: cleanLyrics.length
      });

      lastIndex = match.index + match[0].length;
    }

    // Append remaining lyric string after last chord
    cleanLyrics += content.substring(lastIndex);

    // If no bracketed chords were found, check if line is a pure chord line (e.g. "C  G  Am  F")
    if (chords.length === 0 && cleanLyrics.trim().length > 0) {
      const tokens = cleanLyrics.split(/\s+/);
      const isPureChords = tokens.every(token => /^([A-G][#b]?[a-zA-Z0-9/#+]*)$/.test(token));
      
      if (isPureChords && tokens.length > 0) {
        let currentPos = 0;
        tokens.forEach((token) => {
          chords.push({
            chord: token,
            charIndex: currentPos
          });
          currentPos += token.length + 3; // spacing
        });
      }
    }

    result.push({
      id: `line-${index}-${Date.now()}`,
      time: timestamp,
      rawText: trimmed,
      lyrics: cleanLyrics,
      chords
    });
  });

  return result;
}
