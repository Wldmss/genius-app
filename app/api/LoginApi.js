import { Alert } from 'react-native';
import axios from 'axios';
import { dispatchLogin, dispatchMultiple, dispatchOne } from 'utils/DispatchUtils';
import Api from './Api';
import { getMessagingToken } from 'utils/PushFcm';
import { encrypt } from 'utils/CipherUtils';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import propTypes from 'prop-types';
import { okAlert } from 'utils/AlertUtils';

const { profile, isTest, androidVersion, iosVersion } = Constants.expoConfig.extra;
const { version } = Constants.expoConfig;

const testUrl = ''; // /mobile/m/login.do

export const loginApiStore = (_store) => {
    store = _store;
};

let isDev = null;

const checkIsTest = () => {
    isDev = isDev || store.getState().commonReducer.isDev;
    return profile == 'development'; //isTest && !isDev;
};

/** server check & app version check
 * @return { status: 서버 활성화 여부, update: true=앱 업데이트 필요 }
 */
export const checkVersion = async () => {
    if (checkIsTest()) {
        return { status: true, update: false };
    } else {
        const osType = await getOsType();
        const appVersion = getBuildVersion(osType);

        /** 앱 버전 체크
         * @method GET
         * @param osType : os 종류
         * @param appVersion : 앱 버전
         * @return { rtnSts } : F: 기준정보 버전보다 낮거나 높음, T: 동일, E: 값 없음.
         */
        return await Api.mobile
            .get(`api/checkAppVersion.do?osType=${osType}&appVersion=${appVersion}`)
            .then((response) => {
                const { rtnSts } = response.data;
                return { status: true, update: rtnSts == 'F' };
            })
            .catch((error) => {
                Alert.alert('잠시 후 다시 시도해주세요.');
                return { status: false, update: false };
            });
    }
};

/** LDAP login
 * @return boolean
 */
export const login = async (username, password) => {
    store.dispatch(dispatchOne('SET_LOADING', true));

    const encryptUsername = encrypt(username);
    const encryptPassword = password ? encrypt(password) : null;

    if (checkIsTest()) {
        store.dispatch(dispatchMultiple({ SET_WEBLINK: testUrl, SET_LOADING: false }));
        return true;
    } else {
        const sendData = {
            userId: encryptUsername,
            pwd: encryptPassword,
        };

        /** 로그인 (LDAP)
         * @method POST
         * @param { userId : 로그인 사번 (AES256), pwd : 비밀번호 (AES256) }
         * @return { rtnSts : 상태 (S: 성공, E: 실패), rtnMsg : 메시지, rtnUrl : 이동 url }
         */
        return await Api.mobile
            .post('api/login/loginProc.do', sendData)
            .then((response) => {
                const { rtnSts, rtnMsg, rtnUrl } = response.data;

                if (rtnSts == 'S') {
                    store.dispatch(dispatchOne('SET_WEBLINK', rtnUrl));

                    return true;
                } else {
                    handleRtnMsg(rtnMsg);
                    store.dispatch(dispatchLogin(false));

                    return false;
                }
            })
            .catch(async (err) => {
                if (isDev) store.dispatch(dispatchMultiple({ SET_WEBLINK: testUrl }));
                return isDev;
            })
            .finally(() => {
                store.dispatch(dispatchOne('SET_LOADING', false));
            });
    }
};

login.propTypes = {
    username: propTypes.string.isRequired, // 로그인 사번
    password: propTypes.string.isRequired, // 로그인 비번
};

/** 로그인 key 검증 (pin, bio)
 * @return boolean
 *  */
