import ApiService from './ApiService';
import * as Notifications from 'expo-notifications';
import store from 'store/store';
import { dispatchOne } from 'utils/DispatchUtils';
import CryptoJS from 'react-native-crypto-js';

// LDAP login
export const login = async (username, password, notification) => {
    const key = 'genius';
    const encryptUsername = CryptoJS.AES.encrypt(JSON.stringify(username), key).toString();
    const encryptPassword = password ? CryptoJS.AES.encrypt(JSON.stringify(password), key).toString() : null;

    return ApiService.post('login', { username: encryptUsername, password: encryptPassword })
        .then((response) => {
            const data = response.data;
            checkPushToken(data['token'], notification);

            return { status: true, data: data };
        })
        .catch(async (err) => {
            await checkPushToken(null, notification);
            return { status: true, data: { token: {} } };
        });
};

// push 토큰 값 확인
export const checkPushToken = async (serverToken, notification) => {
    await getPushToken(notification).then((token) => {
        console.log(token);
        store.dispatch(dispatchOne('SET_TEST', token));
        if (token != serverToken) {
            // token이 잘못 된 경우 삭제하는 로직을 백단에 추가해야 함 (todo)
            ApiService.post('push', { token: token })
                .then((response) => {
                    const data = response.data;
                    console.log(data);
                })
                .catch((err) => {});
        }
    });
};

// push 토큰 발급
async function getPushToken(notification) {
    if (notification) {
        return (await Notifications.getDevicePushTokenAsync()).data;
    }

    return null;
}
