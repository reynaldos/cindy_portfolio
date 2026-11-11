-- feedback pins on a clip: [{ label, note, at }], at is 0..1 of the clip; shown on the scrub bar in a category
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "markers" JSONB;
