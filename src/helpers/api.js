import axios from 'axios';

const api = {}


/**
 * CRUD Model
 */

// Create
api.post = (url, params = null) => {
  return new Promise((resolve, reject) => {
    return axios({
      method: 'post',
      url: url,
      data: params,
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
  return new Promise((resolve, reject) => {
    return axios({
      method: 'get',
      url: url,
      params: params,
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
  return new Promise((resolve, reject) => {
    return axios({
      method: 'put',
      url: url,
      data: params,
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
  return new Promise((resolve, reject) => {
    return axios({
      method: 'delete',
      url: url,
      data: params,
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