// Supabase client using direct fetch (no external dependency)
// Uses the REST API directly with the anon key

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''

function headers() {
  return {
    'apikey': supabaseAnonKey,
    'Authorization': `Bearer ${supabaseAnonKey}`,
    'Content-Type': 'application/json',
  }
}

export interface WorkRecord {
  id?: string
  title: string
  description?: string
  category: string
  type: 'video' | 'image'
  bvid?: string | null
  image_url?: string | null
  thumbnail?: string
  tags?: string[]
  created_at?: string
  featured?: boolean
  views?: number
}

export async function getUploadedWorks(): Promise<WorkRecord[]> {
  const res = await fetch(`${supabaseUrl}/rest/v1/works?order=created_at.desc`, { headers: headers() })
  if (!res.ok) return []
  return res.json()
}

export async function createWork(work: Omit<WorkRecord, 'id' | 'created_at'>): Promise<WorkRecord> {
  const res = await fetch(`${supabaseUrl}/rest/v1/works`, {
    method: 'POST',
    headers: { ...headers(), 'Prefer': 'return=representation' },
    body: JSON.stringify(work),
  })
  if (!res.ok) throw new Error(await res.text())
  const data = await res.json()
  return Array.isArray(data) ? data[0] : data
}

export async function updateWork(id: string, updates: Partial<WorkRecord>): Promise<WorkRecord> {
  const res = await fetch(`${supabaseUrl}/rest/v1/works?id=eq.${id}`, {
    method: 'PATCH',
    headers: { ...headers(), 'Prefer': 'return=representation' },
    body: JSON.stringify(updates),
  })
  if (!res.ok) throw new Error(await res.text())
  const data = await res.json()
  return Array.isArray(data) ? data[0] : data
}

export async function deleteWork(id: string): Promise<void> {
  const res = await fetch(`${supabaseUrl}/rest/v1/works?id=eq.${id}`, {
    method: 'DELETE',
    headers: headers(),
  })
  if (!res.ok) throw new Error(await res.text())
}

export async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'png'
  const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
  
  const res = await fetch(`${supabaseUrl}/storage/v1/object/work-images/${fileName}`, {
    method: 'POST',
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: file,
  })
  if (!res.ok) throw new Error(await res.text())
  
  return `${supabaseUrl}/storage/v1/object/public/work-images/${fileName}`
}

export async function toggleFeaturedWork(id: string, featured: boolean): Promise<WorkRecord> {
  return updateWork(id, { featured })
}

export async function incrementWorkViews(id: string): Promise<void> {
  // Read current views, increment, write back
  const res = await fetch(`${supabaseUrl}/rest/v1/works?id=eq.${id}&select=views`, {
    headers: headers(),
  })
  if (!res.ok) return
  const data = await res.json()
  const current = Array.isArray(data) ? (data[0]?.views ?? 0) : 0
  await updateWork(id, { views: current + 1 })
}
