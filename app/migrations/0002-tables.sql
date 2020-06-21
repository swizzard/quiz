CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP SCHEMA IF EXISTS api;

CREATE TABLE IF NOT EXISTS api.player (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  ipaddr inet NOT NULL,
  password TEXT NOT NULL,
  display_name VARCHAR(32) NOT NULL,
  banned BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS api.quiz (
  id SERIAL PRIMARY KEY,
  creator INTEGER REFERENCES api.player(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS api.quiz_round (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER REFERENCES api.quiz(id) ON DELETE CASCADE,
  round_no SMALLINT NOT NULL DEFAULT 1,
  UNIQUE(quiz_id, round_no)
);

CREATE TABLE IF NOT EXISTS api.question (
  id SERIAL PRIMARY KEY,
  round_id INTEGER REFERENCES api.quiz_round(id) ON DELETE CASCADE,
  question TEXT,
  question_no SMALLINT NOT NULL DEFAULT 1,
  UNIQUE(round_id, question_no)
);

CREATE TABLE IF NOT EXISTS api.answer (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES api.question(id) ON DELETE CASCADE,
  answer TEXT,
  points SMALLINT
);

CREATE TABLE IF NOT EXISTS api.game (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER REFERENCES api.quiz(id) ON DELETE CASCADE,
  code uuid NOT NULL DEFAULT gen_random_uuid(),
  completed BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS api.game_participant (
  id SERIAL PRIMARY KEY,
  game_id INTEGER REFERENCES api.game(id) ON DELETE CASCADE,
  player_id INTEGER REFERENCES api.player(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS participant_response (
  id SERIAL PRIMARY KEY,
  answer_id INTEGER REFERENCES api.answer(id) ON DELETE CASCADE,
  participant_id INTEGER REFERENCES api.game_participant(id) ON DELETE CASCADE,
  response TEXT
);

CREATE TYPE api.player_result AS (id integer, email VARCHAR(255), display_name VARCHAR(32));

CREATE TABLE IF NOT EXISTS public.jwt_secret (
  secret TEXT
);
