-- adapted from https://github.com/subzerocloud/subzero-starter-kit


drop schema if exists request cascade;
create schema request;
grant usage on schema request to public;

create or replace function request.env_var(v text) returns text as $$
    select current_setting(v, true);
$$ stable language sql;

create or replace function request.jwt_claim(c text) returns text as $$
    select request.env_var('request.jwt.claim.' || c);
$$ stable language sql;

create or replace function request.cookie(c text) returns text as $$
    select request.env_var('request.cookie.' || c);
$$ stable language sql;

create or replace function request.header(h text) returns text as $$
    select request.env_var('request.header.' || h);
$$ stable language sql;

create or replace function request.user_id() returns int as $$
    select 
    case coalesce(request.jwt_claim('user_id'),'')
    when '' then 0
    else request.jwt_claim('user_id')::int
	end
$$ stable language sql;

create or replace function request.user_role() returns text as $$
    select request.jwt_claim('role')::text;
$$ stable language sql;

drop schema if exists response cascade;
create schema response;
grant usage on schema response to public;


create or replace function response.get_cookie_string(name text, value text, expires_after int, path text) returns text as $$
    with vars as (
        select
            case
                when expires_after > 0 
                then current_timestamp + (expires_after::text||' seconds')::interval
                else timestamp 'epoch'
            end as expires_on
    )
    select 
        name ||'=' || value || '; ' ||
        'Expires=' || to_char(expires_on, 'Dy, DD Mon YYYY HH24:MI:SS GMT') || '; ' ||
        'Max-Age=' || expires_after::text || '; ' ||
        'Path=' ||path|| '; HttpOnly'
    from vars;
$$ stable language sql;

create or replace function response.set_header(name text, value text) returns void as $$
    select set_config(
        'response.headers', 
        jsonb_insert(
            (case coalesce(current_setting('response.headers',true),'')
            when '' then '[]'
            else current_setting('response.headers')
            end)::jsonb,
            '{0}'::text[], 
            jsonb_build_object(name, value))::text, 
        true
    );
$$ stable language sql;

create or replace function response.set_cookie(name text, value text, expires_after int, path text) returns void as $$
    select response.set_header('Set-Cookie', response.get_cookie_string(name, value, expires_after, path));
$$ stable language sql;

create or replace function response.delete_cookie(name text) returns void as $$
    select response.set_header('Set-Cookie', response.get_cookie_string(name, 'deleted', 0 ,'/'));
$$ stable language sql;

-- addapted from https://github.com/michelp/pgjwt
-- license follows

-- The MIT License (MIT)

-- Copyright (c) 2016 Michel Pelletier

-- Permission is hereby granted, free of charge, to any person obtaining a copy
-- of this software and associated documentation files (the "Software"), to deal
-- in the Software without restriction, including without limitation the rights
-- to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
-- copies of the Software, and to permit persons to whom the Software is
-- furnished to do so, subject to the following conditions:

-- The above copyright notice and this permission notice shall be included in all
-- copies or substantial portions of the Software.

-- THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
-- IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
-- FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
-- AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
-- LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
-- OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
-- SOFTWARE.


create extension if not exists pgcrypto;
drop schema if exists pgjwt cascade;	
create schema pgjwt;
set search_path to pgjwt, public;

CREATE OR REPLACE FUNCTION url_encode(data bytea) RETURNS text LANGUAGE sql AS $$
    SELECT translate(encode(data, 'base64'), E'+/=\n', '-_');
$$;


CREATE OR REPLACE FUNCTION url_decode(data text) RETURNS bytea LANGUAGE sql AS $$
WITH t AS (SELECT translate(data, '-_', '+/')),
     rem AS (SELECT length((SELECT * FROM t)) % 4) -- compute padding size
    SELECT decode(
        (SELECT * FROM t) ||
        CASE WHEN (SELECT * FROM rem) > 0
           THEN repeat('=', (4 - (SELECT * FROM rem)))
           ELSE '' END,
    'base64');
$$;


CREATE OR REPLACE FUNCTION algorithm_sign(signables text, secret text, algorithm text)
RETURNS text LANGUAGE sql AS $$
WITH
  alg AS (
    SELECT CASE
      WHEN algorithm = 'HS256' THEN 'sha256'
      WHEN algorithm = 'HS384' THEN 'sha384'
      WHEN algorithm = 'HS512' THEN 'sha512'
      ELSE '' END)  -- hmac throws error
SELECT pgjwt.url_encode(public.hmac(signables, secret, (select * FROM alg)));
$$;


CREATE OR REPLACE FUNCTION sign(payload json, secret text, algorithm text DEFAULT 'HS256')
RETURNS text LANGUAGE sql AS $$
WITH
  header AS (
    SELECT pgjwt.url_encode(convert_to('{"alg":"' || algorithm || '","typ":"JWT"}', 'utf8'))
    ),
  payload AS (
    SELECT pgjwt.url_encode(convert_to(payload::text, 'utf8'))
    ),
  signables AS (
    SELECT (SELECT * FROM header) || '.' || (SELECT * FROM payload)
    )
SELECT
    (SELECT * FROM signables)
    || '.' ||
    pgjwt.algorithm_sign((SELECT * FROM signables), secret, algorithm);
$$;


CREATE OR REPLACE FUNCTION verify(token text, secret text, algorithm text DEFAULT 'HS256')
RETURNS table(header json, payload json, valid boolean) LANGUAGE sql AS $$
  SELECT
    convert_from(pgjwt.url_decode(r[1]), 'utf8')::json AS header,
    convert_from(pgjwt.url_decode(r[2]), 'utf8')::json AS payload,
    r[3] = pgjwt.algorithm_sign(r[1] || '.' || r[2], secret, algorithm) AS valid
  FROM regexp_split_to_array(token, '\.') r;
$$;


SET search_path TO public;