export const checkLogin = async (checkFlag) => {
    if (!checkFlag) store.dispatch(dispatchOne('SET_LOADING', true));

    const deviceToken = await getDeviceToken();
    const osType = await getOsType();
    const appVersion = getBuildVersion(osType);
    const loginKey = store.getState().loginReducer.loginKey;

    if (checkIsTest()) {
        if (!checkFlag) {
            store.dispatch(dispatchMultiple({ SET_WEBLINK: testUrl, SET_TOKEN: '91352089&2024-01-01', SET_LOADING: false }));
        }

        return true;
    } else {
        const sendData = {
            deviceToken: deviceToken,
            osType: osType,
            appVersion: appVersion,
            loginKey: loginKey,
        };

        console.log(sendData);
        /** 로그인 (loginKey)
         * @method POST
         * @param { deviceToken: push token, osType: os 종류, appVersion: 앱 버전, loginKey: 로그인 키 }
         * @return { rtnSts : 상태 (S: 성공, E: 실패), rtnMsg : 메시지, rtnUrl : 이동 url }
         */
        return await Api.mobile
            .post('api/login/loginKeyProc.do', sendData)
            .then((response) => {
                const { rtnSts, rtnMsg, rtnUrl } = response.data;

                console.log(response.data);

                if (rtnSts == 'S') {
                    store.dispatch(dispatchMultiple({ SET_WEBLINK: rtnUrl, SET_TOKEN: loginKey }));

                    return true;
                } else {
                    // TODO 계정 만료(비번 변경, 만료 등) 시
                    handleRtnMsg(rtnMsg);
                    if (!checkFlag) store.dispatch(dispatchLogin(false));
                    return false;
                }
            })
            .catch(async (err) => {
                Alert.alert('로그인에 실패했습니다.\n다시 시도해주세요.');
                if (isDev) store.dispatch(dispatchMultiple({ SET_WEBLINK: testUrl, SET_TOKEN: '91352089&2024-01-01' }));
                return isDev;
            })
            .finally(() => {
                store.dispatch(dispatchOne('SET_LOADING', false));
            });
    }
};

checkLogin.propTypes = {
    checkFlag: propTypes.bool, // pin 변경 시 loginKey 체크
};

/** 인증번호 전송
 * @return boolean
 */
export const sendSms = async (username) => {
    store.dispatch(dispatchOne('SET_LOADING', true));

    const encryptUsername = encrypt(username);
    const deviceToken = await getDeviceToken();
    const osType = await getOsType();
    const appVersion = getBuildVersion(osType);

    const sendData = {
        userId: encryptUsername,
        deviceToken: deviceToken,
        osType: osType,
        appVersion: appVersion,
    };

    if (checkIsTest()) {
        store.dispatch(dispatchOne('SET_LOADING', false));
        return true;
    } else {
        /** sms 인증(otp) 요청
         * @method POST
         * @param { userId : 로그인 사번 (AES256), deviceToken: push token, osType: os 종류, appVersion: 앱 버전 }
         * @return { rtnSts : 상태 (S: 성공, E: 실패), rtnMsg : 메시지 }
         */
        return await Api.mobile
            .post(`api/login/sendSmsOpt.do`, sendData)
            .then((response) => {
                const { rtnSts, rtnMsg } = response.data;

                if (rtnMsg && rtnMsg != '') okAlert(rtnMsg);
                return rtnSts == 'S';
            })
            .catch((error) => {
                Alert.alert(`인증번호 전송에 실패했습니다.\n다시 시도해주세요.`);
                return isDev;
            })
            .finally(() => {
                store.dispatch(dispatchOne('SET_LOADING', false));
            });
    }
};

sendSms.propTypes = {
    username: propTypes.string.isRequired, // 로그인 사번
};

/** 인증번호 확인
 * @return { status: boolean, token: string }
 */
export const checkSms = async (loginInfo) => {
    store.dispatch(dispatchOne('SET_LOADING', true));

    const encryptUsername = encrypt(loginInfo.username);
    const deviceToken = await getDeviceToken();
    const osType = await getOsType();
    const appVersion = getBuildVersion(osType);

    const sendData = {
        userId: encryptUsername,
        serial: String(loginInfo.otp) || '',
        deviceToken: deviceToken,
        osType: osType,
        appVersion: appVersion,
    };

    if (checkIsTest()) {
        store.dispatch(dispatchMultiple({ SET_WEBLINK: testUrl, SET_LOADING: false }));
        return { status: true, token: '91352089&2024-01-01' };
    } else {
        /** sms 인증(otp) 확인
         * @method POST
         * @param { userId : 로그인 사번 (AES256), serial: otp 인증번호, deviceToken: push token, osType: os 종류, appVersion: 앱 버전 }
         * @return { rtnSts : 상태 (S: 성공, E: 실패), rtnMsg : 메시지, rtnUrl : 이동 url, loginKey : 로그인 키 }
         */
        return await Api.mobile
            .post(`api/login/checkSmsAuth.do`, sendData)
            .then((response) => {
                const { rtnSts, rtnMsg, rtnUrl, loginKey } = response.data;

                console.log(loginKey);

                if (rtnSts == 'S') {
                    store.dispatch(dispatchOne('SET_WEBLINK', rtnUrl));

                    return { status: true, token: loginKey };
                } else {
                    handleRtnMsg(rtnMsg);

                    return { status: false, token: null };
                }
            })
            .catch((error) => {
                Alert.alert(`인증번호 확인에 실패했습니다.\n다시 시도해주세요.`);

                if (isDev) {
                    store.dispatch(dispatchOne('SET_WEBLINK', testUrl));
                    return { status: true, token: '91352089&2024-01-01' };
                }

                return { status: false, token: null };
            })
            .finally(() => {
                store.dispatch(dispatchOne('SET_LOADING', false));
            });
    }
};

