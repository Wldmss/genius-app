import axios from 'axios';
import { SERVER_URL } from '@env';
import { Alert } from 'react-native';

const Api = axios.create({
    baseURL: `${SERVER_URL}/`,
    timeout: 30000,
    headers: { 'Context-Type': 'application/json' },
    maxRedirects: 0,
});

Api.defaults.timeout = 30000;
Api.defaults.headers.post['Content-Type'] = 'application/json';

// 요청 intercept
Api.interceptors.request.use(
    function (config) {
        let token = '';
        if (config.url) {
            config.headers['Authorization'] = '';
        } else {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    function (err) {
        return Promise.reject(err);
    }
);

// 응답 intercept
Api.interceptors.response.use(
    function (response) {
        let config = response.config;
        let method = config.method;
        if (method == 'post' || method == 'put') {
            //
        }

        return response;
    },
    function (err) {
        let errResponse = err.response || {};
        let status = errResponse.status;
        let requestConfig = err.config;

        if (err && err.response) {
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
        }

        return Promise.reject(err);
    }
);

export default Api;
