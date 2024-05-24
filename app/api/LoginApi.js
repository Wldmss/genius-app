import { Alert } from 'react-native';
import { dispatchLogin, dispatchOne } from 'utils/DispatchUtils';
import CryptoJS from 'react-native-crypto-js';
import { getPushToken } from 'utils/Push';
import Api from './Api';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
// import store from 'store/store';
import ApiFetch from './ApiFetch';
import axios from 'axios';

const { profile, isTest, version } = Constants.expoConfig.extra;

// const tempUri = 'https://naver.com';
// const tempUri = 'https://m.mail.naver.com/v2/read/0/6110';
const tempUri = '';
// const tempUri = 'https://aice.study/main';
// const tempUri =  'https://aice.study/info/aice';
// const tempUri = '/mobile/m/support/notice/noticeList.do';
// const tempUri =  'https://ktedu.kt.com/education/courseContents.do?classId=200034420_01';
// const tempUri = '192.168.50.254:8080/api/v1/file';
// const tempUri = '192.168.31.254:8080/file';

export const loginApiStore = (_store) => {
    store = _store;
};

export const test = () => {
    axios({
        url: 'https://iid.googleapis.com/iid/v1:batchImport',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization:
                'Bearer ya29.a0AXooCgt6fdoHOtxQkmWpfWrJbjWnQypkpssCHmDyR418scgfWAWHWxRM4W_xWJRohta6sSj7aZTZfC5yCqMAkOwoR8DFvSxd6p6juyDDirf7JZQhymurozxlAXG-i_UjEuKWqA6Ud48Q-MRJrJzb9MNN3D62TzQRGzaLaCgYKAcgSAQ8SFQHGX2MiWnylp9z4C3v7uej2jSKYug0171',
        },
        data: {
            application: 'com.kt.ktgenius',
            sandbox: true, //개발서버이면 true, 운영이면  false를 설정한다.
            apns_tokens: ['5d789c4b478c3547a1babf6564bf5e77b166bdea9c55f39b374589d3b174348c'],
        },
    })
        .then((res) => {
            console.log(res.data.results[0].registration_token);
        })
        .catch((error) => {
            console.log(error);
            console.log('APNS -> FCM 토큰 변경 에러');
        });
};

// server check & app version check
export const checkVersion = async () => {
    test();
    if (isTest) {
        return false;
    } else {
        const osType = await getOsType();
        return await ApiFetch.get(`api/checkAppVersion.do?osType=${osType}&appVersion=${version}`).then((response) => {
            const { rtnSts } = response;
            return rtnSts;
        });
    }
};

