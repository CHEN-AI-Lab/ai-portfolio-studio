'use client'

import React, { useRef, useState, useCallback, useEffect } from 'react'
import { useLocale } from 'next-intl'

interface VideoPlayerProps {
  src: string
  poster?: string
  className?: string
}

export function VideoPlayer({ src, poster, className }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [posterFailed, setPosterFailed] = useState(false)
  const [aspectRatio, setAspectRatio] = useState<string | number>('16 / 9')
  const locale = useLocale()
  // Track whether we've detected the aspect ratio (avoid repeat setState)
  const ratioSetRef = useRef(false)
  // Track whether video has ever started playing (hide poster after first play)
  const hasPlayedRef = useRef(false)

  const handlePlay = useCallback(() => {
    const el = videoRef.current;
    if (!el) return
    if (el.paused) {
      el.play().catch(() => {
        setHasError(true)
      })
    } else {
      el.pause()
    }
  }, [])

  const handleVideoClick = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault()
    handlePlay()
  }, [handlePlay])

  const handlePlayStateChange = useCallback(() => {
    if (!videoRef.current) return
    const nowPlaying = !videoRef.current.paused
    setIsPlaying(nowPlaying)
    if (nowPlaying) hasPlayedRef.current = true
  }, [])

  const handleLoadedData = useCallback(() => {
    setIsLoaded(true)
    // Detect video dimensions for dynamic aspect ratio
    const el = videoRef.current
    if (el && el.videoWidth && el.videoHeight) {
      setAspectRatio(`${el.videoWidth} / ${el.videoHeight}`)
    }
  }, [])

  const handleError = useCallback(() => {
    setHasError(true)
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    el.addEventListener('play', handlePlayStateChange)
    el.addEventListener('pause', handlePlayStateChange)
    el.addEventListener('loadeddata', handleLoadedData)
    el.addEventListener('error', handleError)

    return () => {
      el.removeEventListener('play', handlePlayStateChange)
      el.removeEventListener('pause', handlePlayStateChange)
      el.removeEventListener('loadeddata', handleLoadedData)
      el.removeEventListener('error', handleError)
    }
  }, [handlePlayStateChange, handleLoadedData, handleError])

  return (
    <div
      className={`video-player${isPlaying ? ' video-player--playing' : ''}${className ? ` ${className}` : ''}`}
    >
      <div className="video-player__wrapper" style={{ aspectRatio, maxHeight: '85vh' }}>
        {/* Skeleton loading */}
        {!isLoaded && !hasError && (
          <div className="video-player__skeleton" aria-hidden="true" />
        )}

        {/* Error state */}
        {hasError && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#A0A0B0',
              fontSize: '14px',
              zIndex: 3,
              background: '#0A0A0F',
            }}
          >
            <span style={{ fontSize: '32px', marginBottom: '8px' }}>⚠️</span>
            <span>{locale === 'zh-CN' ? '视频加载失败' : 'Video failed to load'}</span>
            <span style={{ marginTop: '4px', fontSize: '12px', opacity: 0.7 }}>{locale === 'zh-CN' ? '视频文件未找到，暂时无法播放' : 'Video file not found'}</span>
          </div>
        )}

        {/* Poster — only show before any playback */}
        {poster && !isPlaying && !posterFailed && !hasPlayedRef.current && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt=""
            className="video-player__poster"
            draggable={false}
            onError={() => setPosterFailed(true)}
          />
        )}

        {/* Gradient placeholder — only show before any playback */}
        {(!poster || (posterFailed && !isPlaying)) && !hasPlayedRef.current && (
          <div className="video-player__placeholder" aria-hidden="true" />
        )}

          {/* Native video element */}
        <video
          ref={(el) => {
            // Store ref for other event handlers to use
            (videoRef as unknown as { current: HTMLVideoElement | null }).current = el;
            // Check if video metadata already loaded (handles hydration gap)
            if (el && !ratioSetRef.current && el.videoWidth && el.videoHeight) {
              ratioSetRef.current = true;
              setAspectRatio(`${el.videoWidth} / ${el.videoHeight}`);
            }
          }}
          className="video-player__video"
          src={src}
          poster={undefined}
          preload="metadata"
          playsInline
          onClick={isPlaying ? undefined : handleVideoClick}
          controls={isPlaying}
          style={{ opacity: isLoaded ? 1 : 0 }}
        />

        {/* Play overlay */}
        {!isPlaying && !hasError && (
          <div className="video-player__overlay" onClick={handleVideoClick}>
            <button
              className="video-player__play-btn"
              aria-label="Play video"
              type="button"
            >
              <span className="play-arrow" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
