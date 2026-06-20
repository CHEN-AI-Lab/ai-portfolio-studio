'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { CATEGORIES } from 'shared';
import type { WorkCategory } from 'shared';

// ─── Props ──────────────────────────────────────────────────────────

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onNotify?: (message: string, type: 'success' | 'error') => void;
}

// ─── Helpers ────────────────────────────────────────────────────────

function guessTitle(filename: string): string {
  const dot = filename.lastIndexOf('.');
  const name = dot > 0 ? filename.slice(0, dot) : filename;
  return name.replace(/[_\-]+/g, ' ').trim() || '未命名作品';
}

function guessTags(filename: string): string[] {
  const dot = filename.lastIndexOf('.');
  const name = dot > 0 ? filename.slice(0, dot) : filename;
  const ext = filename.slice(dot + 1).toLowerCase();
  const tags: string[] = [];

  if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'].includes(ext)) tags.push('图片');
  if (['mp4', 'webm', 'mov'].includes(ext)) tags.push('视频');

  const parts = name.split(/[_\-—,，、\s]+/).filter(Boolean);
  for (const part of parts) {
    const cjk = part.match(/[\u4e00-\u9fff]{2,6}/g);
    if (cjk) cjk.forEach((c) => { if (!tags.includes(c)) tags.push(c); });
    const en = part.replace(/[\u4e00-\u9fff]/g, '').trim().toLowerCase();
    if (en && en.length >= 2 && !['the', 'a', 'an', 'of', 'in', 'on', 'at'].includes(en)) {
      tags.push(en);
    }
  }

  return tags.slice(0, 8);
}

function guessCategory(filename: string): string {
  const name = filename.toLowerCase();
  const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();
  const isVideo = ['.mp4', '.webm', '.mov'].includes(ext);

  if (isVideo) {
    if (name.includes('漫剧') || name.includes('动画') || name.includes('动漫') || name.includes('anime')) return 'ai-animation-drama';
    if (name.includes('真人') || name.includes('实拍') || name.includes('short')) return 'ai-creative-short';
    if (name.includes('预告') || name.includes('trailer') || name.includes('concept')) return 'ai-concept-trailer';
    return 'ai-creative-short';
  }

  if (name.includes('漫剧') || name.includes('动画') || name.includes('anime')) return 'ai-animation-drama';
  if (name.includes('预告') || name.includes('trailer') || name.includes('concept')) return 'ai-concept-trailer';
  return 'ai-image-art';
}

// ─── B站 URL 解析 ────────────────────────────────────────────────────
// Extract BV number from various B站 URL formats.

function extractBvid(input: string): string | null {
  const match = input.match(/[Bb][Vv][a-zA-Z0-9]{10,12}/);
  return match ? match[0] : null;
}

// ─── UploadModal ────────────────────────────────────────────────────