// LDAP login
export const login = async (username, password) => {
    store.dispatch(dispatchOne('SET_LOADING', true));

    const encryptUsername = CryptoJS.AES.encrypt(JSON.stringify(username), process.env.AES_KEY).toString();
    const encryptPassword = password ? CryptoJS.AES.encrypt(JSON.stringify(password), process.env.AES_KEY).toString() : null;

    const deviceToken = await getDeviceToken();
    const osType = await getOsType();

    if (isTest) {
        store.dispatch(dispatchOne('SET_WEBLINK', tempUri));
        store.dispatch(dispatchOne('SET_LOADING', false));
        return { status: true, token: '91352089&2024-01-01' };
    } else {
        const sendData = {
            userId: encryptUsername,
            pwd: encryptPassword,
            deviceToken: deviceToken,
            osType: osType,
            appVersion: version,
        };

        console.log(sendData);

        return await ApiFetch.post('api/login/loginProc.do', JSON.stringify(sendData))
            .then((response) => {
                const { rtnSts, rtnMsg, rtnUrl, loginKey } = response;

                if (rtnSts == 'E') {
                    let msg = rtnMsg;
                    if (rtnMsg == null) msg = '로그인에 실패했습니다.\n다시 시도해주세요.';
                    Alert.alert(msg);
                    return { status: false };
                }

                store.dispatch(dispatchOne('SET_WEBLINK', rtnUrl));

                return { status: rtnSts == 200, token: loginKey || null };
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
};

// pin/bio 로그인 검증
export const checkLogin = async (checkFlag) => {
    if (!checkFlag) store.dispatch(dispatchOne('SET_LOADING', true));

    const deviceToken = await getDeviceToken();
    const osType = await getOsType();
    const loginKey = store.getState().loginReducer.loginKey;

    if (isTest) {
        if (!checkFlag) {
            store.dispatch(dispatchOne('SET_WEBLINK', tempUri));
            store.dispatch(dispatchOne('SET_TOKEN', '91352089&2024-01-01'));
            store.dispatch(dispatchOne('SET_LOADING', false));
            // testToken(deviceToken);
        }

        return { status: true, data: 'token' };
    } else {
        const sendData = {
            deviceToken: deviceToken,
            osType: osType,
            appVersion: version,
            loginKey: loginKey,
        };

        return ApiFetch.post('api/login/loginKeyProc.do', JSON.stringify(sendData))
            .then((response) => {
                const { rtnSts, rtnMsg, rtnUrl } = response;

                if (rtnSts == 'E') {
                    let msg = rtnMsg;
                    if (rtnMsg == null) msg = '로그인에 실패했습니다.\n다시 시도해주세요.';
                    Alert.alert(msg);
                    return { status: false };
                }

                store.dispatch(dispatchOne('SET_WEBLINK', rtnUrl));
                store.dispatch(dispatchOne('SET_TOKEN', loginKey || null));

                return { status: rtnSts == 200, data: loginKey != null };
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

// 인증번호 확인
export const checkSms = async (otp, token) => {
    const sendData = {
        serial: String(otp) || '',
        loginKey: token,
    };

    if (isTest) {
        store.dispatch(dispatchOne('SET_WEBLINK', tempUri));
        return true;
    } else {
        return await ApiFetch.post(`api/login/checkSmsAuth.do`, JSON.stringify(sendData)).then((response) => {
            const { rtnSts, rtnMsg, rtnUrl } = response;

            if (Number(rtnSts) != 1) {
                Alert.alert(rtnMsg);
                return false;
            }

            store.dispatch(dispatchOne('SET_WEBLINK', rtnUrl));

            return true;
        });
    }
};

// push token 값
const getDeviceToken = async () => {
    return await getPushToken().then((deviceToken) => {
        console.log('---deviceToken---');
        console.log(deviceToken);

        if (isTest) {
            // if (profile == 'development')
            Api.test.post('push', { deviceToken: deviceToken });

            // testToken(deviceToken);
        }

        return deviceToken;
    });
};

// os type
const getOsType = () => {
    const brandType = {
        samsung: 'Android',
        google: 'Android',
        xiaomi: 'Android',
        apple: 'IOS',
    };

    const brand = Device.brand;
    console.log(brand);

    return brand == null ? 'web' : brandType[brand.toLowerCase()];
};

// token test
export const testToken = (deviceToken) => {
    store.dispatch(dispatchOne('SET_TEST', deviceToken));
    store.dispatch(dispatchOne('SET_TAB', 'test'));
};

/////////////////////////////////////////////

const checkServer = async () => {
    return Api.test
        .get('check')
        .then((result) => {
            if (result) return true;
            return false;
        })
        .catch((err) => {
            return false;
        });
};

const localLogin = async () => {
    const sendData = {
        username: 'username',
        password: 'password',
        deviceToken: 'deviceToken',
        osType: 'osType',
        encryptUsername: 'encryptUsername',
        encryptPassword: 'encryptPassword',
    };

    console.log(sendData);

    return Api.test
        .post('login', sendData)
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

const localCheckLogin = async () => {
    const sendData = {
        username: null,
        password: null,
        deviceToken: 'deviceToken',
        osType: 'osType',
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
