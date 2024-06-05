import { Alert } from 'react-native';
import axios from 'axios';
import { dispatchLogin, dispatchMultiple, dispatchOne } from 'utils/DispatchUtils';
import Api from './Api';
import * as ApiFetch from './ApiFetch';
import { getMessagingToken } from 'utils/PushFcm';
import { encrypt } from 'utils/CipherUtils';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

const { profile, isTest } = Constants.expoConfig.extra;
const { version } = Constants.expoConfig;

// const testUrl = 'https://naver.com';
// const testUrl = 'https://m.mail.naver.com/v2/read/0/6110';
const testUrl = '';
// const testUrl = 'https://aice.study/main';
// const testUrl =  'https://aice.study/info/aice';
// const testUrl = '/mobile/m/support/notice/noticeList.do';
// const testUrl =  'https://ktedu.kt.com/education/courseContents.do?classId=200034420_01';
// const testUrl = '192.168.50.254:8080/api/v1/file';
// const testUrl = '192.168.31.254:8080/file';

export const loginApiStore = (_store) => {
    store = _store;
};

let isDev = null;

const checkIsTest = () => {
    isDev = isDev || store.getState().commonReducer.isDev;
    return isTest && !isDev;
};

/** server check & app version check
 * @return boolean : true = 앱 업데이트 필요
 */
export const checkVersion = async () => {
    if (checkIsTest()) {
        return false;
    } else {
        const osType = await getOsType();

        /** 앱 버전 체크
         * @method GET
         * @param osType : os 종류
         * @param appVersion : 앱 버전
         * @return { rtnSts } : F: 기준정보 버전보다 낮거나 높음, T: 동일, E: 값 없음.
         */
        return await ApiFetch.get(`api/checkAppVersion.do?osType=${osType}&appVersion=${version}`)
            .then((response) => {
                const { rtnSts } = response;
                return rtnSts == 'F';
            })
            .catch((error) => {
                return false;
            });
    }
};

/** LDAP login
 * @param username string : 로그인 사번
 * @param password string : 로그인 비번
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

        console.log(sendData);

        /** 로그인 (LDAP)
         * @method POST
         * @param { userId : 로그인 사번 (AES256), pwd : 비밀번호 (AES256) }
         * @return { rtnSts : 상태 (S: 성공, E: 실패), rtnMsg : 메시지, rtnUrl : 이동 url }
         */
        return await ApiFetch.post('api/login/loginProc.do', JSON.stringify(sendData))
            .then((response) => {
                const { rtnSts, rtnMsg, rtnUrl } = response;

                if (rtnSts == 'S') {
                    store.dispatch(dispatchOne('SET_WEBLINK', rtnUrl));

                    return true;
                } else {
                    handleRtnMsg(rtnMsg);
                    store.dispatch(dispatchLogin(false, null));

                    return false;
                }
            })
            .catch(async (err) => {
                if (isDev) store.dispatch(dispatchMultiple({ SET_WEBLINK: testUrl, SET_LOADING: false }));
                return isDev;
            })
            .finally(() => {
                store.dispatch(dispatchOne('SET_LOADING', false));
            });
    }
};

/** 로그인 key 검증 (pin, bio)
 * @param checkFlag boolean : pin 변경 시 loginKey 체크
 * @return boolean
 *  */
export const checkLogin = async (checkFlag) => {
    if (!checkFlag) store.dispatch(dispatchOne('SET_LOADING', true));

    const deviceToken = await getDeviceToken();
    const osType = await getOsType();
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
            appVersion: version,
            loginKey: loginKey,
        };

        /** 로그인 (loginKey)
         * @method POST
         * @param { deviceToken: push token, osType: os 종류, appVersion: 앱 버전, loginKey: 로그인 키 }
         * @return { rtnSts : 상태 (S: 성공, E: 실패), rtnMsg : 메시지, rtnUrl : 이동 url }
         */
        return ApiFetch.post('api/login/loginKeyProc.do', JSON.stringify(sendData))
            .then((response) => {
                const { rtnSts, rtnMsg, rtnUrl } = response;

                if (rtnSts == 'S') {
                    store.dispatch(dispatchMultiple({ SET_WEBLINK: rtnUrl, SET_TOKEN: loginKey || null }));

                    return true;
                } else {
                    handleRtnMsg(rtnMsg);
                    if (!checkFlag) store.dispatch(dispatchLogin(false, null));
                    return false;
                }
            })
            .catch(async (err) => {
                console.log(err);
                if (isDev) store.dispatch(dispatchMultiple({ SET_WEBLINK: testUrl, SET_TOKEN: '91352089&2024-01-01', SET_LOADING: false }));
                return isDev;
            })
            .finally(() => {
                store.dispatch(dispatchOne('SET_LOADING', false));
            });
    }
};

