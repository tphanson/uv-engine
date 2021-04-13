import configs from 'configs';
import api from 'helpers/api';

/**
 * Documents
 * @default defaultData
 */

const defaultState = {
  botId: '',
  localMaps: [],
  groupedMaps: [],
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

      const { api: { localBot: { base } } } = configs;
      return api.get(base + '/bot').then(({ data }) => {
        dispatch({ type: GET_BOT_INFO_OK, data });
        return resolve(data);
      }).catch(er => {
        dispatch({ type: GET_BOT_INFO_FAIL, reason: er.toString() });
        return reject(er);
      });
    });
  }
}

/**
 * Get maps, a very general info like mapId
 * To get map details, concern to use getMap
 */
export const GET_MAPS = 'GET_MAPS';
export const GET_MAPS_OK = 'GET_MAPS_OK';
export const GET_MAPS_FAIL = 'GET_MAPS_FAIL';

export const getMaps = (botId) => {
  return dispatch => {
    return new Promise((resolve, reject) => {
      dispatch({ type: GET_MAPS });

      if (!botId) {
        const er = 'Invalid bot id';
        dispatch({ type: GET_MAPS_FAIL, reason: er });
        return reject(er);
      }

      const { api: { cloud: { base } } } = configs;
      return api.get(base + `/app/bots/${botId}/maps`).then(({ data }) => {
        const { local_maps: localMaps, group_maps: groupedMaps } = data;
        dispatch({ type: GET_MAPS_OK, data: { localMaps, groupedMaps } });
        return resolve({ localMaps, groupedMaps });
      }).catch(er => {
        dispatch({ type: GET_MAPS_FAIL, reason: er.toString() });
        return reject(er);
      });
    });
  }
}

/**
 * Get map
 */
export const GET_MAP = 'GET_MAP';
export const GET_MAP_OK = 'GET_MAP_OK';
export const GET_MAP_FAIL = 'GET_MAP_FAIL';

export const getMap = (botId, mapId, pathId) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: GET_MAP });

      if (!botId || !mapId || !pathId) {
        const er = 'Invalid inputs';
        dispatch({ type: GET_MAP_FAIL, reason: er });
        return reject(er);
      }

      const maps = () => {
        return new Promise((resolve, reject) => {
          const { bot: { localMaps, groupedMaps } } = getState();
          if (localMaps.length || groupedMaps.length) return resolve({ localMaps, groupedMaps });
          const { api: { cloud: { base } } } = configs;
          return api.get(base + `/app/bots/${botId}/maps`).then(({ data }) => {
            const { local_maps: localMaps, group_maps: groupedMaps } = data;
            return resolve({ localMaps, groupedMaps });
          }).catch(er => {
            return reject(er);
          });
        });
      }

      let data = { botId }
      return maps().then(({ localMaps, groupedMaps }) => {
        data = { ...data, localMaps, groupedMaps }
        const [currentMap] = localMaps.concat(groupedMaps).filter(({ _id }) => _id === mapId);
        const { location } = currentMap || {};

        if (!location) {
          const er = 'Cannot get map location';
          dispatch({ type: GET_MAP_FAIL, reason: er });
          return reject(er);
        }

        const { api: { localBot: { base } } } = configs;
        return api.get(base + `/map`, { mapId, location, pathId })
      }).then(({ data }) => {
        dispatch({ type: GET_MAP_OK, data });
        return resolve(data);
      }).catch(er => {
        dispatch({ type: GET_MAP_FAIL, reason: er.toString() });
        return reject(er);
      });
    });
  }
}

/**
 * Get current map
 */
export const GET_CURRENT_MAP = 'GET_CURRENT_MAP';
export const GET_CURRENT_MAP_OK = 'GET_CURRENT_MAP_OK';
export const GET_CURRENT_MAP_FAIL = 'GET_CURRENT_MAP_FAIL';

export const getCurrentMap = () => {
  return dispatch => {
    return new Promise((resolve, reject) => {
      dispatch({ type: GET_CURRENT_MAP });

      const { api: { localBot: { base } } } = configs;
      return api.get(base + `/map/current`).then(({ data }) => {
        dispatch({ type: GET_CURRENT_MAP_OK });
        return resolve(data);
      }).catch(er => {
        dispatch({ type: GET_CURRENT_MAP_FAIL, reason: er.toString() });
        return reject(er);
      });
    });
  }
}

/**
 * Save map
 */
export const SAVE_PATH = 'SAVE_PATH';
export const SAVE_PATH_OK = 'SAVE_PATH_OK';
export const SAVE_PATH_FAIL = 'SAVE_PATH_FAIL';

export const savePath = (mapId, path) => {
  return dispatch => {
    return new Promise((resolve, reject) => {
      dispatch({ type: SAVE_PATH });

      if (!mapId || !path) {
        const er = 'Invalid input';
        dispatch({ type: SAVE_PATH_FAIL, reason: er });
        return reject(er);
      }

      const { api: { localBot: { base } } } = configs;
      return api.put(base + `/path`, { mapId, path }).then(({ data }) => {
        dispatch({ type: SAVE_PATH_OK });
        return resolve(data);
      }).catch(er => {
        dispatch({ type: SAVE_PATH_FAIL, reason: er.toString() });
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
    case GET_MAPS_OK:
      return { ...state, ...action.data };
    case GET_MAPS_FAIL:
      return { ...state, ...action.data };
    case GET_MAP_OK:
      return { ...state, ...action.data };
    case GET_MAP_FAIL:
      return { ...state, ...action.data };
    case GET_CURRENT_MAP_OK:
      return { ...state, ...action.data };
    case GET_CURRENT_MAP_FAIL:
      return { ...state, ...action.data };
    case SAVE_PATH_OK:
      return { ...state, ...action.data };
    case SAVE_PATH_FAIL:
      return { ...state, ...action.data };
    default:
      return state;
  }
}