import React, { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSelector } from 'react-redux';
import { commonInputStyles, commonTextStyles } from 'assets/styles';
import { dispatchLogin, dispatchMultiple, dispatchOne } from 'utils/DispatchUtils';
import * as StorageUtils from 'utils/StorageUtils';
import { FontDefault, FontText } from 'utils/TextUtils';
import { checkSms, login, sendSms } from 'api/LoginApi';
import LoginInfo from 'modal/LoginInfo';
import { okAlert } from 'utils/AlertUtils';
import * as Clipboard from 'expo-clipboard';

/** LDAP 로그인 */
const LDAPLogin = () => {
    const loginKey = useSelector((state) => state.loginReducer.loginKey);

    const otpRef = useRef(null);
    const maxTime = 180;
    const [time, setTime] = useState(0);
    const [value, setValue] = useState({ username: '', password: '', otp: '' });
    const [isLogin, setIsLogin] = useState(false);
    const [showOtp, setShowOtp] = useState(false);

    let interval = null;

    const changeValue = (id, input) => {
        setValue({ ...value, [id]: input });
    };

    // 로그인 하기
    const doLogin = () => {
        if (value.username == '') {
            Alert.alert('아이디를 입력해주세요.');
            return;
        }
        if (value.password == '') {
            Alert.alert('비밀번호를 입력해주세요.');
            return;
        }

        sendLDAP();
    };

    // LDAP 인증
    const sendLDAP = () => {
        // LDAP 로그인
        login(value.username, value.password).then((response) => {
            if (response) {
                setIsLogin(true);
            } else {
                resetUsers();
            }
        });
    };

    // OTP 전송
    const sendOTP = async () => {
        const restContents = await Clipboard.getStringAsync();

        sendSms(value.username).then((response) => {
            if (response) {
                setShowOtp(true);
                setValue({ ...value, otp: '' });

                if (otpRef.current) otpRef.current.focus();
                setTime(maxTime);

                readOTP(restContents);
            }
        });
    };

    // OTP 읽기 : sms 복사 => ios : 지원, android : 미지원, 클립보드에 복사한 경우 읽어오기 가능
    const readOTP = async (restContents) => {
        return new Promise((resolve) => {
            setTimeout(async () => {
                const contents = await Clipboard.getStringAsync();
                if (contents != '' && restContents != contents) {
                    const otpRegex = /(\d{4,6})/;
                    const otpMatch = contents.match(otpRegex);
                    if (otpMatch) setValue({ ...value, otp: contents });
                }
                resolve(contents);
            }, 5000);
        });
    };

    // OTP 검증
    const checkOTP = async () => {
        if (time <= 0) {
            okAlert('SMS 인증번호 입력 대기시간이 3분을 초과했습니다.\n인증번호를 다시 요청해 주시기 바랍니다.', null);
            return;
        }

        if (value.otp == '') {
            Alert.alert('인증번호를 입력해주세요.');
            return;
        }

        await checkSms(value).then((response) => {
            if (response.status) {
                Alert.alert(
                    process.env.EXPO_PUBLIC_NAME,
                    `인증되었습니다.`,
                    [
                        {
                            text: '확인',
                            onPress: () => {
                                saveUserData(true, response.token);
                                // checkUsers(response.token);
                                setTime(0);
                            },
                        },
                    ],
                    { cancelable: false }
                );
            }
        });
    };

    // 사용자 정보 저장
    const saveUserData = async (changeFlag, token) => {
        if (changeFlag) {
            await StorageUtils.setDeviceData('loginKey', token);
        }

        let storeData = {
            SET_LOGINKEY: token,
            SET_TOKEN: token,
        };

        store.dispatch(dispatchMultiple(storeData));
        store.dispatch(dispatchLogin(true));
        store.dispatch(dispatchOne('SET_TAB', 'web'));
    };

    // 사용자 정보 확인 (로그아웃이 가능하다면 saveUserData() 대신 사용)
    const checkUsers = (token) => {
        if (loginKey != null && loginKey !== token) {
            Alert.alert(
                process.env.EXPO_PUBLIC_NAME,
                `기본 로그인 정보를 "${value.username}" 으로 변경하시겠습니까?`,
                [
                    {
                        text: '아니요',
                        onPress: () => {
                            resetUsers();
                            saveUserData(false);
                        },
                        style: 'cancel',
                    },
                    {
                        text: '예',
                        onPress: () => {
                            saveUserData(true, token);
                        },
                    },
                ],
                { cancelable: false }
            );
        } else {
            saveUserData(loginKey == null, token);
        }
    };

    // 문의 및 연락처 modal
    const showInfo = () => {
        store.dispatch({ type: 'OPEN_MODAL', element: <LoginInfo />, title: '문의 및 연락처' });
    };

    // user 정보 reset
    const resetUsers = async () => {
        await StorageUtils.setDeviceData('loginKey', null);
    };

    // 인증 번호 남은 시간 timer
    useEffect(() => {
        if (time > 0) {
            interval = setInterval(() => {
                setTime((prevTime) => {
                    if (prevTime == 0) {
                        clearInterval(interval);
                        okAlert('SMS 인증번호 입력 대기시간이 3분을 초과했습니다.\n인증번호를 다시 요청해 주시기 바랍니다.', null);
                        return prevTime;
                    }

                    return prevTime - 1;
                });
            }, 1000);

            return () => clearInterval(interval);
        } else {
            clearInterval(interval);
        }
    }, [time]);

    useEffect(() => {
        if (isLogin) sendOTP();
    }, [isLogin]);

    return (
        <View style={styles.container}>
            <View style={styles.loginBox}>
                <View style={styles.inputBox}>
                    <TextInput
                        id="username"
                        value={value.username}
                        placeholder="아이디를 입력하세요."
                        placeholderTextColor={`#a9a9a9`}
                        readOnly={showOtp}
                        style={[commonTextStyles.fonts, commonInputStyles.inputText]}
                        onChangeText={(input) => changeValue('username', input)}
                    />
                    <TextInput
                        id="password"
                        value={value.password}
                        placeholder="비밀번호를 입력하세요."
                        placeholderTextColor={`#a9a9a9`}
                        readOnly={showOtp}
                        secureTextEntry
                        style={[commonTextStyles.fonts, commonInputStyles.inputText]}
                        onChangeText={(input) => changeValue('password', input)}
                    />
                </View>
                <Pressable style={[showOtp ? commonInputStyles.buttonDisable : commonInputStyles.buttonRed]} onPress={doLogin}>
                    <FontText style={commonTextStyles.white}>로그인</FontText>
                </Pressable>
            </View>

            {showOtp && (
                <View style={styles.inputBox}>
                    <Pressable style={[commonInputStyles.buttonGray, styles.otpRetry]} onPress={sendOTP}>
                        <FontText style={commonTextStyles.white}>인증번호 재전송</FontText>
                    </Pressable>
                    <View style={styles.otpBox}>
                        <TextInput
                            id="otp"
                            ref={otpRef}
                            value={value.otp}
                            placeholder="인증번호를 입력하세요."
                            placeholderTextColor={`#a9a9a9`}
                            style={[commonTextStyles.fonts, commonInputStyles.inputText]}
                            onChangeText={(input) => changeValue('otp', input)}
                        />
                        <View style={styles.restTime}>
                            <FontText>남은시간 :</FontText>
                            <FontText style={commonTextStyles.bold}>{time}</FontText>
                            <FontText>초</FontText>
                        </View>
                    </View>
                    <Pressable style={[time > 0 ? commonInputStyles.buttonRed : commonInputStyles.buttonDisable]} onPress={checkOTP}>
                        <FontText style={commonTextStyles.white}>인증번호 확인</FontText>
                    </Pressable>
                </View>
            )}

            <View style={styles.infoBox}>
                <FontDefault style={styles.desc}>{`* 로그인 아이디, 비밀번호는\nKATE/KTalk 아이디(사번), 비밀번호와 동일합니다.`}</FontDefault>
                <Pressable style={styles.infoButton} onPress={showInfo}>
                    <FontText style={styles.infoText}>문의 및 연락처</FontText>
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 20,
    },
    loginBox: {
        gap: 20,
        alignItems: `center`,
    },
    inputBox: {
        gap: 12,
        alignItems: `center`,
    },
    otpBox: {
        gap: 12,
    },
    otpRetry: {
        width: 176,
        height: 36,
    },
    infoBox: {
        gap: 10,
        alignItems: `center`,
    },
    desc: {
        fontSize: 11,
        textAlign: `center`,
        color: `#666666`,
    },
    infoButton: {
        borderWidth: 1,
        borderColor: `#ccc`,
        paddingHorizontal: 15,
        paddingVertical: 4,
        height: 30,
        lineHeight: 22,
        borderRadius: 4,
    },
    infoText: {
        textAlign: `center`,
        textAlignVertical: `center`,
        color: `#222`,
        fontSize: 12,
    },
    restTime: {
        flexDirection: `row`,
        gap: 3,
    },
});

export default LDAPLogin;
