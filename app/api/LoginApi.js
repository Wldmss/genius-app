import { Alert } from 'react-native';
import { dispatchLogin, dispatchOne } from 'utils/DispatchUtils';
import CryptoJS from 'react-native-crypto-js';
import { getPushToken } from 'utils/Push';
// import { getMessagingToken } from 'utils/PushFcm';
import Api from './Api';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import store from 'store/store';

const { profile, isTest, version } = Constants.expoConfig.extra;

// server check
export const checkServer = async () => {
    if (isTest) {
        return true;
    } else {
        if (profile == 'production') {
            // 앱 버전 체크 메소드로 변경 todo
            const response = await fetch(`https://ktedu.kt.com/common/dbCheck.do`, {
                method: 'GET',
            });

            return response.status == 200;
        } else {
            return Api.test
                .get('check')
                .then((result) => {
                    if (result) return true;
                    return false;
                })
                .catch((err) => {
                    return false;
                });
        }
    }
};

// LDAP login
export const login = async (username, password) => {
    store.dispatch(dispatchOne('SET_LOADING', true));

    try {
        const encryptUsername = CryptoJS.AES.encrypt(JSON.stringify(username), process.env.AES_KEY).toString();
        const encryptPassword = password ? CryptoJS.AES.encrypt(JSON.stringify(password), process.env.AES_KEY).toString() : null;

        const deviceToken = await getDeviceToken();
        const osType = await getOsType();

        console.log(deviceToken);

        if (isTest) {
            store.dispatch(dispatchOne('SET_LOADING', false));
            return { status: true, token: 'token' };
        } else {
            const sendData = {
                username: username,
                password: password,
                deviceToken: deviceToken,
                osType: osType,
                encryptUsername: encryptUsername,
                encryptPassword: encryptPassword,
            };

            console.log(sendData);

            return Api.test
                .post('login', sendData)
                .then(({ status, data }) => {
                    console.log(status);

                    if (data && data['noUser']) {
                        Alert.alert('계정이 존재하지 않습니다.');
                        return { status: false };
                    }

                    if (data && data['pwdErr']) {
                        Alert.alert('아이디/비밀번호를 다시 입력해주세요.');
                        return { status: false };
                    }

                    if (data && data['pwdExp']) {
                        Alert.alert('비밀번호가 만료되었습니다.');
                        return { status: false };
                    }

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
        }
    } catch (err) {
        Alert.alert(JSON.stringify(err));
    }
};

// pin/bio 로그인 검증
export const checkLogin = async (checkFlag) => {
    if (!checkFlag) store.dispatch(dispatchOne('SET_LOADING', true));

    const deviceToken = await getDeviceToken();
    const osType = await getOsType();

    if (isTest) {
        if (!checkFlag) {
            store.dispatch(dispatchOne('SET_TOKEN', 'token'));
            store.dispatch(dispatchOne('SET_LOADING', false));
        }

        return { status: true, data: 'token' };
    } else {
        const sendData = {
            username: null,
            password: null,
            deviceToken: deviceToken,
            osType: osType,
            encryptUsername: null,
            encryptPassword: null,
        };

        return Api.test
            .post('login/check', sendData)
            .then(({ status, data }) => {
                console.log(status);

                if (data && data['noUser']) {
                    Alert.alert('계정이 존재하지 않습니다.');
                    return { status: false };
                }

                if (data && data['pwdExp']) {
                    Alert.alert('비밀번호가 만료되었습니다.');
                    return { status: false };
                }

                store.dispatch(dispatchOne('SET_TOKEN', data?.token || null));
                return { status: status == 200, data: data };
            })
            .catch(async (err) => {
                console.log(err);
                if (!checkFlag) store.dispatch(dispatchLogin(false, null));
                return { status: false };
            })
            .finally(() => {
                store.dispatch(dispatchOne('SET_LOADING', false));
            });
    }
};

// 로그인 공통
const commonLogin = () => {};

// push token 값
const getDeviceToken = async () => {
    return await getPushToken().then((deviceToken) => {
        console.log('---deviceToken---');
        console.log(deviceToken);
        // store.dispatch(dispatchOne('SET_TEST', deviceToken));
        // store.dispatch(dispatchOne('SET_TAB', 'test'));

        return deviceToken;
    });
};

// os type
const getOsType = () => {
    const brandType = {
        samsung: 'android',
        google: 'android',
        xiaomi: 'android',
        apple: 'ios',
    };

    const brand = Device.brand;
    console.log(brand);

    return brand == null ? 'web' : brandType[brand.toLowerCase()];
};

/////////////////////////////////////////////

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

// push 토큰 값 확인
export const checkPushToken = async () => {
    checkDevice();

    await getPushToken().then((deviceToken) => {
        console.log('---deviceToken---');
        console.log(deviceToken);
        store.dispatch(dispatchOne('SET_TEST', deviceToken));
        // store.dispatch(dispatchOne('SET_TAB', 'test'));
        // const encryptPushToken = CryptoJS.AES.encrypt(JSON.stringify(deviceToken), AES_KEY).toString();

        if (!isTest) Api.test.post('push', { deviceToken: deviceToken });
    });

    // await getMessagingToken().then((deviceToken) => {
    //     console.log('---deviceToken---');
    //     console.log(deviceToken);
    //     store.dispatch(dispatchOne('SET_TEST', deviceToken));
    //     // const encryptPushToken = CryptoJS.AES.encrypt(JSON.stringify(deviceToken), AES_KEY).toString();
    //     // TEST
    //     if (!isTest) Api.test.post('push', { deviceToken: deviceToken });
    // });
};

// expo push 토큰 값 확인
const checkExpoPushToken = async () => {
    await getPushToken().then((deviceToken) => {
        console.log('---deviceToken---');
        console.log(deviceToken);
        // store.dispatch(dispatchOne('SET_TEST', deviceToken));
        // const encryptPushToken = CryptoJS.AES.encrypt(JSON.stringify(deviceToken), AES_KEY).toString();
        Api.test.post('push', { deviceToken: deviceToken });
    });
};

// device 정보 확인 (로그인 시마다 서버에 전송)
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
        appVersion: Constants.expoConfig.version,
    };

    console.log(deviceInfo);

    return deviceInfo;
};
