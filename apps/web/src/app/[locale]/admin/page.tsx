'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/navigation'
import { CATEGORIES } from 'shared'
import type { WorkItem } from 'shared'
import { UploadModal } from '@/components/UploadModal'
import { EditWorkModal } from '@/components/EditWorkModal'

// Admin-specific type that extends WorkItem with view tracking
interface AdminWork extends WorkItem {
  views?: number
}

export default function AdminPage() {
  const t = useTranslations('admin')
  const ct = useTranslations('common')
  const locale = useLocale()

  // Password gate
  const [password, setPassword] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [pwdError, setPwdError] = useState(false)

  // Data
  const [works, setWorks] = useState<AdminWork[]>([])
  const [loading, setLoading] = useState(true)

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [editingWork, setEditingWork] = useState<AdminWork | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(timer)
  }, [toast])

  const handleNotify = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type })
  }, [])

  // Fetch works from Supabase
  const fetchWorks = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/works/uploads')
      const data = await res.json()
      if (data.success && Array.isArray(data.works)) {
        setWorks(data.works)
      }
    } catch {} finally {
      setLoading(false)
    }
  }, [])

  // Handle unlock
  const handleUnlock = async () => {
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        setUnlocked(true)
        setPwdError(false)
        fetchWorks()
      } else {
        setPwdError(true)
      }
    } catch {
      setPwdError(true)
    }
  }

  // Toggle featured
  const handleToggleFeatured = async (id: string, current: boolean) => {
    try {
      const res = await fetch('/api/works/uploads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, featured: !current }),
      })
      const data = await res.json()
      if (data.success) {
        setWorks(prev => prev.map(w => w.id === id ? { ...w, featured: !current } : w))
      }
    } catch {}
  }

  // Delete work
  const handleDelete = async (id: string) => {
    if (!window.confirm(t('deleteConfirm'))) return
    try {
      const res = await fetch('/api/works/uploads', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = await res.json()
      if (data.success) {
        setWorks(prev => prev.filter(w => w.id !== id))
        handleNotify(t('deleteSuccess') || 'Deleted', 'success')
      }
    } catch {}
  }

  // Stats
  const stats = {
    total: works.length,
    videos: works.filter(w => w.type === 'video').length,
    images: works.filter(w => w.type === 'image').length,
    categories: new Set(works.map(w => w.category)).size,
    totalViews: works.reduce((sum, w) => sum + (w.views ?? 0), 0),
  }

  // Category filter
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const filteredWorks = activeCategory
    ? works.filter(w => w.category === activeCategory)
    : works

  // Password gate UI
  if (!unlocked) {
    return (
      <div className="admin-gate">
        <div className="admin-gate__box">
          <h1 className="admin-gate__title">{t('title')}</h1>
          <p className="admin-gate__subtitle">{t('subtitle')}</p>
          <div className="admin-gate__field">
            <input
              type="password"
              className="admin-gate__input"
              value={password}
              onChange={e => { setPassword(e.target.value); setPwdError(false) }}
              onKeyDown={e => e.key === 'Enter' && handleUnlock()}
              placeholder={t('passwordPlaceholder')}
              autoFocus
            />
          </div>
          {pwdError && <p className="admin-gate__error">{t('wrongPassword')}</p>}
          <button className="admin-gate__btn" onClick={handleUnlock}>
            {t('unlock')}
          </button>
        </div>

        <style>{`
          .admin-gate {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #0A0A0F;
            padding: 24px;
          }
          .admin-gate__box {
            background: #15152A;
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 16px;
            padding: 40px 32px;
            max-width: 400px;
            width: 100%;
            text-align: center;
          }
          .admin-gate__title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #FFFFFF;
            margin: 0 0 8px;
          }
          .admin-gate__subtitle {
            font-size: 0.875rem;
            color: #6B6B80;
            margin: 0 0 24px;
          }
          .admin-gate__field { margin-bottom: 12px; }
          .admin-gate__input {
            width: 100%;
            padding: 12px 16px;
            font-size: 0.9rem;
            font-family: inherit;
            color: #E0E0F0;
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            outline: none;
            box-sizing: border-box;
          }
          .admin-gate__input:focus {
            border-color: #7C3AED;
            box-shadow: 0 0 0 3px rgba(124,58,237,0.15);
          }
          .admin-gate__error {
            font-size: 0.8125rem;
            color: #EF4444;
            margin: 0 0 12px;
          }
          .admin-gate__btn {
            width: 100%;
            padding: 12px;
            font-size: 0.9rem;
            font-weight: 600;
            font-family: inherit;
            color: #FFFFFF;
            background: linear-gradient(135deg, #7C3AED, #EC4899);
            border: none;
            border-radius: 8px;
            cursor: pointer;
          }
          .admin-gate__btn:hover {
            opacity: 0.9;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header__inner">
          <div>
            <h1 className="admin-header__title">{t('title')}</h1>
            <p className="admin-header__subtitle">{t('subtitle')}</p>
          </div>
          <div className="admin-header__actions">
            <button
              type="button"
              className="admin-header__upload-btn"
              onClick={() => setShowUploadModal(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>{locale === 'zh-CN' ? '上传' : 'Upload'}</span>
            </button>
            <Link href="/works" className="admin-header__back">
              ← {t('backToSite')}
            </Link>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="admin-stats">
        <div className="admin-stats__inner">
          <div className="admin-stat-card">
            <div className="admin-stat-card__value">{stats.total}</div>
            <div className="admin-stat-card__label">{t('totalWorks')}</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-card__value">{stats.videos}</div>
            <div className="admin-stat-card__label">{t('videos')}</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-card__value">{stats.images}</div>
            <div className="admin-stat-card__label">{t('images')}</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-card__value">{stats.categories}</div>
            <div className="admin-stat-card__label">{t('categories')}</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-card__value">{stats.totalViews}</div>
            <div className="admin-stat-card__label">{t('totalViews')}</div>
          </div>
        </div>
      </div>

      {/* Works table */}
      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <h2 className="admin-table-title">
            {t('tableTitle')}
            {activeCategory && (
              <span className="admin-table-count">
                ({filteredWorks.length})
              </span>
            )}
          </h2>
          {/* Category filter */}
          <div className="admin-cat-filter">
            <button
              type="button"
              className={`admin-cat-filter__btn${!activeCategory ? ' active' : ''}`}
              onClick={() => setActiveCategory(null)}
            >
              {locale === 'zh-CN' ? '全部' : 'All'}
            </button>
            {CATEGORIES.map(cat => {
              const count = works.filter(w => w.category === cat.id).length
              if (count === 0) return null
              const label = locale === 'zh-CN' ? cat.label.zh : cat.label.en
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`admin-cat-filter__btn${activeCategory === cat.id ? ' active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.icon} {label} ({count})
                </button>
              )
            })}
          </div>
        </div>
        {loading ? (
          <p style={{ color: '#6B6B80', textAlign: 'center', padding: '40px 0' }}>{ct('loading')}</p>
        ) : filteredWorks.length === 0 ? (
          <p style={{ color: '#6B6B80', textAlign: 'center', padding: '40px 0' }}>{activeCategory ? t('noWorks') : t('noWorks')}</p>
        ) : (
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t('titleCol')}</th>
                  <th>{t('categoryCol')}</th>
                  <th>{t('typeCol')}</th>
                  <th>{t('viewsCol')}</th>
                  <th>{t('featuredCol')}</th>
                  <th>{t('actionsCol')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorks.map(w => {
                  const cat = CATEGORIES.find(c => c.id === w.category)
                  const catLabel = cat ? (locale === 'zh-CN' ? cat.label.zh : cat.label.en) : w.category
                  return (
                    <tr key={w.id}>
                      <td className="admin-table__title">{w.title}</td>
                      <td><span className="admin-table__badge">{catLabel}</span></td>
                      <td>{w.type === 'video' ? '🎬' : '🖼️'}</td>
                      <td>{w.views ?? 0}</td>
                      <td>
                        <button
                          className={`admin-table__featured-btn${w.featured ? ' active' : ''}`}
                          onClick={() => handleToggleFeatured(w.id!, !!w.featured)}
                          title={t('toggleFeatured')}
                        >
                          {w.featured ? '★' : '☆'}
                        </button>
                      </td>
                      <td>
                        <div className="admin-table__action-btns">
                          <button
                            className="admin-table__edit-btn"
                            onClick={() => setEditingWork(w)}
                            title={locale === 'zh-CN' ? '编辑' : 'Edit'}
                          >
                            ✎
                          </button>
                          <button
                            className="admin-table__delete-btn"
                            onClick={() => handleDelete(w.id!)}
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <UploadModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={() => {
          setShowUploadModal(false)
          fetchWorks()
        }}
        onNotify={handleNotify}
      />

      {/* Edit Work Modal */}
      {editingWork && (
        <EditWorkModal
          work={editingWork}
          onClose={() => setEditingWork(null)}
          onSaved={() => {
            setEditingWork(null)
            fetchWorks()
          }}
          onNotify={handleNotify}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`admin-toast admin-toast--${toast.type}`}>
          <span className="admin-toast-icon">{toast.type === 'success' ? '✓' : '✕'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      <style>{`
        .admin-page {
          min-height: 100vh;
          background: #0A0A0F;
          padding-top: 64px;
        }
        .admin-header {
          background: #12121A;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 24px 0;
        }
        .admin-header__inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .admin-header__title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #FFFFFF;
          margin: 0 0 4px;
        }
        .admin-header__subtitle {
          font-size: 0.875rem;
          color: #6B6B80;
          margin: 0;
        }
        .admin-header__actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .admin-header__upload-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          font-size: 0.875rem;
          font-weight: 600;
          font-family: inherit;
          color: #FFFFFF;
          background: linear-gradient(135deg, #7C3AED, #EC4899);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          white-space: nowrap;
        }
        .admin-header__upload-btn:hover {
          opacity: 0.9;
        }
        .admin-header__back {
          color: #A78BFA;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          white-space: nowrap;
        }
        .admin-header__back:hover { color: #C4B5FD; }

        .admin-stats {
          padding: 24px 0;
        }
        .admin-stats__inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 12px;
        }
        .admin-stat-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
        }
        .admin-stat-card__value {
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #7C3AED, #EC4899);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
        }
        .admin-stat-card__label {
          font-size: 0.8125rem;
          color: #6B6B80;
          margin-top: 4px;
        }

        .admin-table-wrap {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px 60px;
        }
        .admin-table-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 16px;
        }
        .admin-table-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #FFFFFF;
          margin: 0;
        }
        .admin-table-count {
          font-size: 0.875rem;
          font-weight: 400;
          color: #6B6B80;
          margin-left: 4px;
        }
        .admin-cat-filter {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .admin-cat-filter__btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 5px 12px;
          font-size: 0.8125rem;
          font-weight: 500;
          font-family: inherit;
          color: #8B8B9E;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 9999px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 150ms ease;
        }
        .admin-cat-filter__btn:hover {
          color: #E0E0F0;
          background: rgba(255,255,255,0.06);
        }
        .admin-cat-filter__btn.active {
          color: #FFFFFF;
          background: rgba(124,58,237,0.15);
          border-color: rgba(124,58,237,0.3);
        }
        .admin-table-scroll {
          overflow-x: auto;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }
        .admin-table th {
          text-align: left;
          padding: 12px 16px;
          font-weight: 600;
          color: #6B6B80;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background: rgba(255,255,255,0.02);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .admin-table td {
          padding: 12px 16px;
          color: #C0C0D0;
          border-bottom: 1px solid rgba(255,255,255,0.03);
        }
        .admin-table tr:last-child td { border-bottom: none; }
        .admin-table__title {
          color: #FFFFFF;
          font-weight: 500;
          max-width: 280px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .admin-table__badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 9999px;
          font-size: 0.75rem;
          background: rgba(124,58,237,0.12);
          color: #A78BFA;
        }
        .admin-table__featured-btn {
          background: none;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          color: #4A4A60;
          padding: 4px;
        }
        .admin-table__featured-btn.active { color: #FBBF24; }
        .admin-table__featured-btn:hover { opacity: 0.8; }
        .admin-table__action-btns {
          display: flex;
          gap: 6px;
        }
        .admin-table__edit-btn {
          background: rgba(96,165,250,0.1);
          border: 1px solid rgba(96,165,250,0.2);
          color: #93C5FD;
          border-radius: 6px;
          padding: 4px 10px;
          cursor: pointer;
          font-size: 0.875rem;
        }
        .admin-table__edit-btn:hover {
          background: rgba(96,165,250,0.2);
        }
        .admin-table__delete-btn {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.2);
          color: #FCA5A5;
          border-radius: 6px;
          padding: 4px 10px;
          cursor: pointer;
          font-size: 0.8125rem;
        }
        .admin-table__delete-btn:hover {
          background: rgba(239,68,68,0.2);
        }

        /* Toast */
        .admin-toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          color: #FFFFFF;
          z-index: 1100;
          animation: admin-toast-in 0.2s ease-out;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        .admin-toast--success {
          background: #065F46;
          border: 1px solid rgba(52,211,153,0.3);
        }
        .admin-toast--error {
          background: #7F1D1D;
          border: 1px solid rgba(248,113,113,0.3);
        }
        .admin-toast-icon { font-size: 1rem; }
        @keyframes admin-toast-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