/** 인증번호 전송
 * @param username string : 로그인 사번
 * @return boolean
 */
export const sendSms = async (username) => {
    const encryptUsername = encrypt(username);
    const deviceToken = await getDeviceToken();
    const osType = await getOsType();

    const sendData = {
        userId: encryptUsername,
        deviceToken: deviceToken,
        osType: osType,
        appVersion: version,
    };

    if (checkIsTest()) {
        return true;
    } else {
        /** sms 인증(otp) 요청
         * @method POST
         * @param { userId : 로그인 사번 (AES256), deviceToken: push token, osType: os 종류, appVersion: 앱 버전 }
         * @return { rtnSts : 상태 (S: 성공, E: 실패), rtnMsg : 메시지 }
         */
        return await ApiFetch.post(`api/login/sendSmsOpt.do`, JSON.stringify(sendData))
            .then((response) => {
                const { rtnSts, rtnMsg } = response;

                if (rtnSts == 'E') {
                    if (rtnMsg && rtnMsg != '') Alert.alert(JSON.stringify(rtnMsg));
                    return false;
                }

                return true;
            })
            .catch((error) => {
                Alert.alert(`인증번호 전송에 실패했습니다.\n다시 시도해주세요.`);
                return isDev;
            });
    }
};

/** 인증번호 확인
 * @param loginInfo { username: '', password: '', otp: '' }
 * @return { status: boolean, token: string }
 */
export const checkSms = async (loginInfo) => {
    const encryptUsername = encrypt(loginInfo.username);
    const deviceToken = await getDeviceToken();
    const osType = await getOsType();

    const sendData = {
        userId: encryptUsername,
        serial: String(loginInfo.otp) || '',
        deviceToken: deviceToken,
        osType: osType,
        appVersion: version,
    };

    if (checkIsTest()) {
        store.dispatch(dispatchOne('SET_WEBLINK', testUrl));
        return { status: true, token: '91352089&2024-01-01' };
    } else {
        /** sms 인증(otp) 확인
         * @method POST
         * @param { userId : 로그인 사번 (AES256), serial: otp 인증번호, deviceToken: push token, osType: os 종류, appVersion: 앱 버전 }
         * @return { rtnSts : 상태 (S: 성공, E: 실패), rtnMsg : 메시지, rtnUrl : 이동 url, loginKey : 로그인 키 }
         */
        return await ApiFetch.post(`api/login/checkSmsAuth.do`, JSON.stringify(sendData))
            .then((response) => {
                const { rtnSts, rtnMsg, rtnUrl, loginKey } = response;

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
            });
    }
};

/** QR 체크인
 * @param params : 전달할 값
 */
export const checkIn = async (params) => {
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
        return await ApiFetch.post(`api/common/qrChk.do`, JSON.stringify(sendData))
            .then((response) => {
                const { rtnSts, rtnMsg } = response;
                return { status: rtnSts == 'S', message: rtnMsg };
            })
            .catch((error) => {
                return { status: false, message: null };
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
    const storeDeviceToken = store.getState().loginReducer.deviceToken;

    if (storeDeviceToken == null) {
        return await getMessagingToken().then((deviceToken) => {
            console.log('---deviceToken---');
            console.log(deviceToken);
            store.dispatch(dispatchOne('SET_DEVICETOKEN', deviceToken));

            if (profile == 'development' || profile == 'test') sendDeviceToken(deviceToken);

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

// 개발 서버에 token 저장
const sendDeviceToken = (deviceToken) => {
    try {
        Api.test.post('push', { deviceToken: deviceToken });
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
