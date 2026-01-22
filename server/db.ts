import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@shared/schema';

neonConfig.fetchConnectionCache = true;

// Lazy DB connection to prevent top-level side effects
let _db: ReturnType<typeof drizzle> | undefined;

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
    get: (_target, prop) => {
        if (!_db) {
            if (!process.env.DATABASE_URL) return undefined;
            _db = drizzle(neon(process.env.DATABASE_URL), { schema });
        }
        // @ts-ignore
        return _db[prop];
    }
});


