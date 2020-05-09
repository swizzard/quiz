const USER_KEY = "__quiz__user";
const DASH_STATE_KEY = "__dash__state";

export function storeUser(user) {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (e) {}
}

export function retrieveUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch (e) {
    return null;
  }
}

export function storeDashState(state) {
  try {
    localStorage.setItem(DASH_STATE_KEY, state);
  } catch (e) {}
}

export function retrieveDashState() {
  try {
    return localStorage.getItem(DASH_STATE_KEY);
  } catch (e) {
    return null;
  }
}
