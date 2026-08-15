-- Phase 4: point image URLs at R2 instead of Supabase Storage. The old URLs were
-- .../storage/v1/object/public/<bucket>/<key> and R2 objects were uploaded under the
-- same <bucket>/<key> shape, so a straight prefix swap covers every row.
UPDATE trips
SET image_url = REPLACE(
  image_url,
  'https://uurvbdxwneflwgawanud.supabase.co/storage/v1/object/public',
  'https://pub-d8966727b726431389106312061035a7.r2.dev'
)
WHERE image_url LIKE 'https://uurvbdxwneflwgawanud.supabase.co%';

UPDATE photos
SET imageURL = REPLACE(
  imageURL,
  'https://uurvbdxwneflwgawanud.supabase.co/storage/v1/object/public',
  'https://pub-d8966727b726431389106312061035a7.r2.dev'
)
WHERE imageURL LIKE 'https://uurvbdxwneflwgawanud.supabase.co%';
