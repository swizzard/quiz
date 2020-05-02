CREATE OR REPLACE FUNCTION ip_banned(u_ipaddr inet) RETURNS boolean AS $$
  SELECT EXISTS(SELECT 1 FROM player p WHERE p.ipaddr = u_ipaddr AND p.banned IS true);
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION new_player(
  u_email VARCHAR(255), u_password TEXT, u_ipaddr inet, u_display_name VARCHAR(32)
) RETURNS player_result AS $$
DECLARE
  is_banned boolean;
  banned_user player_result = (-1, '', '');
  u RECORD;
  new_user player_result;
BEGIN
  SELECT ip_banned(u_ipaddr) INTO is_banned;
  IF is_banned THEN
    RETURN banned_user;
  ELSE
    SELECT p.* INTO u FROM player p WHERE p.email = u_email;
    IF NOT FOUND THEN
      INSERT INTO player (email, ipaddr, password, display_name)
      VALUES (u_email, u_ipaddr, crypt(u_password, gen_salt('md5')), u_display_name)
      RETURNING player.id, player.email, player.display_name INTO new_user;
      RETURN new_user;
    ELSIF u.banned IS false AND u.password = (SELECT crypt(u_password, u.password)) THEN
      RETURN (u.id, u.email, u.display_name);
    ELSE RETURN banned_user;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION delete_user(email VARCHAR(255), u_ipaddr inet) RETURNS boolean AS $$
DECLARE u record;
BEGIN
  IF ip_banned(u_ipaddr) THEN
    RETURN false;
  ELSE
    SELECT p.* INTO u FROM player p WHERE p.email = email;
    IF NOT FOUND THEN
      RETURN false;
    ELSIF u.banned IS false THEN
      DELETE FROM player p WHERE p.id = u.id;
      RETURN true;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql VOLATILE;

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

CREATE OR REPLACE FUNCTION user_answers(data json) RETURNS boolean AS $$
DECLARE
  p_id integer;
  key text;
  value text;
BEGIN
  p_id := (data->>'userId')::integer;
  FOR key, value IN SELECT * FROM json_each_text(data->'answers') LOOP
    INSERT INTO participant_response (participant_id, response, answer_id) VALUES (p_id, value, key::integer);
  END LOOP;
  RETURN true;
END;
$$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION host_game(data json) RETURNS uuid AS $$
DECLARE
  user_id integer;
  game_id integer;
  game_code uuid;
BEGIN
  user_id := data->>'user_id'::integer;
  game_id := data->>'game_id'::integer;
  IF EXISTS(SELECT 1 FROM quiz q WHERE q.id = game_id AND q.creator = user_id) THEN
    INSERT INTO game (quiz_id) VALUES (game_id) RETURNING code INTO game_code;
    RETURN game_code;
  ELSE
    RAISE EXCEPTION 'Permission to host game denied';
  END IF;
END;
$$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION update_game(data json) RETURNS boolean AS $$
DECLARE
  questions json;
  creator_id integer;
  rnd json;
  q_id integer;
  qe_id integer;
  ans_id integer;
  q json;
  a json;
  q_name text;
BEGIN
  questions := data->'questions';
  creator_id := (data->>'userId')::integer;
  q_name := data->>'quizName';
  q_id := (data->>'quizId')::integer;
  UPDATE quiz SET quiz.name = q_name WHERE id = q_id AND creator = creator_id;
  IF NOT FOUND THEN
    RETURN false;
  ELSE
    FOREACH rnd IN ARRAY ARRAY(SELECT json_array_elements(questions)) LOOP
      FOREACH q IN ARRAY ARRAY(SELECT json_array_elements(rnd)) LOOP
        UPDATE question SET question = q->>'question'
          FROM quiz_round qr
          JOIN quiz q ON qr.quiz_id = q.id
          WHERE question.id = (q->>'questionId')::integer
          AND q.creator = creator_id;
        FOREACH a IN ARRAY ARRAY(SELECT json_array_elements(q->'answers')) LOOP
          UPDATE answer SET answer.answer = a->>'answer', answer.points = (a->>'points')::integer
          FROM question qe
          JOIN quiz_round qr ON qe.round_id = qr.id
          JOIN quiz q ON qr.quiz_id = q.id
          WHERE answer.id = (a->>'id')::integer
          AND q.creator = creator_id;
        END LOOP;
      END LOOP;
    END LOOP;
    RETURN true;
    END IF;
  END;
$$ LANGUAGE plpgsql VOLATILE;
