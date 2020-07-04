/* adapted from https://docs.subzero.cloud/tutorial/5min/#authentication */


CREATE OR REPLACE FUNCTION public.new_session(u api.player_result) RETURNS api.player_result AS $$
  DECLARE
    secret TEXT;
    token TEXT;
  BEGIN
    SELECT js.secret FROM secret.jwt_secret js INTO secret;
    token := pgjwt.sign(
      json_build_object(
        'role', 'player',
        'user_id', u.id,
        'exp', extract(epoch from now())::integer + 3600
      ),
      secret
    );
    PERFORM response.set_cookie('SESSIONID', token, 3600, '/');
    return u;
  END;
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
    SELECT * FROM api.new_player(u_email, u_password, u_ipaddr, u_display_name) INTO u;
    IF u.id = -1 THEN
      RETURN u;
    ELSE
      RETURN public.new_session(u);
    END IF;
  END;
$$ SECURITY DEFINER LANGUAGE plpgsql;
REVOKE ALL PRIVILEGES ON FUNCTION api.login(VARCHAR(255), TEXT, inet, VARCHAR(32)) FROM public;
REVOKE ALL PRIVILEGES ON secret.jwt_secret FROM public;

DROP ROLE IF EXISTS player;
CREATE ROLE player;
GRANT player TO authenticator;

GRANT USAGE ON SCHEMA api TO player;
GRANT USAGE ON SCHEMA api TO anonymous;
GRANT SELECT, INSERT, UPDATE, DELETE on ALL TABLES IN SCHEMA api TO player;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA api TO player;
GRANT EXECUTE ON FUNCTION api.login(VARCHAR(255), TEXT, inet, VARCHAR(32)) TO player;
GRANT EXECUTE ON FUNCTION api.login(VARCHAR(255), TEXT, inet, VARCHAR(32)) TO anonymous;
GRANT EXECUTE ON FUNCTION api.delete_user(VARCHAR(255), inet) TO player;
GRANT EXECUTE ON FUNCTION api.draft_game(json) TO player;
GRANT EXECUTE ON FUNCTION api.user_answers(json) TO player;
GRANT EXECUTE ON FUNCTION api.host_game(json) TO player;
GRANT EXECUTE ON FUNCTION api.update_game(json) TO player;
