(function () {
  async function run() {
    // 1. Detect Song ID from URL or page context
    const match = window.location.href.match(/song\/([a-f0-9-]{36})/i) ||
                  window.location.href.match(/([a-f0-9-]{36})/i);
    
    if (!match) {
      alert("Sunoの楽曲ページを開いてから実行してください。(例: suno.com/song/xxxxxxxx-xxxx-...)");
      return;
    }

    const songId = match[1];

    // Get Session Token
    const cookies = `; ${document.cookie}`.split(`; __session=`);
    const token = cookies.length >= 2 ? cookies.pop().split(';').shift() : null;

    if (!token) {
      alert("Sunoへのログイン状態が確認できませんでした。ログインの上再試行してください。");
      return;
    }

    // Helper fetch
    async function apiFetch(path) {
      try {
        const res = await fetch(`https://studio-api.prod.suno.com${path}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return res.ok ? await res.json() : null;
      } catch (e) {
        return null;
      }
    }

    // 2. Fetch Clip Data (MP3 Audio URL & Title) & Aligned Lyrics (SRT / LRC)
    const clipInfo = await apiFetch(`/api/clip/${songId}`);
    const lyricsData = await apiFetch(`/api/gen/${songId}/aligned_lyrics/v2/`);

    const audioUrl = clipInfo?.audio_url || clipInfo?.video_url || '';
    const songTitle = clipInfo?.title || 'Suno Song';
    const artistName = clipInfo?.display_name || clipInfo?.handle || 'Suno AI';

    const alignedLyrics = Array.isArray(lyricsData?.aligned_lyrics)
      ? lyricsData.aligned_lyrics
      : lyricsData?.data?.aligned_lyrics || [];

    if (!alignedLyrics.length) {
      alert("この楽曲のタイムタグ付き歌詞データがまだ準備されていません。少し待ってから再試行してください。");
      return;
    }

    // Convert aligned lyrics to LRC format
    let lastSec = 0;
    const lrcLines = alignedLyrics.map((item) => {
      const startS = typeof item.start_s === 'number' ? item.start_s : lastSec;
      lastSec = startS;
      const m = Math.floor(startS / 60).toString().padStart(2, '0');
      const s = Math.floor(startS % 60).toString().padStart(2, '0');
      const ms = Math.floor((startS % 1) * 100).toString().padStart(2, '0');
      const text = item.text || item.word || '';
      return `[${m}:${s}.${ms}]${text}`;
    }).filter(line => line.length > 10);

    const lrcText = lrcLines.join('\n');

    // 3. Build Redirect URL to AMUVI Chord Player with MP3 Audio + LRC + Title
    const targetAppUrl = `https://amfmu49-spec.github.io/amuvi-chord-player/#lrc=${encodeURIComponent(lrcText)}&audio_url=${encodeURIComponent(audioUrl)}&title=${encodeURIComponent(songTitle)}&artist=${encodeURIComponent(artistName)}`;

    // Create Modal Overlay on Suno
    const oldOverlay = document.getElementById("amuvi-suno-modal");
    if (oldOverlay) oldOverlay.remove();

    const overlay = document.createElement("div");
    overlay.id = "amuvi-suno-modal";
    Object.assign(overlay.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0,0,0,0.85)",
      backdropFilter: "blur(8px)",
      zIndex: "999999",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "system-ui, -apple-system, sans-serif"
    });

    const modal = document.createElement("div");
    Object.assign(modal.style, {
      background: "#1c1410",
      border: "1px solid #d97706",
      padding: "24px",
      borderRadius: "16px",
      width: "90%",
      maxWidth: "480px",
      boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
      color: "#fffbeb",
      display: "flex",
      flexDirection: "column",
      gap: "16px"
    });

    modal.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(245,158,11,0.2); padding-bottom:12px;">
        <h3 style="margin:0; font-size:18px; color:#fde047;">🎸 AMUVI Chord Player 連携</h3>
        <button id="amuvi-close-x" style="background:none; border:none; color:#aaa; font-size:20px; cursor:pointer;">✕</button>
      </div>
      <div>
        <p style="margin:0 0 6px 0; font-weight:bold; font-size:16px;">${songTitle}</p>
        <p style="margin:0; font-size:13px; color:#d4a373;">🎵 MP3音源 & タイムタグ歌詞 (SRT/LRC) 抽出完了</p>
      </div>
      <div style="display:flex; flex-direction:column; gap:10px;">
        <a href="${targetAppUrl}" target="_blank" style="display:block; text-align:center; padding:14px; background:linear-gradient(135deg, #d97706, #92400e); color:#fff; font-weight:bold; text-decoration:none; border-radius:10px; font-size:16px; box-shadow:0 4px 14px rgba(217,119,6,0.4);">
          🎸 AMUVI Chord Player でコード演奏を開く
        </a>
        <div style="display:flex; gap:8px;">
          <a href="${audioUrl}" download="${songTitle}.mp3" target="_blank" style="flex:1; text-align:center; padding:10px; background:rgba(255,255,255,0.1); color:#fff; font-size:13px; text-decoration:none; border-radius:8px; border:1px solid rgba(255,255,255,0.2);">
            🎵 MP3を保存
          </a>
          <button id="amuvi-copy-lrc" style="flex:1; padding:10px; background:rgba(255,255,255,0.1); color:#fff; font-size:13px; border:1px solid rgba(255,255,255,0.2); border-radius:8px; cursor:pointer;">
            📝 LRC歌詞をコピー
          </button>
        </div>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    document.getElementById("amuvi-close-x").onclick = () => overlay.remove();
    document.getElementById("amuvi-copy-lrc").onclick = () => {
      navigator.clipboard.writeText(lrcText);
      alert("LRC歌詞をクリップボードにコピーしました！");
    };
  }

  run();
})();
