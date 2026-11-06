import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

// One client per process; dev hot reload would otherwise open a new pool on every edit
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Neon URLs say sslmode=require; pg treats that as verify-full and warns, so say what we mean
const connectionString = process.env.DATABASE_URL?.replace("sslmode=require", "sslmode=verify-full");

export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
