const { Client } = require('pg');
const config = require('./dbConfig');

async function setJWTSecret() {
  const client = new Client(config);
  await client.connect();
  await client.query('TRUNCATE TABLE public.jwt_secret');
  await client.query('INSERT INTO public.jwt_secret (secret) VALUES($1)', [
    process.env.JWT_SECRET
  ]);
}

setJWTSecret();
