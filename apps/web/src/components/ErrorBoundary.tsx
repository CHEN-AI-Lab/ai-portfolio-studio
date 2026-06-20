'use client';

import React, { Component, type ErrorInfo, type ReactNode } from 'react';

// ─── ErrorBoundary ─────────────────────────────────────────────────
// Catches rendering errors and shows a dark-themed fallback UI

interface ErrorBoundaryProps {
  children: ReactNode;
  locale: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleRetry = (): void => {
    window.location.reload();
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      const isZh = this.props.locale === 'zh-CN';
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          padding: '40px 24px',
          background: '#0A0A0F',
          color: '#E0E0E0',
          textAlign: 'center',
        }}>
          {/* Error icon */}
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
            fontSize: 32,
          }}>
            ⚠️
          </div>

          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            margin: '0 0 12px',
            color: '#FFFFFF',
          }}>
            {isZh ? '出错了' : 'Something went wrong'}
          </h1>

          <p style={{
            fontSize: '0.95rem',
            color: '#6B6B80',
            margin: '0 0 32px',
            maxWidth: 420,
            lineHeight: 1.6,
          }}>
            {isZh
              ? '页面渲染时出现意外错误。请尝试刷新页面，或稍后再访问。'
              : 'An unexpected error occurred while rendering the page. Please try refreshing, or come back later.'}
          </p>

          <button
            onClick={this.handleRetry}
            style={{
              padding: '12px 28px',
              fontSize: '0.9rem',
              fontWeight: 600,
              fontFamily: 'inherit',
              color: '#FFFFFF',
              background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(124, 58, 237, 0.35)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
              (e.currentTarget as HTMLButtonElement).style.transform = 'none';
            }}
          >
            {isZh ? '重试' : 'Retry'}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}