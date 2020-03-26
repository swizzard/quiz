import { stringify } from 'query-string';

const API_URL = process.env.REACT_APP_API_URL;

export const errors = {
  KEY_ERROR: 'key error',
};

function buildEndpoint(endpoint, params = {}) {
  return `${API_URL}${endpoint}${stringify(params)}`;
}

export async function post(endpoint, data) {
  return fetch(buildEndpoint(endpoint), {
    method: 'post',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function get(endpoint, params) {
  return fetch(buildEndpoint(endpoint, params));
}
