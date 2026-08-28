import React, { useState } from 'react';
import { X, Check, FileText } from 'lucide-react';
import type { SongData } from '../types';
import { parseLrcWithChords } from '../utils/lrcChordParser';

interface Props {
  currentSong: SongData;
  isOpen: boolean;
  onClose: () => void;
  onSaveSong: (updatedSong: SongData) => void;
}

export const EditorModal: React.FC<Props> = ({
  currentSong,
  isOpen,
  onClose,
  onSaveSong
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(currentSong.title);
  const [artist, setArtist] = useState(currentSong.artist);
  const [key, setKey] = useState(currentSong.originalKey);
  const [content, setContent] = useState(currentSong.lrcContent);

  const handleSave = () => {
    const parsed = parseLrcWithChords(content);
    const updated: SongData = {
      ...currentSong,
      title,
      artist,
      originalKey: key,
      lrcContent: content,
      parsedLines: parsed
    };
    onSaveSong(updated);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card editor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3><FileText size={18} /> LRC / コードテキストエディター</h3>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label>曲名:</label>
              <input
                type="text"
                className="text-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>アーティスト:</label>
              <input
                type="text"
                className="text-input"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
              />
            </div>
            <div className="form-group sm">
              <label>原曲キー:</label>
              <input
                type="text"
                className="text-input"
                value={key}
                onChange={(e) => setKey(e.target.value)}
              />
            </div>
          </div>

          <div className="editor-guide">
            💡 <strong>入力フォーマット例:</strong><br />
            <code>[00:15.20][C]かえるの[G]うたが [Am]きこえて[F]くるよ</code><br />
            <code>[00:18.00]C  G  Am  F</code> (コードのみの行も可能)
          </div>

          <textarea
            className="code-textarea"
            rows={14}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="ここにLRCおよびコードテキストを入力してください..."
          />
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>キャンセル</button>
          <button className="btn btn-primary" onClick={handleSave}>
            <Check size={16} /> 保存して更新
          </button>
        </div>
      </div>
    </div>
  );
};
