-- Fix Row Level Security policies for analytics_cache table

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read access to analytics_cache" ON analytics_cache;
DROP POLICY IF EXISTS "Allow public insert access to analytics_cache" ON analytics_cache;
DROP POLICY IF EXISTS "Allow public update access to analytics_cache" ON analytics_cache;

-- Enable RLS on the table
ALTER TABLE analytics_cache ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for the cache table
-- Allow anyone to read from cache
CREATE POLICY "Allow public read access to analytics_cache"
ON analytics_cache
FOR SELECT
TO public
USING (true);

-- Allow anyone to insert into cache
CREATE POLICY "Allow public insert access to analytics_cache"
ON analytics_cache
FOR INSERT
TO public
WITH CHECK (true);

-- Allow anyone to update cache entries
CREATE POLICY "Allow public update access to analytics_cache"
ON analytics_cache
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Allow anyone to delete expired cache entries
CREATE POLICY "Allow public delete access to analytics_cache"
ON analytics_cache
FOR DELETE
TO public
USING (true);
