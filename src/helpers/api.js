import axios from 'axios';
import storage from 'helpers/storage';

const getToken = () => {
  let token = storage.get('token');
  if (!token || typeof token !== 'string') return null;
  return token;
}

const api = {}


/**
 * CRUD Model
 */

// Create
api.post = (url, params = null) => {
  return new Promise((resolve, reject) => {
    const authHeader = getToken();
    return axios({
      method: 'post',
      url: url,
      data: params,
      headers: authHeader ? { 'Authorization': authHeader } : null
    }).then(re => {
      let data = re.data;
      if (data.status === 'ERROR') return reject(data.error);
      return resolve(data);
    }).catch(er => {
      if (er.response) {
        const { response: { data: { msg } } } = er;
        return reject(msg);
      }
      return reject(er.message);
    });
  });
}

// Read
api.get = (url, params = null) => {
  const authHeader = getToken();
  return new Promise((resolve, reject) => {
    return axios({
      method: 'get',
      url: url,
      params: params,
      headers: authHeader ? { 'Authorization': authHeader } : null
    }).then(re => {
      let data = re.data;
      if (data.status === 'ERROR') return reject(data.error);
      return resolve(data);
    }).catch(er => {
      if (er.response) {
        const { response: { data: { msg } } } = er;
        return reject(msg);
      }
      return reject(er.message);
    });
  });
}

// Update
api.put = (url, params = null) => {
  const authHeader = getToken();
  return new Promise((resolve, reject) => {
    return axios({
      method: 'put',
      url: url,
      data: params,
      headers: authHeader ? { 'Authorization': authHeader } : null
    }).then(re => {
      let data = re.data;
      if (data.status === 'ERROR') return reject(data.error);
      return resolve(data);
    }).catch(er => {
      if (er.response) {
        const { response: { data: { msg } } } = er;
        return reject(msg);
      }
      return reject(er.message);
    });
  });
}

// Delete
api.delete = (url, params = null) => {
  const authHeader = getToken();
  return new Promise((resolve, reject) => {
    return axios({
      method: 'delete',
      url: url,
      data: params,
      headers: authHeader ? { 'Authorization': authHeader } : null
    }).then(re => {
      let data = re.data;
      if (data.status === 'ERROR') return reject(data.error);
      return resolve(data);
    }).catch(er => {
      if (er.response) {
        const { response: { data: { msg } } } = er;
        return reject(msg);
      }
      return reject(er.message);
    });
  });
}

export default api;