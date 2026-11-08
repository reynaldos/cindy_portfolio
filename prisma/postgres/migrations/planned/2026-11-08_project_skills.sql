-- skills Cindy used on the clip, shown in the inspector; the admin bank is the distinct set across projects
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "skills" TEXT[] NOT NULL DEFAULT '{}';
