-- the home inspector heading; empty keeps "Hi, I'm <first name>."
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "greeting" TEXT;
