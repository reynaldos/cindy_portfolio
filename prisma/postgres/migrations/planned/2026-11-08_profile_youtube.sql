-- Cindy's channel is on YouTube, not Vimeo; the old column held no value
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "youtubeUrl" TEXT;
ALTER TABLE "Profile" DROP COLUMN IF EXISTS "vimeoUrl";
