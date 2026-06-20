-- 在 Supabase SQL Editor 运行：https://supabase.com/dashboard/project/djwwsekihbbwdnivimbf/sql/new
-- 创建 Storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('work-images', 'work-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- 允许公开读取
CREATE POLICY "public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'work-images');

-- 允许匿名上传
CREATE POLICY "public_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'work-images');