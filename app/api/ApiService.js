import Api from './Api';

const { EXPO_PUBLIC_API_URL } = process.env;

class ApiService {
    get(url, params, config) {
        config = config || {};
        config.params = params;
        return Api.mobile.get(`${EXPO_PUBLIC_API_URL}/${url}`, config);
    }

    post(url, body, config) {
        body = body || {};
        return Api.mobile.post(`${EXPO_PUBLIC_API_URL}/${url}`, body, config);
    }

    put(url, body, config) {
        body = body || {};
        return Api.mobile.put(`${EXPO_PUBLIC_API_URL}/${url}`, body, config);
    }

    patch(url, body, config) {
        body = body || {};
        return Api.mobile.patch(`${EXPO_PUBLIC_API_URL}/${url}`, body, config);
    }

    delete(url, config) {
        return Api.mobile.delete(`${EXPO_PUBLIC_API_URL}/${url}`, config);
    }
}

export default new ApiService();
