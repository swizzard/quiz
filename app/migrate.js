const { createDb, migrate } = require('postgres-migrations');
const config = require('./dbConfig');

async function doMigration() {
  await createDb(process.env.POSTGRES_DB, {
    ...config,
    defaultDatabase: process.env.POSTGRES_DB
  });
  await migrate(config, '/app/migrations');
}

doMigration();
