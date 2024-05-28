import { Alert } from 'react-native';
import { dispatchLogin, dispatchOne } from 'utils/DispatchUtils';
import CryptoJS from 'react-native-crypto-js';
import Api from './Api';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import ApiFetch from './ApiFetch';
import axios from 'axios';
import { getMessagingToken } from 'utils/PushFcm';

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

/** server check & app version check
 * @return boolean : true = 앱 업데이트 필요
 */
export const checkVersion = async () => {
    if (isTest) {
        return false;
    } else {
        const osType = await getOsType();
        return await ApiFetch.get(`api/checkAppVersion.do?osType=${osType}&appVersion=${version}`).then((response) => {
            const { rtnSts } = response; // F: 기준정보 버전보다 낮거나 높음, T: 동일, E: 값 없음.
            return rtnSts == 'F';
        });
    }
};

/** LDAP login
 * @param username : 로그인 사번
 * @param password : 로그인 비번
 * @return boolean
 */
export const login = async (username, password) => {
    store.dispatch(dispatchOne('SET_LOADING', true));

    const encryptUsername = CryptoJS.AES.encrypt(JSON.stringify(username), process.env.AES_KEY).toString();
    const encryptPassword = password ? CryptoJS.AES.encrypt(JSON.stringify(password), process.env.AES_KEY).toString() : null;

    if (isTest) {
        store.dispatch(dispatchOne('SET_WEBLINK', tempUri));
        store.dispatch(dispatchOne('SET_LOADING', false));
        return true;
    } else {
        const sendData = {
            userId: encryptUsername,
            pwd: encryptPassword,
        };

        console.log(sendData);

        return await ApiFetch.post('api/login/loginProc.do', JSON.stringify(sendData))
            .then((response) => {
                const { rtnSts, rtnMsg, rtnUrl, expDueDt } = response;

                // 상태 (S: 성공, E: 실패)
                if (rtnSts == 'S') {
                    store.dispatch(dispatchOne('SET_WEBLINK', rtnUrl));
                    // expDueDt todo 어디에 저장해야 함.

                    return true;
                } else {
                    handleRtnMsg(rtnMsg);

                    return false;
                }
            })
            .catch(async (err) => {
                console.log(err);
                store.dispatch(dispatchLogin(false, null));

                return false;
            })
            .finally(() => {
                store.dispatch(dispatchOne('SET_LOADING', false));
            });
    }
};

/** 로그인 key 검증 (pin, bio)
 * @param checkFlag : pin 변경 시 loginKey 체크
 * @return boolean
 *  */
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
        }

        return true;
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

                // 상태 (S: 성공, E: 실패)
                if (rtnSts == 'S') {
                    store.dispatch(dispatchOne('SET_WEBLINK', rtnUrl));
                    store.dispatch(dispatchOne('SET_TOKEN', loginKey || null));

                    return true;
                } else {
                    handleRtnMsg(rtnMsg);

                    return false;
                }
            })
            .catch(async (err) => {
                console.log(err);
                if (!checkFlag) store.dispatch(dispatchLogin(false, null));
                return false;
            })
            .finally(() => {
                store.dispatch(dispatchOne('SET_LOADING', false));
            });
    }
};

/** 인증번호 전송
 * @param username : 로그인 사번
 * @return boolean
 */
export const sendSms = async (username) => {
    const encryptUsername = CryptoJS.AES.encrypt(JSON.stringify(username), process.env.AES_KEY).toString();
    const deviceToken = await getDeviceToken();
    const osType = await getOsType();

    const sendData = {
        userId: encryptUsername,
        deviceToken: deviceToken,
        osType: osType,
        appVersion: version,
    };

    if (isTest) {
        return true;
    } else {
        return await ApiFetch.post(`api/login/sendSmsOpt.do`, JSON.stringify(sendData)).then((response) => {
            const { rtnSts, rtnMsg } = response;

            // 상태 (S: 성공, E: 실패)
            if (rtnSts == 'E') {
                if (rtnMsg && rtnMsg != '') Alert.alert(JSON.stringify(rtnMsg));
                return false;
            }

            return true;
        });
    }
};

/** 인증번호 확인
 * @param loginInfo { username: '', password: '', otp: '' }
 * @return { status: boolean, token: string }
 */
export const checkSms = async (loginInfo) => {
    const encryptUsername = CryptoJS.AES.encrypt(JSON.stringify(loginInfo.username), process.env.AES_KEY).toString();
    const deviceToken = await getDeviceToken();
    const osType = await getOsType();

    const sendData = {
        userId: encryptUsername,
        serial: String(loginInfo.otp) || '',
        expDueDt: '', // todo 어디에 저장한거 가져와야 함
        deviceToken: deviceToken,
        osType: osType,
        appVersion: version,
    };

    if (isTest) {
        store.dispatch(dispatchOne('SET_WEBLINK', tempUri));
        return { status: true, token: '91352089&2024-01-01' };
    } else {
        return await ApiFetch.post(`api/login/checkSmsAuth.do`, JSON.stringify(sendData)).then((response) => {
            const { rtnSts, rtnMsg, rtnUrl, token } = response;

            // 상태 (S: 성공, E: 실패)
            if (rtnSts == 'S') {
                store.dispatch(dispatchOne('SET_WEBLINK', rtnUrl));

                return { status: true, token: loginKey };
            } else {
                handleRtnMsg(rtnMsg);

                return { status: false, token: null };
            }
        });
    }
};

// rtnMsg 처리
const handleRtnMsg = (message) => {
    if (message == null || message == '') message = '로그인에 실패했습니다.\n다시 시도해주세요.';
    Alert.alert(message);
};

// push token 값
const getDeviceToken = async () => {
    return await getMessagingToken().then((deviceToken) => {
        console.log('---deviceToken---');
        console.log(deviceToken);

        if (isTest) {
            if (profile == 'development' || profile == 'test') Api.test.post('push', { deviceToken: deviceToken });
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
