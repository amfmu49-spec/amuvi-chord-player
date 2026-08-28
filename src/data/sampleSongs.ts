import type { SongData } from '../types';
import { parseLrcWithChords } from '../utils/lrcChordParser';

const DEMO_LRC_1 = `[ti:カエルの合唱]
[ar:AMUVI Demo]
[00:00.00] (Intro Count) 1, 2, 3, 4...
[00:04.00][C]かえるの[G]うたが [Am]きこえて[Em]くるよ
[00:08.00][F]ぐわ ぐわ [C]ぐわ ぐわ [Dm]げろげろ [G]げろげろ
[00:12.00][C]ぐわ [G]ぐわ [C]ぐわ
[00:16.00][C]みずべの[G]ほとりで [Am]たのしく[Em]うたう
[00:20.00][F]みんなで [C]あわせて [Dm]ハーモニー[G]
[00:24.00][C]ぐわ [G]ぐわ [C]ぐわ
[00:28.00][C]よるが[G]ふけても [Am]うたい[Em]つづける
[00:32.00][F]あすの[C]ひかりを [Dm]まちながら[G]
[00:36.00][C]ぐわ [G]ぐわ [C]ぐわ (Outro)`;

const DEMO_LRC_2 = `[ti:Sunrise Road (サンライズ・ロード)]
[ar:Suno AI & AMUVI Studio]
[00:00.00] [C] [G] [Am] [Em] [F] [C] [Dm] [G] (Guitar Strum Intro)
[00:06.00][C]あさひが[G]のぼる [Am]あたらしい[Em]みちへ
[00:10.00][F]かぜを[C]うけて [Dm]あるきだそう[G]
[00:14.00][C]すこし[G]つかれたら [Am]すわって[Em]やすもう
[00:18.00][F]きみの[C]えがおが [Dm]ぼくの[G]エネルギー[C]
[00:24.00][F]つまずいた[G]ときも [Em]あきらめ[Am]ないで
[00:29.00][Dm]いつか[G]かなう [C]ゆめがあるから[C7]
[00:34.00][F]ひびけ[G]メロディ [Em]どこまでも[Am]とどけ
[00:39.00][Dm]きみと[G]つむぐ [C]このうたを`;

const DEMO_LRC_3 = `[ti:Stand By Me (アコギ弾き語りアレンジ)]
[ar:Classic Covers]
[00:00.00] [A] [F#m] [D] [E] [A] (Bass & Strum Intro)
[00:08.00][A]When the night has come [F#m]and the land is dark
[00:15.00]And the [D]moon is the [E]only light we'll [A]see
[00:22.00]No I [A]won't be afraid, no I [F#m]won't be afraid
[00:28.00]Just as [D]long as you [E]stand, stand by [A]me
[00:35.00]So [A]darling, darling, stand by me, oh [F#m]stand by me
[00:42.00]Oh [D]stand, [E]stand by me, [A]stand by me`;

export const SAMPLE_SONGS: SongData[] = [
  {
    id: 'demo-1',
    title: 'カエルの合唱 (アコースティック)',
    artist: 'AMUVI Standard',
    originalKey: 'C',
    capo: 0,
    useSynth: true,
    lrcContent: DEMO_LRC_1,
    parsedLines: parseLrcWithChords(DEMO_LRC_1)
  },
  {
    id: 'demo-2',
    title: 'Sunrise Road (ポップス4コード進行)',
    artist: 'Suno AI & AMUVI Studio',
    originalKey: 'C',
    capo: 0,
    useSynth: true,
    lrcContent: DEMO_LRC_2,
    parsedLines: parseLrcWithChords(DEMO_LRC_2)
  },
  {
    id: 'demo-3',
    title: 'Stand By Me (アコギカノンコード)',
    artist: 'Classic Covers',
    originalKey: 'A',
    capo: 0,
    useSynth: true,
    lrcContent: DEMO_LRC_3,
    parsedLines: parseLrcWithChords(DEMO_LRC_3)
  }
];
