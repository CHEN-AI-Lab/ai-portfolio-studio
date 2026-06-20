-- 在 Supabase SQL Editor 运行这个（https://supabase.com/dashboard/project/djwwsekihbbwdnivimbf/sql/new）
CREATE TABLE IF NOT EXISTS works (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    category TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'video',
    bvid TEXT,
    image_url TEXT,
    thumbnail TEXT DEFAULT '',
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    featured BOOLEAN DEFAULT FALSE
);

ALTER TABLE works ENABLE ROW LEVEL SECURITY;

CREATE POLICY anon_read ON works FOR SELECT USING (true);
CREATE POLICY anon_insert ON works FOR INSERT WITH CHECK (true);
CREATE POLICY anon_update ON works FOR UPDATE USING (true);  
CREATE POLICY anon_delete ON works FOR DELETE USING (true);