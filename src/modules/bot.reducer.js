import configs from 'configs';
import api from 'helpers/api';

/**
 * Documents
 * @default defaultData
 */

const defaultState = {
  botId: '',
}

/**
 * Get bot info
 */
export const GET_BOT_INFO = 'GET_BOT_INFO';
export const GET_BOT_INFO_OK = 'GET_BOT_INFO_OK';
export const GET_BOT_INFO_FAIL = 'GET_BOT_INFO_FAIL';

export const getBotInfo = () => {
  return dispatch => {
    return new Promise((resolve, reject) => {
      dispatch({ type: GET_BOT_INFO });

      if (!window.Ohmni || !window.Ohmni.requestBotInfo) {
        const er = 'You must run this application on Ohmni';
        dispatch({ type: GET_BOT_INFO_FAIL, reason: er });
        return reject(er);
      }

      const { api: { localBot: { base } } } = configs;
      return api.get(base + '/bot').then(({ data }) => {
        dispatch({ type: GET_BOT_INFO_OK, data: { map: data } });
        return resolve(data);
      }).catch(er => {
        dispatch({ type: GET_BOT_INFO_FAIL, reason: er.toString() });
        return reject(er);
      });
    });
  }
}

/**
 * Get map info
 */
export const GET_MAP_INFO = 'GET_MAP_INFO';
export const GET_MAP_INFO_OK = 'GET_MAP_INFO_OK';
export const GET_MAP_INFO_FAIL = 'GET_MAP_INFO_FAIL';

export const getMapInfo = (botId) => {
  return dispatch => {
    return new Promise((resolve, reject) => {
      dispatch({ type: GET_MAP_INFO });

      if (!botId) {
        const er = 'Invalid Bot ID';
        dispatch({ type: GET_MAP_INFO_FAIL, reason: er });
        return reject(er);
      }

      const { api: { cloud: { base } } } = configs;
      return api.get(base + `/app/bots/${botId}/maps`).then(({ data }) => {
        dispatch({ type: GET_MAP_INFO_OK, data: { map: data } });
        return resolve(data);
      }).catch(er => {
        dispatch({ type: GET_MAP_INFO_FAIL, reason: er.toString() });
        return reject(er);
      });
    });
  }
}

/**
 * Reducder
 */
// eslint-disable-next-line
export default (state = defaultState, action) => {
  switch (action.type) {
    case GET_BOT_INFO_OK:
      return { ...state, ...action.data };
    case GET_BOT_INFO_FAIL:
      return { ...state, ...action.data };
    case GET_MAP_INFO_OK:
      return { ...state, ...action.data };
    case GET_MAP_INFO_FAIL:
      return { ...state, ...action.data };
    default:
      return state;
  }
}