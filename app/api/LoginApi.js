import { Alert } from 'react-native';
import store from 'store/store';
import { dispatchLogin, dispatchOne } from 'utils/DispatchUtils';
import CryptoJS from 'react-native-crypto-js';
import { getPushToken } from 'utils/Push';
import { getMessagingToken } from 'utils/PushFcm';
import Api from './Api';
import * as Device from 'expo-device';

const { EXPO_PUSH_KEY, EXPO_PUBLIC_PROFILE } = process.env;

// LDAP login
export const login = async (username, password) => {
    store.dispatch(dispatchOne('SET_LOADING', true));
    // const encryptUsername = CryptoJS.AES.encrypt(JSON.stringify(username), EXPO_PUSH_KEY).toString();
    // const encryptPassword = password ? CryptoJS.AES.encrypt(JSON.stringify(password), EXPO_PUSH_KEY).toString() : null;

    return Api.test
        .post('login', { username: username, password: password })
        .then(({ status, data }) => {
            console.log(status);
            return { status: status == 200, token: data ? data.token : null };
        })
        .catch(async (err) => {
            console.log(err);
            store.dispatch(dispatchLogin(false, null));
            return { status: false };
        })
        .finally(() => {
            store.dispatch(dispatchOne('SET_LOADING', false));
        });
};

// test
export const loginTest = async (userid, pwd, url) => {
    return Api.mobile
        .post('loginProcAjax.do', { userid: userid, pwd: pwd, url: url })
        .then((response) => {
            const data = response.data;
            console.log(data);
            console.log(response.config.url);
        })
        .catch(async (err) => {
            console.log(err);
        });
};

// pin/bio 로그인 검증
export const checkLogin = async () => {
    store.dispatch(dispatchOne('SET_LOADING', true));
    return Api.test
        .get('login/check')
        .then(({ status, data }) => {
            console.log(status);
            store.dispatch(dispatchOne('SET_TOKEN', data['token']));
            checkPushToken();

            return { status: status == 200, data: data };
        })
        .catch(async (err) => {
            console.log(err);
            store.dispatch(dispatchLogin(false, null));
            return { status: false };
        })
        .finally(() => {
            store.dispatch(dispatchOne('SET_LOADING', false));
        });
};

// push 토큰 값 확인
export const checkPushToken = async () => {
    checkDevice();

    await getMessagingToken().then((deviceToken) => {
        console.log('---deviceToken---');
        console.log(deviceToken);
        store.dispatch(dispatchOne('SET_TEST', deviceToken));
        // const encryptPushToken = CryptoJS.AES.encrypt(JSON.stringify(deviceToken), EXPO_PUSH_KEY).toString();
        Api.test.post('push', { deviceToken: deviceToken });
    });
};

// expo push 토큰 값 확인
const checkExpoPushToken = async () => {
    await getPushToken().then((deviceToken) => {
        console.log('---deviceToken---');
        console.log(deviceToken);
        // store.dispatch(dispatchOne('SET_TEST', deviceToken));
        // const encryptPushToken = CryptoJS.AES.encrypt(JSON.stringify(deviceToken), EXPO_PUSH_KEY).toString();
        Api.test.post('push', { deviceToken: deviceToken });
    });
};

// device 정보 확인
const checkDevice = () => {
    const brandType = {
        samsung: 'Android',
        google: 'Android',
        xiaomi: 'Android',
        apple: 'IOS',
    };

    const deviceType = ['UNKNOWN', 'PHONE', 'TABLET', 'DESKTOP', 'TV', 'WATCH'];

    const brand = Device.brand;

    console.log(brand);

    const deviceInfo = {
        deviceType: Device.deviceType <= 6 ? deviceType[Device.deviceType] : 'UNKNOWN',
        brand: brand == null ? 'web' : brandType[brand.toLowerCase()],
        buildId: Device.osBuildId,
        osVersion: Device.osVersion,
    };

    console.log(deviceInfo);

    return deviceInfo;
};
