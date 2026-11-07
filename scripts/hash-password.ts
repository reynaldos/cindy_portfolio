// Prints the ADMIN_PASSWORD_HASH value for a password: pnpm exec tsx scripts/hash-password.ts "your password"
import { hashPassword } from "../lib/session";

const password = process.argv[2];
if (!password) {
  console.error('usage: pnpm exec tsx scripts/hash-password.ts "your password"');
  process.exit(1);
}
console.log(hashPassword(password));
