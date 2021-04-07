import configs from 'configs';
import api from 'helpers/api';
import storage from 'helpers/storage';

/**
 * Documents
 * @default defaultData
 */

const defaultState = {
  logged: false,
  username: '',
}

/**
 * Check login
 */
export const CHECK_LOGIN = 'CHECK_LOGIN';
export const CHECK_LOGIN_OK = 'CHECK_LOGIN_OK';
export const CHECK_LOGIN_FAIL = 'CHECK_LOGIN_FAIL';

export const checkLogin = () => {
  return dispatch => {
    return new Promise((resolve, reject) => {
      dispatch({ type: CHECK_LOGIN });

      const username = storage.get('username');
      const token = storage.get('token');

      if (!username || !token) {
        const er = 'Empty username/token';
        dispatch({ type: CHECK_LOGIN_FAIL, reason: er });
        return reject(er);
      }

      dispatch({ type: CHECK_LOGIN_OK, data: { logged: true, username } });
      return resolve({ username });
    });
  }
}

/**
 * Login with Ohmnilabs account
 */
export const LOGIN_OHMNILABS = 'LOGIN_OHMNILABS';
export const LOGIN_OHMNILABS_OK = 'LOGIN_OHMNILABS_OK';
export const LOGIN_OHMNILABS_FAIL = 'LOGIN_OHMNILABS_FAIL';

export const loginOhmnilabs = (username, password) => {
  return dispatch => {
    return new Promise((resolve, reject) => {
      dispatch({ type: LOGIN_OHMNILABS });

      if (!username || !password) {
        const er = 'Empty username/password';
        dispatch({ type: LOGIN_OHMNILABS_FAIL, reason: er });
        return reject(er);
      }

      const { api: { base } } = configs;
      return api.post(base + '/sign_in', { username, password }).then(({ data }) => {
        const { token, username } = data;

        // Store to local storage
        storage.set('username', username);
        storage.set('token', token);

        dispatch({ type: LOGIN_OHMNILABS_OK, data: { logged: true, username } });
        return resolve({ username });
      }).catch(er => {
        dispatch({ type: LOGIN_OHMNILABS_FAIL, reason: er.toString() });
        return reject(er);
      });
    });
  }
}

/**
 * Logout
 */
export const LOGOUT = 'LOGOUT';
export const LOGOUT_OK = 'LOGOUT_OK';
export const LOGOUT_FAIL = 'LOGOUT_FAIL';

export const logout = () => {
  return dispatch => {
    return new Promise((resolve, reject) => {
      dispatch({ type: LOGOUT });

      // Read local storage
      const username = storage.get('username');
      const token = storage.set('token');

      if (!username && !token) {
        const er = 'Already logout';
        dispatch({ type: LOGOUT_FAIL, reason: er });
        return reject(er);
      }

      // Clear local storage
      storage.clear('username');
      storage.clear('token');

      dispatch({ type: LOGOUT_OK, data: { ...defaultState } });
      return resolve({ username });
    });
  }
}

/**
 * Reducder
 */
// eslint-disable-next-line
export default (state = defaultState, action) => {
  switch (action.type) {
    case LOGIN_OHMNILABS_OK:
      return { ...state, ...action.data };
    case LOGIN_OHMNILABS_FAIL:
      return { ...state, ...action.data };
    case CHECK_LOGIN_OK:
      return { ...state, ...action.data };
    case CHECK_LOGIN_FAIL:
      return { ...state, ...action.data };
    case LOGOUT_OK:
      return { ...state, ...action.data };
    case LOGOUT_FAIL:
      return { ...state, ...action.data };
    default:
      return state;
  }
}