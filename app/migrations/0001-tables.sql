CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS player (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  ipaddr inet NOT NULL,
  password TEXT NOT NULL,
  display_name VARCHAR(32) NOT NULL,
  banned BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS quiz (
  id SERIAL PRIMARY KEY,
  creator INTEGER REFERENCES player(id),
  name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS quiz_round (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER REFERENCES quiz(id),
  round_no SMALLINT NOT NULL DEFAULT 1,
  UNIQUE(quiz_id, round_no)
);

CREATE TABLE IF NOT EXISTS question (
  id SERIAL PRIMARY KEY,
  round_id INTEGER REFERENCES quiz_round(id),
  question TEXT,
  question_no SMALLINT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS answer (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES question(id),
  answer TEXT,
  points SMALLINT
);

CREATE TABLE IF NOT EXISTS game (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER REFERENCES quiz(id),
  code uuid NOT NULL DEFAULT gen_random_uuid(),
  completed BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS game_participant (
  id SERIAL PRIMARY KEY,
  game_id INTEGER REFERENCES game(id),
  player_id INTEGER REFERENCES player(id),
  score INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS participant_response (
  id SERIAL PRIMARY KEY,
  answer_id INTEGER REFERENCES answer(id),
  participant_id INTEGER REFERENCES game_participant(id),
  response TEXT
);

CREATE TYPE player_result AS (id integer, email VARCHAR(255), display_name VARCHAR(32));