checkSms.propTypes = {
    loginInfo: propTypes.object.isRequired, // { username: '', password: '', otp: '' }
};

/** QR 체크인 */
export const checkIn = async (params) => {
    store.dispatch(dispatchOne('SET_LOADING', true));

    if (checkIsTest()) {
        return { status: true, message: 'QR 체크인 pass' };
    } else {
        const loginKey = store.getState().loginReducer.loginKey;

        const sendData = {
            ...params,
            loginKey: loginKey,
        };

        /** 체크인 정보 전송
         * @method POST
         * @param { loginKey : 로그인 key, educId: 과정 ID, role: 체크인/체크아웃 구분 }
         * @returns { rtnSts : 상태 (S: 성공, E: 실패), rtnMsg : 메시지 }
         */
        return await Api.mobile
            .post(`api/common/qrChk.do`, sendData)
            .then((response) => {
                const { rtnSts, rtnMsg } = response.data;
                return { status: rtnSts == 'S', message: rtnMsg };
            })
            .catch((error) => {
                return { status: false, message: null };
            })
            .finally(() => {
                store.dispatch(dispatchOne('SET_LOADING', false));
            });
    }
};

checkIn.propTypes = {
    params: propTypes.object, // 전달할 값
};

// rtnMsg 처리
const handleRtnMsg = (message) => {
    if (message == null || message == '') message = '로그인에 실패했습니다.\n다시 시도해주세요.';
    okAlert(message);
};

handleRtnMsg.propTypes = {
    message: propTypes.string, // alert 메시지
};

// push token 값
const getDeviceToken = async () => {
    const storeDeviceToken = store.getState().loginReducer.deviceToken;

    if (storeDeviceToken == null) {
        return await getMessagingToken().then((deviceToken) => {
            console.log('---deviceToken---');
            console.log(deviceToken);
            store.dispatch(dispatchOne('SET_DEVICETOKEN', deviceToken));

            // if (profile == 'development' || profile == 'test') sendDeviceToken(deviceToken);

            return deviceToken;
        });
    }

    return storeDeviceToken;
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

// 빌드 버전
const getBuildVersion = (osType) => {
    if (osType == 'Android') return androidVersion;
    if (osType == 'IOS') return iosVersion;
    return null;
};

getBuildVersion.propTypes = {
    osType: propTypes.string, // os 타입 (Android, IOS)
};

// 개발 서버에 token 저장
const sendDeviceToken = (deviceToken) => {
    try {
        Api.test.post(`${process.env.EXPO_PUBLIC_TEST_API_URL}push`, { deviceToken: deviceToken });
    } catch (error) {
        console.log('[개발] device token 전송 오류');
    }
};

// token test
export const testToken = (deviceToken) => {
    store.dispatch(dispatchOne('SET_TEST', deviceToken));
    store.dispatch(dispatchOne('SET_TAB', 'test'));
};

//////////////////// test code /////////////////////////

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

    return Api.test
        .post('login', sendData)
        .then(({ status, data }) => {
            return { status: status == 200, token: data ? data.token : null };
        })
        .catch(async (err) => {
            console.log(err);
            store.dispatch(dispatchLogin(false));
            return { status: false };
        })
        .finally(() => {});
};

// test
export const loginTest = async (userid, pwd, url) => {
    return Api.mobile
        .post('loginProcAjax.do', { userid: userid, pwd: pwd, url: url })
        .then((response) => {
            const data = response.data;
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
            if (!checkFlag) store.dispatch(dispatchLogin(false));
            return { status: false };
        })
        .finally(() => {});
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

    const deviceInfo = {
        deviceType: Device.deviceType <= 6 ? deviceType[Device.deviceType] : 'UNKNOWN',
        brand: brand == null ? 'web' : brandType[brand.toLowerCase()],
        buildId: Device.osBuildId,
        osVersion: Device.osVersion,
        appVersion: Constants.expoConfig.version,
    };

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
