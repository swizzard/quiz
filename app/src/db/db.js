import { stringify } from 'query-string';

const API_URL = process.env.REACT_APP_API_URL;

export const errors = {
  KEY_ERROR: 'key error',
};

function buildEndpoint(endpoint, params = {}) {
  return `${API_URL}${endpoint}${stringify(params)}`;
}

export async function post(
  endpoint,
  data,
  params = {},
  single = false,
  returnRep = false,
) {
  const req = {
    method: 'post',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
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
  };
  return fetch(buildEndpoint(endpoint, params), req).then((rows) => {
    if (rows.length) {
      return rows;
    } else {
      throw new Error('Not found');
    }
  });
}

export async function patch(endpoint, params, data) {
  const req = {
    method: 'patch',
    body: JSON.stringify(data),
    headers: {
      'Contenty-Type': 'application/json',
    },
  };
  return fetch(buildEndpoint(endpoint, params), req);
}
