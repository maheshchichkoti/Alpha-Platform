import { PrismaClient } from "@prisma/client";

// This is a TypeScript feature to declare a global variable. We use this to
// prevent creating multiple database connections during development when
// hot-reloading happens.
declare global {
  var prisma: PrismaClient | undefined;
}

// This line does the magic:
// 1. It checks if a `prisma` instance already exists on the global object.
// 2. If it does, it reuses it.
// 3. If it does NOT, it creates a brand new `PrismaClient()`.
// 4. It EXPORTS the client instance with the specific name 'prisma'.
export const prisma = global.prisma || new PrismaClient();

// In development, we store the instance on the global object so that the next
// time the code reloads, it can be reused from the check above.
if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
