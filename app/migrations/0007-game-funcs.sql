ALTER TABLE quiz ADD COLUMN IF NOT EXISTS name TEXT NOT NULL;
CREATE OR REPLACE FUNCTION draft_game(data json) RETURNS integer AS $$
DECLARE
  questions json;
  q_id integer;
  qe_id integer;
  r_id integer;
  round_count integer;
  question_count integer;
  answer_count integer;
  rnd json;
  q json;
  a json;
BEGIN
  questions := data->'questions';
  round_count := 0;
  INSERT INTO quiz (creator, name) VALUES ((data->>'userId')::integer, data->>'name') RETURNING id INTO q_id;
  FOREACH rnd IN ARRAY ARRAY(SELECT json_array_elements(questions)) LOOP
    INSERT INTO quiz_round (quiz_id, round_no) VALUES (q_id, round_count) RETURNING id INTO r_id;
    FOREACH q IN ARRAY ARRAY(SELECT json_array_elements(rnd)) LOOP
      INSERT INTO question (round_id, question) VALUES (r_id, q->>'question') RETURNING id INTO qe_id;
      FOREACH a IN ARRAY ARRAY(SELECT json_array_elements(q->'answers')) LOOP
        INSERT INTO answer (question_id, answer, points) VALUES (qe_id, a->>'answer', (a->>'points')::integer);
      END LOOP;
    END LOOP;
    round_count := round_count + 1;
  END LOOP;
  RETURN q_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION user_answers(data json) RETURNS integer AS $$
DECLARE
  answers json;
  g_id integer;
  p_id integer;
  q_id integer;
  qe_id integer;
  rnd json;
BEGIN
  answers := data->'answers';