export function UploadModal({ open, onClose, onSuccess, onNotify }: UploadModalProps) {
  const locale = useLocale();
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');
  const [autoMode, setAutoMode] = useState(false);
  const [bilibiliUrl, setBilibiliUrl] = useState('');
  const [uploadKey, setUploadKey] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError('');
    setTitle(guessTitle(f.name));
    const guessedCat = guessCategory(f.name);
    setCategory(guessedCat);
    const guessedTags = guessTags(f.name);
    setTags(guessedTags.join(', '));
    setAutoMode(true);
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview('');
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (!f) return;
    setFile(f);
    setError('');
    setTitle(guessTitle(f.name));
    const guessedCat = guessCategory(f.name);
    setCategory(guessedCat);
    const guessedTags = guessTags(f.name);
    setTags(guessedTags.join(', '));
    setAutoMode(true);
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview('');
    }
  }, []);

  const reset = useCallback(() => {
    setTitle('');
    setCategory('');
    setTags('');
    setDescription('');
    setFile(null);
    setError('');
    setPreview('');
    setUploading(false);
    setAutoMode(false);
    setBilibiliUrl('');
    setUploadKey('');
    setShowPwd(false);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const bvid = extractBvid(bilibiliUrl);

    if (!file && !bvid) {
      setError(locale === 'zh-CN' ? '请选择图片或填写 B站链接' : 'Select an image or provide a Bilibili link');
      return;
    }

    if (!uploadKey) {
      setError(locale === 'zh-CN' ? '请输入上传密码' : 'Please enter upload key');
      return;
    }

    // Client-side validation: file type must match selected category
    const VIDEO_CATEGORIES = ['ai-animation-drama', 'ai-live-drama', 'ai-concept-trailer', 'ai-creative-short'];
    const isVideoFile = file?.type.startsWith('video/');
    const isImageFile = file?.type.startsWith('image/');
    if (file && category && VIDEO_CATEGORIES.includes(category) && !isVideoFile) {
      const msg = locale === 'zh-CN'
        ? '视频分类不能上传图片文件，请选择视频文件'
        : 'Video categories only accept video files. Please select a video.';
      setError(msg);
      return;
    }
    if (file && category === 'ai-image-art' && !isImageFile) {
      const msg = locale === 'zh-CN'
        ? '图片分类不能上传视频文件，请选择图片文件'
        : 'Image category only accepts image files. Please select an image.';
      setError(msg);
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      if (file) formData.append('file', file);
      formData.append('title', title.trim());
      formData.append('category', category);
      formData.append('tags', tags);
      formData.append('description', description.trim());
      if (bvid) formData.append('bvid', bvid);
      formData.append('upload_key', uploadKey);

      const res = await fetch('/api/works/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (!data.success) {
        const msg = data.error || (locale === 'zh-CN' ? '上传失败' : 'Upload failed');
        setError(msg);
        onNotify?.(msg, 'error');
      } else {
        onNotify?.(locale === 'zh-CN' ? '上传成功' : 'Upload successful', 'success');
        reset();
        setTimeout(() => onSuccess(), 1200);
      }
    } catch {
      const msg = locale === 'zh-CN' ? '网络错误，请重试' : 'Network error, please retry';
      setError(msg);
      onNotify?.(msg, 'error');
    } finally {
      setUploading(false);
    }
  }, [file, title, category, tags, description, bilibiliUrl, uploadKey, locale, reset, onSuccess, onNotify]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  if (!open) return null;

  return (
    <div className="upload-modal-overlay" onClick={handleOverlayClick}>
      <div className="upload-modal-dialog" role="dialog" aria-label={locale === 'zh-CN' ? '上传作品' : 'Upload Work'}>
        <div className="upload-modal-header">
          <h2 className="upload-modal-title">
            {locale === 'zh-CN' ? '上传作品' : 'Upload Work'}
          </h2>
          <button
            type="button"
            className="upload-modal-close"
            onClick={handleClose}
            aria-label={locale === 'zh-CN' ? '关闭' : 'Close'}
          >
            ✕
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="upload-modal-form">
          {/* File input */}
          <div className="upload-modal-field">
            <label className="upload-modal-label">
              {locale === 'zh-CN' ? '上传图片' : 'Upload Image'}
            </label>
            <div
              className="upload-modal-dropzone"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Preview" className="upload-modal-preview" />
              ) : file ? (
                <p className="upload-modal-file-name">{file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)</p>
              ) : (
                <div className="upload-modal-dropzone-text">
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>{locale === 'zh-CN' ? '点击选择图片' : 'Click to select an image'}</p>
                  <p className="upload-modal-hint">{locale === 'zh-CN' ? 'JPG / PNG / WebP / GIF' : 'JPG / PNG / WebP / GIF'}</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="upload-modal-file-input"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Auto-generated info banner */}
          {autoMode && file && (
            <div className="upload-modal-auto-info">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>
                {locale === 'zh-CN'
                  ? '已自动识别分类和标签，你可以修改或直接上传'
                  : 'Category & tags auto-detected. You can edit or upload directly.'}
              </span>
            </div>
          )}

          {/* Title */}
          <div className="upload-modal-field">
            <label className="upload-modal-label">
              {locale === 'zh-CN' ? '作品标题' : 'Title'}
            </label>
            <input
              type="text"
              className="upload-modal-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={locale === 'zh-CN' ? '自动从文件名生成' : 'Auto-detected from filename'}
              maxLength={100}
            />
          </div>

          {/* Category */}
          <div className="upload-modal-field">
            <label className="upload-modal-label">
              {locale === 'zh-CN' ? '分类' : 'Category'}
            </label>
            <div className="upload-modal-select-wrap">
              <select
                className="upload-modal-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">{locale === 'zh-CN' ? '自动识别' : 'Auto-detect'}</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {locale === 'zh-CN' ? cat.label.zh : cat.label.en}
                  </option>
                ))}
              </select>
              <span className="upload-modal-select-arrow">&#9660;</span>
            </div>
          </div>

          {/* Tags */}
          <div className="upload-modal-field">
            <label className="upload-modal-label">
              {locale === 'zh-CN' ? '标签' : 'Tags'}
            </label>
            <input
              type="text"
              className="upload-modal-input"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder={locale === 'zh-CN' ? '用逗号分隔，如：古风, 夜景, 科幻' : 'Separate with commas, e.g. anime, night, sci-fi'}
            />
          </div>

          {/* Description */}
          <div className="upload-modal-field">
            <label className="upload-modal-label">
              {locale === 'zh-CN' ? '描述' : 'Description'}
            </label>
            <textarea
              className="upload-modal-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={locale === 'zh-CN' ? '简短描述这个作品...' : 'A short description of the work...'}
              rows={2}
              maxLength={500}
            />
          </div>

          {/* B站链接 — 可选 */}
          <div className="upload-modal-field">
            <label className="upload-modal-label" style={{ color: '#A78BFA' }}>
              {locale === 'zh-CN' ? '▶ 上传视频（B站链接）' : '▶ Upload Video (Bilibili Link)'}
            </label>
            <input
              type="url"
              className="upload-modal-input"
              value={bilibiliUrl}
              onChange={(e) => setBilibiliUrl(e.target.value)}
              placeholder={
                locale === 'zh-CN'
                  ? 'https://www.bilibili.com/video/BV1xx411c7mD'
                  : 'https://www.bilibili.com/video/BV1xx411c7mD'
              }
            />
            {bilibiliUrl && extractBvid(bilibiliUrl) && (
              <p className="upload-modal-hint" style={{ color: '#A78BFA', marginTop: '0.25rem' }}>
                {locale === 'zh-CN'
                  ? `已识别 BV 号：${extractBvid(bilibiliUrl)}`
                  : `BV number: ${extractBvid(bilibiliUrl)}`}
              </p>
            )}
            {bilibiliUrl && !extractBvid(bilibiliUrl) && (
              <p className="upload-modal-hint" style={{ color: '#F87171', marginTop: '0.25rem' }}>
                {locale === 'zh-CN'
                  ? '无法识别 BV 号，请检查链接格式'
                  : 'Cannot detect BV number, please check the link'}
              </p>
            )}
          </div>

          {/* Error */}
          {error && <p className="upload-modal-error">{error}</p>}

          <div className="upload-modal-field" style={{ position: 'relative' }}>
            <input type={showPwd ? 'text' : 'password'} className="upload-modal-input" value={uploadKey}
              onChange={(e) => setUploadKey(e.target.value)}
              placeholder={locale === 'zh-CN' ? '上传密码' : 'Upload key'}
              style={{ fontSize: '0.8rem', padding: '8px 34px 8px 10px', width: '100%' }} />
            <span onClick={() => setShowPwd(!showPwd)}
              style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#888', fontSize: '0.85rem', userSelect: 'none' }}>
              {showPwd ? '🙈' : '👁'}
            </span>
          </div>

          {/* Actions */}
          <div className="upload-modal-actions">
            <button
              type="button"
              className="upload-modal-btn upload-modal-btn--cancel"
              onClick={handleClose}
              disabled={uploading}
            >
              {locale === 'zh-CN' ? '取消' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="upload-modal-btn upload-modal-btn--submit"
              disabled={uploading || (!file && !extractBvid(bilibiliUrl))}
            >
              {uploading ? (
                <span className="upload-modal-loading">
                  <span className="upload-modal-spinner" />
                  {locale === 'zh-CN' ? '上传中...' : 'Uploading...'}
                </span>
              ) : (
                locale === 'zh-CN' ? '上传' : 'Upload'
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .upload-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          animation: um-fadeIn 0.15s ease-out;
        }

        @keyframes um-fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .upload-modal-dialog {
          background: #15152A;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 1rem;
          width: 100%;
          max-width: 520px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 16px 64px rgba(0, 0, 0, 0.5);
        }

        .upload-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .upload-modal-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #FFF;
          margin: 0;
        }

        .upload-modal-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          color: #8B8B9E;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 150ms ease;
        }
        .upload-modal-close:hover {
          color: #FFF;
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .upload-modal-form {
          padding: 1.25rem 1.5rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .upload-modal-field {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .upload-modal-label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #C0C0D0;
        }

        .upload-modal-required {
          color: #EF4444;
          margin-left: 2px;
        }

        .upload-modal-dropzone {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 120px;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px dashed rgba(255, 255, 255, 0.15);
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 150ms ease;
          text-align: center;
        }
        .upload-modal-dropzone:hover {
          border-color: #7C3AED;
          background: rgba(124, 58, 237, 0.05);
        }

        .upload-modal-dropzone-text {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: #6B6B80;
          font-size: 0.8125rem;
        }
        .upload-modal-dropzone-text svg { color: #7C3AED; }

        .upload-modal-hint {
          font-size: 0.6875rem;
          color: #4B4B60;
        }

        .upload-modal-preview {
          max-height: 200px;
          max-width: 100%;
          object-fit: contain;
          border-radius: 0.5rem;
        }

        .upload-modal-file-name {
          font-size: 0.8125rem;
          color: #A0A0B0;
          margin: 0;
        }

        .upload-modal-file-input { display: none; }

        .upload-modal-auto-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.75rem;
          color: #8B8B9E;
          background: rgba(124, 58, 237, 0.08);
          border: 1px solid rgba(124, 58, 237, 0.15);
          border-radius: 0.5rem;
          line-height: 1.4;
        }
        .upload-modal-auto-info svg {
          color: #7C3AED;
          flex-shrink: 0;
        }

        .upload-modal-input,
        .upload-modal-select,
        .upload-modal-textarea {
          width: 100%;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          font-family: inherit;
          color: #E0E0F0;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 0.5rem;
          outline: none;
          transition: border-color 150ms ease, box-shadow 150ms ease;
          box-sizing: border-box;
        }
        .upload-modal-input:focus,
        .upload-modal-select:focus,
        .upload-modal-textarea:focus {
          border-color: #7C3AED;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15);
        }
        .upload-modal-input::placeholder,
        .upload-modal-textarea::placeholder {
          color: #4B4B60;
        }

        .upload-modal-select-wrap {
          position: relative;
        }
        .upload-modal-select {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          padding-right: 2rem;
          cursor: pointer;
        }
        .upload-modal-select-arrow {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #6B6B80;
          font-size: 0.625rem;
          pointer-events: none;
        }
        .upload-modal-select option {
          background: #1A1A2E;
          color: #E0E0F0;
        }

        .upload-modal-textarea {
          resize: vertical;
          min-height: 60px;
        }

        .upload-modal-error {
          font-size: 0.8125rem;
          color: #EF4444;
          margin: 0;
          padding: 0.5rem 0.75rem;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 0.5rem;
        }

        .upload-modal-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
          padding-top: 0.5rem;
        }

        .upload-modal-btn {
          padding: 0.625rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          font-family: inherit;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 150ms ease;
          border: none;
        }
        .upload-modal-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .upload-modal-btn--cancel {
          background: rgba(255, 255, 255, 0.04);
          color: #8B8B9E;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .upload-modal-btn--cancel:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.08);
          color: #FFFFFF;
        }

        .upload-modal-btn--submit {
          background: linear-gradient(135deg, #7C3AED, #A855F7);
          color: #FFFFFF;
          box-shadow: 0 2px 8px rgba(124, 58, 237, 0.25);
        }
        .upload-modal-btn--submit:hover:not(:disabled) {
          box-shadow: 0 4px 16px rgba(124, 58, 237, 0.4);
          transform: translateY(-1px);
        }

        .upload-modal-loading {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .upload-modal-spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #FFFFFF;
          border-radius: 50%;
          animation: um-spin 0.6s linear infinite;
        }

        @keyframes um-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}