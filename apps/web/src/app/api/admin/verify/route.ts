import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    const expected = process.env.UPLOAD_SECRET || 'ai-portfolio-2026'

    if (password === expected) {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false }, { status: 401 })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}