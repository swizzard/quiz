const { Client } = require('pg');
const config = require('./dbConfig');

async function setJWTSecret() {
  const client = new Client(config);
  await client.connect();
  await client.query('TRUNCATE TABLE secret.jwt_secret');
  await client.query('INSERT INTO secret.jwt_secret (secret) VALUES($1)', [
    process.env.JWT_SECRET
  ]);
  process.exit(0);
}

setJWTSecret();
