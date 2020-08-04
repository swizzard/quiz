import { stringify } from 'query-string';

const API_URL = process.env.REACT_APP_API_URL;
debugger;

export const errors = {
  KEY_ERROR: 'key error'
};

function buildEndpoint(endpoint, params = {}) {
  const ep = `${API_URL}${endpoint}`;
  const qs = stringify(params);
  if (qs.length) {
    return `${ep}?${qs}`;
  }
  return ep;
}

export async function post(
  endpoint,
  data,
  params = {},
  single = false,
  returnRep = false
) {
  const req = {
    method: 'post',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  };
  const preferences = [];
  if (single) {
    preferences.push('params=single-object');
  }
  if (returnRep) {
    preferences.push('return=representation');
  }
  if (preferences.length) {
    req.headers['Prefer'] = preferences.join('; ');
  }
  return fetch(buildEndpoint(endpoint, params), req);
}

export async function get(endpoint, params, single = false) {
  const req = {
    method: 'GET',
    credentials: 'include'
  };
  if (single) {
    req.headers = { Accept: 'application/vnd.pgrst.object+json' };
  }
  return fetch(buildEndpoint(endpoint, params), req);
}

export async function del(endpoint, params) {
  params.select = 'id';
  const req = {
    method: 'DELETE',
    headers: { Prefer: 'return=representation' },
    credentials: 'include'
  };
  return fetch(buildEndpoint(endpoint, params), req)
    .then((rows) => {
      if (rows.ok) {
        return rows.json();
      } else {
        throw new Error('Error deleting');
      }
    })
    .then((v) => {
      if (v.length) {
        return v;
      } else {
        throw new Error('Not found');
      }
    });
}

export async function patch(endpoint, params, data) {
  const req = {
    method: 'PATCH',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  };
  return fetch(buildEndpoint(endpoint, params), req);
}
