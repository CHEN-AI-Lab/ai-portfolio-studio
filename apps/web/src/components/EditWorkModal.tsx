'use client';

import React, { useState, useCallback } from 'react';
import { useLocale } from 'next-intl';
import type { WorkItem } from 'shared';

function extractBvid(input: string): string | null {
  const match = input.match(/[Bb][Vv][a-zA-Z0-9]{10,12}/);
  return match ? match[0] : null;
}

// ─── Props ──────────────────────────────────────────────────────────

interface EditWorkModalProps {
  work: WorkItem;
  onClose: () => void;
  onSaved: () => void;
  onNotify?: (message: string, type: 'success' | 'error') => void;
}

// ─── EditWorkModal ──────────────────────────────────────────────────

export function EditWorkModal({ work, onClose, onSaved, onNotify }: EditWorkModalProps) {
  const locale = useLocale();

  const [title, setTitle] = useState(work.title || '');
  const [tags, setTags] = useState(Array.isArray(work.tags) ? work.tags.join(', ') : '');
  const [description, setDescription] = useState(work.description || '');
  const [bvid, setBvid] = useState(work.bvid || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/works/uploads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: work.id,
          title: title.trim(),
          tags,
          description: description.trim(),
          bvid: bvid || undefined,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || (locale === 'zh-CN' ? '保存失败' : 'Save failed'));
      } else {
        onNotify?.(locale === 'zh-CN' ? '作品已保存' : 'Work saved', 'success');
        onSaved();
      }
    } catch {
      setError(locale === 'zh-CN' ? '网络错误，请重试' : 'Network error, please retry');
    } finally {
      setSaving(false);
    }
  }, [work.id, title, tags, description, bvid, onNotify, locale, onSaved]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    setError('');
    try {
      const res = await fetch('/api/works/uploads', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: work.id }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || (locale === 'zh-CN' ? '删除失败' : 'Delete failed'));
        setConfirmDelete(false);
      } else {
        onNotify?.(locale === 'zh-CN' ? '作品已删除' : 'Work deleted', 'success');
        onSaved(); // closes modal and refreshes list
      }
    } catch {
      setError(locale === 'zh-CN' ? '网络错误，请重试' : 'Network error, please retry');
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  }, [work.id, onNotify, locale, onSaved]);

  return (
    <div className="edit-modal__overlay" onClick={handleOverlayClick}>
      <div className="edit-modal" role="dialog" aria-label={locale === 'zh-CN' ? '编辑作品' : 'Edit Work'}>
        <div className="edit-modal__header">
          <h2 className="edit-modal__title">
            {locale === 'zh-CN' ? '编辑作品' : 'Edit Work'}
          </h2>
          <button
            type="button"
            className="edit-modal__close"
            onClick={onClose}
            aria-label={locale === 'zh-CN' ? '关闭' : 'Close'}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-modal__form">
          {/* Title */}
          <div className="edit-modal__field">
            <label className="edit-modal__label">
              {locale === 'zh-CN' ? '作品标题' : 'Title'}
            </label>
            <input
              type="text"
              className="edit-modal__input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              placeholder={locale === 'zh-CN' ? '输入作品标题' : 'Enter work title'}
            />
          </div>

          {/* Tags */}
          <div className="edit-modal__field">
            <label className="edit-modal__label">
              {locale === 'zh-CN' ? '标签' : 'Tags'}
            </label>
            <input
              type="text"
              className="edit-modal__input"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder={locale === 'zh-CN' ? '用逗号分隔，如：古风, 夜景' : 'Separate with commas, e.g. anime, night'}
            />
          </div>

          {/* Description */}
          <div className="edit-modal__field">
            <label className="edit-modal__label">
              {locale === 'zh-CN' ? '描述' : 'Description'}
            </label>
            <textarea
              className="edit-modal__textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder={locale === 'zh-CN' ? '简短描述...' : 'A short description...'}
            />
          </div>

          {/* B站链接 */}
          <div className="edit-modal__field">
            <label className="edit-modal__label">
              {locale === 'zh-CN' ? 'B站视频链接' : 'Bilibili Video Link'}
            </label>
            <input
              type="url"
              className="edit-modal__input"
              value={bvid ? `https://www.bilibili.com/video/${bvid}` : ''}
              onChange={(e) => {
                const val = e.target.value;
                const extracted = extractBvid(val);
                setBvid(extracted || '');
              }}
              placeholder={
                locale === 'zh-CN'
                  ? 'https://www.bilibili.com/video/BV1xx411c7mD'
                  : 'https://www.bilibili.com/video/BV1xx411c7mD'
              }
            />
            {bvid && (
              <p className="edit-modal__hint">
                BV: {bvid}
              </p>
            )}
          </div>

          {/* Error */}
          {error && <p className="edit-modal__error">{error}</p>}

          {/* Actions */}
          <div className="edit-modal__actions">
            {confirmDelete ? (
              <>
                <button
                  type="button"
                  className="edit-modal__btn edit-modal__btn--cancel"
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleting}
                >
                  {locale === 'zh-CN' ? '取消删除' : 'Cancel'}
                </button>
                <button
                  type="button"
                  className="edit-modal__btn edit-modal__btn--delete-confirm"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <span className="edit-modal__loading">
                      <span className="edit-modal__spinner" />
                      {locale === 'zh-CN' ? '删除中...' : 'Deleting...'}
                    </span>
                  ) : (
                    locale === 'zh-CN' ? '确认删除' : 'Confirm Delete'
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="edit-modal__btn edit-modal__btn--delete"
                  onClick={() => setConfirmDelete(true)}
                  disabled={saving}
                >
                  {locale === 'zh-CN' ? '删除' : 'Delete'}
                </button>
                <button
                  type="button"
                  className="edit-modal__btn edit-modal__btn--cancel"
                  onClick={onClose}
                  disabled={saving}
                >
                  {locale === 'zh-CN' ? '取消' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="edit-modal__btn edit-modal__btn--save"
                  disabled={saving}
                >
                  {saving ? (
                    <span className="edit-modal__loading">
                      <span className="edit-modal__spinner" />
                      {locale === 'zh-CN' ? '保存中...' : 'Saving...'}
                    </span>
                  ) : (
                    locale === 'zh-CN' ? '保存' : 'Save'
                  )}
                </button>
              </>
            )}
          </div>
        </form>
      </div>

      <style jsx>{`
        .edit-modal__overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1001;
          padding: 1rem;
          animation: fadeIn 0.15s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .edit-modal {
          background: #15152A;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 1rem;
          width: 100%;
          max-width: 460px;
          box-shadow: 0 16px 64px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.2s ease-out;
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .edit-modal__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .edit-modal__title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #FFFFFF;
          margin: 0;
        }

        .edit-modal__close {
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

        .edit-modal__close:hover {
          color: #FFFFFF;
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .edit-modal__form {
          padding: 1.25rem 1.5rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .edit-modal__field {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .edit-modal__label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #C0C0D0;
        }

        .edit-modal__input,
        .edit-modal__textarea {
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
        }

        .edit-modal__input:focus,
        .edit-modal__textarea:focus {
          border-color: #7C3AED;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15);
        }

        .edit-modal__input::placeholder,
        .edit-modal__textarea::placeholder {
          color: #4B4B60;
        }

        .edit-modal__textarea {
          resize: vertical;
          min-height: 60px;
        }

        .edit-modal__error {
          font-size: 0.8125rem;
          color: #EF4444;
          margin: 0;
          padding: 0.5rem 0.75rem;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 0.5rem;
        }

        .edit-modal__hint {
          font-size: 0.75rem;
          color: #A78BFA;
          margin: 0.25rem 0 0;
        }

        .edit-modal__actions {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
          padding-top: 0.5rem;
        }

        .edit-modal__btn {
          padding: 0.625rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          font-family: inherit;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 150ms ease;
          border: none;
        }

        .edit-modal__btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .edit-modal__btn--cancel {
          background: rgba(255, 255, 255, 0.04);
          color: #8B8B9E;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .edit-modal__btn--cancel:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.08);
          color: #FFFFFF;
        }

        .edit-modal__btn--delete {
          background: transparent;
          color: #EF4444;
          border: 1px solid rgba(239, 68, 68, 0.25);
          margin-right: auto;
        }

        .edit-modal__btn--delete:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.4);
        }

        .edit-modal__btn--delete-confirm {
          background: #EF4444;
          color: #FFFFFF;
          border: none;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
        }

        .edit-modal__btn--delete-confirm:hover:not(:disabled) {
          background: #DC2626;
          box-shadow: 0 4px 16px rgba(239, 68, 68, 0.5);
        }

        .edit-modal__btn--save {
          background: linear-gradient(135deg, #7C3AED, #A855F7);
          color: #FFFFFF;
          box-shadow: 0 2px 8px rgba(124, 58, 237, 0.25);
        }

        .edit-modal__btn--save:hover:not(:disabled) {
          box-shadow: 0 4px 16px rgba(124, 58, 237, 0.4);
          transform: translateY(-1px);
        }

        .edit-modal__loading {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .edit-modal__spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #FFFFFF;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
