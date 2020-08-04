import { get, post } from './db';

export function newUser(email, password, displayName) {
  const data = {
    u_email: email,
    u_password: password,
    u_display_name: displayName
  };
  return post('rpc/login', data);
}

export function getUser(userId) {
  const params = {
    id: `eq.${userId}`,
    select: 'displayName:display_name,email'
  };
  return get('player', params);
}
