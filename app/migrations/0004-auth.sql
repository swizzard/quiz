-- adapted from https://docs.subzero.cloud/tutorial/5min/#authentication


CREATE OR REPLACE FUNCTION public.new_session(u api.player_result) RETURNS api.player_result AS $$
  DECLARE
    secret TEXT;
    token TEXT;
  BEGIN
    SELECT js.secret FROM public.jwt_secret js INTO secret;
    token := pgjwt.sign(
      json_build_object(
        'role', 'user',
        'user_id', u.id,
        'exp', extract(epoch from now())::integer + 3600
      ),
      secret
    );
    PERFORM response.set_cookie('SESSIONID', token, 3600, '/');
    return u;
  END
$$ STABLE LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION api.login(
  u_email VARCHAR(255),
  u_password TEXT,
  u_ipaddr inet,
  u_display_name VARCHAR(32)
) RETURNS api.player_result AS $$
  DECLARE
    u api.player_result;
  BEGIN
    SELECT api.new_player(u_email, u_password, u_ipaddr, u_display_name) INTO u;
    IF u.id = -1 THEN
      RETURN u;
    ELSE
      RETURN public.new_session(u);
    END IF;
  END;
$$ SECURITY DEFINER LANGUAGE plpgsql;
REVOKE ALL PRIVILEGES ON FUNCTION api.login(VARCHAR(255), TEXT, inet, VARCHAR(32)) FROM public;

CREATE ROLE user;
GRANT user TO authenticator;

GRANT USAGE ON SCHEMA api TO user;
GRANT
  SELECT(id, display_name)
ON api.player TO user;
GRANT
  SELECT(id, name),
ON api.quiz TO user;
GRANT
  SELECT(id, quiz_id, round_no)
ON api.quiz_round TO user;
GRANT
  SELECT(id, round_id, question, question_no)
ON api.question TO user;
GRANT
  SELECT(id, question_id, answer, points)
ON api.answer TO user;
GRANT
  SELECT(id, quiz_id, code, completed),
  UPDATE(completed)
ON api.game TO user;
GRANT
  SELECT(id, game_id, player_id, score)
ON api.game_participant TO user;
GRANT
  SELECT(id, answer_id, participant_id, response)
ON api.participant_response TO user;
GRANT EXECUTE ON FUNCTION api.login(VARCHAR(255), TEXT, inet, VARCHAR(32)) TO user;
GRANT EXECUTE ON FUNCTION api.login(VARCHAR(255), TEXT, inet, VARCHAR(32)) TO anonymous;
GRANT EXECUTE ON FUNCTION api.delete_user(VARCHAR(255), inet) TO user;
GRANT EXECUTE ON FUNCTION api.draft_game(json) TO user;
GRANT EXECUTE ON FUNCTION api.user_answers(json) TO user;
GRANT EXECUTE ON FUNCTION api.host_game(json) TO user;
GRANT EXECUTE ON FUNCTION api.update_game(json) TO user;
