import { defineConfig } from "prisma/config";

// The Prisma CLI does not read .env; Node does. Vercel has no .env file, so a miss is fine.
try {
  process.loadEnvFile();
} catch {}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  // migrations go through the direct Neon connection (Vercel's name for it); the app uses the pooled DATABASE_URL.
  // Left optional so `prisma generate` runs on Vercel without it.
  datasource: {
    url: process.env.DATABASE_URL_UNPOOLED,
  },
});
