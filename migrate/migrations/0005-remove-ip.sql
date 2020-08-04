ALTER TABLE IF EXISTS api.player DROP COLUMN IF EXISTS ipaddr;
DROP FUNCTION IF EXISTS api.ip_banned;

CREATE OR REPLACE FUNCTION api.new_player(
  u_email VARCHAR(255), u_password TEXT, u_display_name VARCHAR(32)
) RETURNS api.player_result AS $$
DECLARE
  is_banned boolean;
  banned_user api.player_result = (-1, '', '');
  u RECORD;
  new_user api.player_result;
BEGIN
  SELECT p.* INTO u FROM api.player p WHERE p.email = u_email;
  IF NOT FOUND THEN
    INSERT INTO api.player (email, ipaddr, password, display_name)
    VALUES (u_email, u_ipaddr, crypt(u_password, gen_salt('md5')), u_display_name)
    RETURNING api.player.id, api.player.email, api.player.display_name INTO new_user;
    RETURN new_user;
  ELSIF u.banned IS false AND u.password = (SELECT crypt(u_password, u.password)) THEN
    RETURN (u.id, u.email, u.display_name);
  ELSE RETURN banned_user;
  END IF;
END;
$$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION api.delete_user(email VARCHAR(255)) RETURNS boolean AS $$
DECLARE u record;
BEGIN
  SELECT p.* INTO u FROM api.player p WHERE p.email = email;
  IF NOT FOUND THEN
    RETURN false;
  ELSIF u.banned IS false THEN
    DELETE FROM api.player p WHERE p.id = u.id;
    RETURN true;
  END IF;
END;
$$ LANGUAGE plpgsql VOLATILE;
