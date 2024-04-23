import Api from './Api';

/** api 서비스 (사용 x) */
class ApiService {
    get(url, params, config) {
        config = config || {};
        config.params = params;
        return Api.mobile.get(`${process.env.EXPO_PUBLIC_API_URL}/${url}`, config);
    }

    post(url, body, config) {
        body = body || {};
        return Api.mobile.post(`${process.env.EXPO_PUBLIC_API_URL}/${url}`, body, config);
    }

    put(url, body, config) {
        body = body || {};
        return Api.mobile.put(`${process.env.EXPO_PUBLIC_API_URL}/${url}`, body, config);
    }

    patch(url, body, config) {
        body = body || {};
        return Api.mobile.patch(`${process.env.EXPO_PUBLIC_API_URL}/${url}`, body, config);
    }

    delete(url, config) {
        return Api.mobile.delete(`${process.env.EXPO_PUBLIC_API_URL}/${url}`, config);
    }
}

export default new ApiService();
