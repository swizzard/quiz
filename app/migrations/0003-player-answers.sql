CREATE TABLE IF NOT EXISTS participant_response (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES question(id),
  participant_id INTEGER REFERENCES game_participant(id)
);
