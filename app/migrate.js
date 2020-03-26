const { createDb, migrate } = require('postgres-migrations');

const config = {
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
};

async function doMigration() {
  await createDb(process.env.POSTGRES_DB, {
    ...config,
    defaultDatabase: process.env.POSTGRES_DB,
  });
  await migrate(config, '/app/migrations');
}

doMigration();
