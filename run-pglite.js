const { PGlite } = require("@electric-sql/pglite");
const { createServer } = require("pglite-server");
const fs = require("fs");
const path = require("path");

async function start() {
  const dbPath = path.resolve(__dirname, 'pglite-data');
  const db = new PGlite(dbPath);
  await db.waitReady;
  
  // Apply schema if it's the first time
  const sqlPath = path.resolve(__dirname, 'apps/backend/prisma/migrations/20260809225500_init/migration.sql');
  if (fs.existsSync(sqlPath)) {
      try {
          // Check if table exists
          const res = await db.query(`SELECT to_regclass('public."User"');`);
          if (!res.rows[0].to_regclass) {
              console.log("Applying Prisma schema migration...");
              const sql = fs.readFileSync(sqlPath, 'utf8');
              await db.exec(sql);
              console.log("Migration applied.");
          }
      } catch (err) {
          console.error("Error applying migration:", err);
      }
  } else {
      console.log("Warning: migration.sql not found at", sqlPath);
  }

  const PORT = 5432;
  const pgServer = createServer(db);

  pgServer.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`✅ Mock PostgreSQL server bound to port ${PORT}`);
    console.log(`📁 Connecting to PGLite database at ${dbPath}`);
    console.log(`======================================================\n`);
  });
}

start().catch(console.error);
