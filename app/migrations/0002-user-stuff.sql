CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TYPE role AS ENUM ('creator', 'participant', 'banned');
CREATE TYPE player_result AS (id INTEGER, email VARCHAR(255), display_name VARCHAR(32));

ALTER TABLE player ADD COLUMN IF NOT EXISTS password TEXT NOT NULL;
ALTER TABLE player ADD COLUMN IF NOT EXISTS display_name VARCHAR(32) NOT NULL;
ALTER TABLE player ADD COLUMN IF NOT EXISTS role role NOT NULL DEFAULT 'participant';

CREATE OR REPLACE FUNCTION ip_banned(u_ipaddr inet) RETURNS boolean AS $$
  SELECT EXISTS(SELECT 1 FROM player p WHERE p.ipaddr = u_ipaddr AND p.role = 'banned');
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
    ELSIF u.role <> 'banned' AND u.password = (SELECT crypt(u_password, u.password)) THEN
      RETURN (u.id, u.email, u.display_name);
    ELSE RETURN banned_user;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION delete_user(email VARCHAR(255), u_ipaddr inet) RETURNS boolean AS $$
DECLARE u record;
BEGIN
  IF SELECT ip_banned(u_ipaddr) THEN
    RETURN 'f';
  ELSE
    SELECT p.* INTO u FROM player p WHERE p.email = email;
    IF NOT FOUND THEN
      RETURN 'f';
    ELSIF u.role <> 'banned' THEN
      DELETE FROM player p WHERE p.id = u.id;
      RETURN 't';
    END IF;
  END;
$$ LANGUAGE plpgsql VOLATILE;
