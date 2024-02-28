import { API_URL } from '@env';
import Api from './Api';

class ApiService {
    get(url, params, config) {
        config = config || {};
        config.params = params;
        return Api.get(`${API_URL}/${url}`, config);
    }

    post(url, body, config) {
        body = body || {};
        return Api.post(`${API_URL}/${url}`, body, config);
    }

    put(url, body, config) {
        body = body || {};
        return Api.put(`${API_URL}/${url}`, body, config);
    }

    patch(url, body, config) {
        body = body || {};
        return Api.patch(`${API_URL}/${url}`, body, config);
    }

    delete(url, config) {
        return Api.delete(`${API_URL}/${url}`, config);
    }
}

export default new ApiService();
