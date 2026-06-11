'use client'

import { useState } from 'react'

interface Props {
  email: string
  revealLabel: string
}

export function EmailReveal({ email, revealLabel }: Props) {
  const [revealed, setRevealed] = useState(false)

  if (revealed) {
    return (
      <a href={`mailto:${email}`} className="resume-page__header-email">
        ✉ {email}
      </a>
    )
  }

  return (
    <button
      onClick={() => setRevealed(true)}
      className="resume-page__header-email-btn"
    >
      ✉ {revealLabel}
    </button>
  )
}
