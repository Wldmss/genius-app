import axios from 'axios';
import { Alert } from 'react-native';

export const apiStore = (_store) => {
    store = _store;
};

/** ktedu */

const AxiosMobile = axios.create({
    baseURL: `${process.env.EXPO_PUBLIC_SERVER_URL}/`,
    timeout: 3000,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    maxRedirects: 0,
});

AxiosMobile.defaults.timeout = 3000;
AxiosMobile.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

// 요청 intercept
AxiosMobile.interceptors.request.use(
    function (config) {
        config.url = `${process.env.EXPO_PUBLIC_API_URL}${config.url}`;
        console.log(config.url);
        return requestConfig(config);
    },
    function (err) {
        return Promise.reject(err);
    }
);

// 응답 intercept
AxiosMobile.interceptors.response.use(
    function (response) {
        return responseConfig(response);
    },
    function (err) {
        return error(err);
    }
);

/** test */

const AxiosTest = axios.create({
    baseURL: 'https://85a4-117-111-17-91.ngrok-free.app',
    timeout: 3000,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    maxRedirects: 0,
});

AxiosTest.defaults.timeout = 3000;
AxiosTest.defaults.headers.post['Content-Type'] = 'application/json';

// 요청 intercept
AxiosTest.interceptors.request.use(
    function (config) {
        config.url = `${process.env.EXPO_PUBLIC_TEST_API_URL}${config.url}`;
        return requestConfig(config, true);
    },
    function (err) {
        return Promise.reject(err);
    }
);

// 응답 intercept
AxiosTest.interceptors.response.use(
    function (response) {
        return responseConfig(response);
    },
    function (err) {
        return error(err);
    }
);

/** 공통 function */

// request config 처리
function requestConfig(config, tokenFlag) {
    const method = config.method;
    if (method == 'get') {
        if (!config) config = {};
    }

    if (method == 'post' || method == 'put' || method == 'patch') {
        if (!config.data) config.data = {};
    }

    const token = tokenFlag ? store.getState().loginReducer.loginKey : '';

    if (config.url) {
        config.headers['Authorization'] = `${token}`; // Bearer
    } else {
        config.headers['Authorization'] = '';
    }

    return config;
}

// response config 처리
function responseConfig(response) {
    let config = response.config;
    let method = config.method;
    if (method == 'post' || method == 'put') {
    }

    return response;
}

// error 처리
function error(err) {
    let errResponse = err.response || {};
    let status = errResponse.status;
    let requestConfig = err.config;

    if (!requestConfig.errCheck) {
        switch (status) {
            case 400:
                Alert.alert('입력 값을 확인해주세요.');
                break;
            case 401:
                Alert.alert('인증 정보가 없어 로그아웃 됩니다.');
                break;
            case 404:
                Alert.alert('잘못된 경로입니다.');
                break;
            case 406:
                Alert.alert('시스템 오류입니다. 관리자에게 문의해주세요.');
                break;
            case 503:
                Alert.alert('서버 재시작 중입니다.');
                break;
            default:
                Alert.alert('알 수 없는 오류입니다.');
                break;
        }
    }

    return Promise.reject(err);
}

const Api = {
    test: AxiosTest,
    mobile: AxiosMobile,
};

export default Api;
