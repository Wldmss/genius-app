import { setDevelopment } from '(login)/_layout';
import axios from 'axios';
import { Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Updates from 'expo-updates';

let server_url = process.env.SERVER_URL;
let isDev = false;

export const apiStore = (_store) => {
    store = _store;

    isDev = store.getState().commonReducer.isDev;
    server_url = isDev ? process.env.DEV_SERVER_URL : process.env.SERVER_URL;
};

/** ktedu */

const AxiosMobile = axios.create({
    timeout: 3000,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    maxRedirects: 0,
});

AxiosMobile.defaults.timeout = 3000;
AxiosMobile.defaults.headers.post['Content-Type'] = 'application/json';

// 요청 intercept
AxiosMobile.interceptors.request.use(
    function (config) {
        config.baseURL = server_url;
        config.url = `${process.env.EXPO_PUBLIC_API_URL}${config.url}`;
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
    baseURL: 'https://4ded-211-36-136-213.ngrok-free.app',
    timeout: 3000,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    maxRedirects: 0,
});

AxiosTest.defaults.timeout = 3000;
AxiosTest.defaults.headers.post['Content-Type'] = 'application/json';

// 요청 intercept
AxiosTest.interceptors.request.use(
    function (config) {
        config.url = `${config.url}`; //${process.env.EXPO_PUBLIC_TEST_API_URL}
        config.responseType = 'blob';
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
    let baseURL = requestConfig.baseURL;
    let url = requestConfig.url;

    if (!requestConfig.errCheck) {
        let message = null;
        switch (status) {
            case 400:
                message = '입력 값을 확인해주세요.';
                break;
            case 401:
                message = '인증 정보가 없어 로그아웃 됩니다.';
                break;
            case 404:
                message = `잘못된 경로입니다.`;
                break;
            case 406:
                message = '시스템 오류입니다. 관리자에게 문의해주세요.';
                break;
            case 503:
                message = '서버 재시작 중입니다.';
                break;
            default:
                message = '알 수 없는 오류입니다.';
                break;
        }

        if (message != null) {
            if (isDev) {
                catchError(`${baseURL}${url}`, `[${status}] ${message}`);
            } else {
                Alert.alert(message);
            }
        }
    }

    return Promise.reject(err);
}

const catchError = (url, error) => {
    Alert.alert(`개발자 모드`, `${url}\n${error}`, [
        {
            text: '무시하고 계속',
            onPress: () => null,
        },
        {
            text: '모드 변경',
            onPress: async () => {
                setDevelopment();
            },
        },
        {
            text: '복사 및 재시작',
            onPress: async () => {
                await Clipboard.setStringAsync(`${url}\n\n${error}`);
                await Updates.reloadAsync();
            },
        },
    ]);
};

const Api = {
    test: AxiosTest,
    mobile: AxiosMobile,
};

export default Api;
