import { get, post } from './db';

export function newUser(email, password, displayName, ipaddr) {
  const data = {
    u_email: email,
    u_ipaddr: ipaddr,
    u_password: password,
    u_display_name: displayName,
  };
  return post('rpc/new_player', data);
}

export function getUser(userId) {
  const params = {
    id: `eq.${userId}`,
    select: 'displayName:display_name,email',
  };
  return get('player', params);
}

export function getIp(setIp, setError) {
  const url = 'https://api.hostip.info/get_json.php';
  const req = new XMLHttpRequest();
  req.onreadystatechange = () => {
    if (req.readyState === 4) {
      if (req.status === 200) {
        const jsn = JSON.parse(req.responseText);
        setIp(jsn.ip);
      } else {
        setError('Error retrieving ip address');
      }
    }
  };
  req.open('GET', url, false);
  req.send();
}
