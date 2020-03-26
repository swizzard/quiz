CREATE TABLE IF NOT EXISTS player (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  ipaddr inet UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS quiz (
  id SERIAL PRIMARY KEY,
  creator INTEGER REFERENCES player(id)
);

CREATE TABLE IF NOT EXISTS quiz_round (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER REFERENCES quiz(id),
  round_no SMALLINT,
  UNIQUE(quiz_id, round_no)
);

CREATE TABLE IF NOT EXISTS question (
  id SERIAL PRIMARY KEY,
  round_id INTEGER REFERENCES quiz_round(id),
  question TEXT
);

CREATE TABLE IF NOT EXISTS answer (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES question(id),
  answer TEXT,
  points SMALLINT
);

CREATE TABLE IF NOT EXISTS game (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER REFERENCES quiz(id)
);

CREATE TABLE IF NOT EXISTS game_participant (
  id SERIAL PRIMARY KEY,
  game_id INTEGER REFERENCES game(id),
  player_id INTEGER REFERENCES player(id),
  score INTEGER
);
