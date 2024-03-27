import ApiService from './ApiService';
import store from 'store/store';
import { dispatchOne } from 'utils/DispatchUtils';
import CryptoJS from 'react-native-crypto-js';
import { getPushToken } from 'utils/Push';
import { getMessagingToken } from 'utils/PushFcm';
import { Alert } from 'react-native';

const { EXPO_PUSH_KEY } = process.env;

// LDAP login
export const login = async (username, password) => {
    // const encryptUsername = CryptoJS.AES.encrypt(JSON.stringify(username), EXPO_PUSH_KEY).toString();
    // const encryptPassword = password ? CryptoJS.AES.encrypt(JSON.stringify(password), EXPO_PUSH_KEY).toString() : null;

    return ApiService.post('login', { username: username, password: password })
        .then(({ status, data }) => {
            console.log(status);
            return { status: status == 200, data: data };
        })
        .catch(async (err) => {
            console.log(err);
            return { status: false };
        });
};

// pin/bio 로그인 검증
export const checkLogin = async () => {
    return ApiService.get('login/check')
        .then(({ status, data }) => {
            console.log(status);
            store.dispatch(dispatchOne('SET_TOKEN', data['token']));
            checkPushToken();

            return { status: status == 200, data: data };
        })
        .catch(async (err) => {
            console.log(err);
            return { status: false };
        });
};

// push 토큰 값 확인
export const checkPushToken = async () => {
    // await getPushToken().then((deviceToken) => {
    //     console.log('---deviceToken---');
    //     console.log(deviceToken);
    //     // store.dispatch(dispatchOne('SET_TEST', deviceToken));

    //     // const encryptPushToken = CryptoJS.AES.encrypt(JSON.stringify(deviceToken), EXPO_PUSH_KEY).toString();
    //     ApiService.post('push', { deviceToken: deviceToken });
    // });

    await getMessagingToken().then((deviceToken) => {
        console.log('---deviceToken---');
        console.log(deviceToken);
        Alert.alert(deviceToken);
        store.dispatch(dispatchOne('SET_TEST', deviceToken));

        // const encryptPushToken = CryptoJS.AES.encrypt(JSON.stringify(deviceToken), EXPO_PUSH_KEY).toString();
        ApiService.post('push', { deviceToken: deviceToken });
    });
};
