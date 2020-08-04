CREATE OR REPLACE FUNCTION api.login(
  u_email VARCHAR(255),
  u_password TEXT,
  u_display_name VARCHAR(32)
) RETURNS api.player_result AS $$
  DECLARE
    u api.player_result;
  BEGIN
    SELECT * FROM api.new_player(u_email, u_password, u_display_name) INTO u;
    IF u.id = -1 THEN
      RETURN u;
    ELSE
      RETURN public.new_session(u);
    END IF;
  END;
$$ SECURITY DEFINER LANGUAGE plpgsql;
