import { drizzle } from 'drizzle-orm/libsql';

export const db = drizzle('file:./src/db/db.sqlite');