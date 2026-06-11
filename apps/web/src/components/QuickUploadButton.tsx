'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useLocale } from 'next-intl';

interface QuickUploadButtonProps {
  onSuccess: () => void;
}

export function QuickUploadButton({ onSuccess }: QuickUploadButtonProps) {
  const locale = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Client-side check: if file type mismatches auto-detected category,
      // warn early — server will also validate
      const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
      const videoExts = ['.mp4', '.webm', '.mov'];
      const imageExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'];
      const name = file.name.toLowerCase();
      const isVideo = videoExts.includes(ext);
      const isImage = imageExts.includes(ext);
      // If it's an image but filename suggests a video category, warn
      if (isImage && (name.includes('漫剧') || name.includes('动画') || name.includes('预告') || name.includes('trailer'))) {
        const msg = locale === 'zh-CN'
          ? '图片文件名包含视频分类关键词，可能被拒绝。建议使用正式上传选择正确的分类'
          : 'Image filename contains video category keywords — upload may be rejected. Use the full upload form to select the correct category.';
        setToast({ message: msg, type: 'error' });
        setUploading(false);
        return;
      }

      const res = await fetch('/api/works/quick-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setToast({
          message: locale === 'zh-CN' ? '上传成功' : 'Upload successful',
          type: 'success',
        });
        onSuccess();
      } else {
        setToast({
          message: data.error || (locale === 'zh-CN' ? '上传失败' : 'Upload failed'),
          type: 'error',
        });
      }
    } catch {
      setToast({
        message: locale === 'zh-CN' ? '上传失败，请稍后重试' : 'Upload failed, please try again',
        type: 'error',
      });
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const label = locale === 'zh-CN' ? '快速上传' : 'Quick Upload';

  return (
    <>
      <button
        type="button"
        className="quick-upload-btn"
        onClick={handleClick}
        disabled={uploading}
        title={locale === 'zh-CN' ? '一键上传，自动分类' : 'One-click upload, auto-categorized'}
      >
        {uploading ? (
          <span className="quick-upload-btn__spinner" />
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="quick-upload-btn__label">{label}</span>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.gif,.avif,.mp4,.webm,.mov"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Toast notification */}
      {toast && (
        <div className={`quick-upload-toast quick-upload-toast--${toast.type}`}>
          <span className="quick-upload-toast-icon">{toast.type === 'success' ? '✓' : '✕'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      <style>{`
        .quick-upload-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 0.85rem;
          font-size: 0.8125rem;
          font-weight: 600;
          font-family: inherit;
          color: rgba(255,255,255,0.65);
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 150ms ease;
          flex-shrink: 0;
          white-space: nowrap;
        }
        .quick-upload-btn:hover:not(:disabled) {
          color: #FFFFFF;
          background: rgba(124,58,237,0.15);
          border-color: rgba(124,58,237,0.35);
          box-shadow: 0 0 12px rgba(124,58,237,0.15);
        }
        .quick-upload-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .quick-upload-btn__label {
          font-size: 0.8125rem;
        }
        .quick-upload-btn__spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.15);
          border-top-color: #7C3AED;
          border-radius: 50%;
          animation: quick-spin 0.6s linear infinite;
        }
        @keyframes quick-spin {
          to { transform: rotate(360deg); }
        }

        .quick-upload-toast {
          position: fixed;
          bottom: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          font-weight: 600;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          animation: qu-toastIn 0.25s ease-out, qu-toastOut 0.25s ease-in 2.75s forwards;
          z-index: 2000;
          pointer-events: none;
        }
        .quick-upload-toast--success {
          background: #065F46;
          color: #A7F3D0;
          border: 1px solid rgba(167, 243, 208, 0.15);
        }
        .quick-upload-toast--error {
          background: #7F1D1D;
          color: #FECACA;
          border: 1px solid rgba(254, 202, 202, 0.15);
        }
        .quick-upload-toast-icon {
          font-size: 1rem;
          font-weight: 700;
        }
        @keyframes qu-toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes qu-toastOut {
          from { opacity: 1; }
          to { opacity: 0; transform: translateX(-50%) translateY(-10px); }
        }
      `}</style>
    </>
  );
}
