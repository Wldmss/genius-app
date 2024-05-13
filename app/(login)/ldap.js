import React, { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSelector } from 'react-redux';
import { commonInputStyles, commonTextStyles } from 'assets/styles';
import store from 'store/store';
import moment from 'moment';
import { dispatchLogin, dispatchMultiple, dispatchOne } from 'utils/DispatchUtils';
import * as StorageUtils from 'utils/StorageUtils';
import { FontText } from 'utils/TextUtils';
import { login } from 'api/LoginApi';
import LoginInfo from 'modal/LoginInfo';

/** LDAP 로그인 */
const LDAPLogin = () => {
    const jwt = useSelector((state) => state.loginReducer.jwt);

    const otpRef = useRef(null);
    const maxTime = 10;
    const [time, setTime] = useState(0);
    const [value, setValue] = useState({ username: '', password: '', otp: '' });
    const [isLogin, setIsLogin] = useState(false);
    const [token, setToken] = useState(null);

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
        login(value.username, value.password).then(({ status, token }) => {
            if (status) {
                setToken(token);
                setIsLogin(true);
            } else {
                resetUsers();
            }
        });
    };

    // OTP 전송 (TODO)
    const sendOTP = () => {
        Alert.alert('인증번호가 전송되었습니다.');

        if (otpRef.current) otpRef.current.focus();

        setTime(maxTime);
    };

    // OTP 검증
    const checkOTP = () => {
        // 인증번호 확인 로직 추가
        if (value.otp == '') {
            Alert.alert('인증번호가 일치하지 않습니다.');
            return;
        }

        setTime(0);
        saveUserData(true);
        // checkUsers();
    };

    // 사용자 정보 확인 (로그아웃이 가능하다면 saveUserData() 대신 사용)
    const checkUsers = () => {
        if (jwt != null && jwt !== value.username) {
            Alert.alert(
                process.env.EXPO_PUBLIC_NAME,
                `기본 로그인 정보를 "${value.username}" 으로 변경하시겠습니까?`,
                [
                    {
                        text: '아니요',
                        onPress: async () => {
                            resetUsers();
                            saveUserData();
                        },
                        style: 'cancel',
                    },
                    {
                        text: '예',
                        onPress: async () => {
                            saveUserData(true);
                        },
                    },
                ],
                { cancelable: false }
            );
        } else {
            saveUserData(jwt == null);
        }
    };

    // 사용자 정보 저장
    const saveUserData = async (changeFlag) => {
        if (changeFlag) {
            await StorageUtils.setDeviceData('jwt', token);
        }

        let storeData = {
            SET_JWT: token,
            SET_TOKEN: token,
        };

        store.dispatch(dispatchMultiple(storeData));
        store.dispatch(dispatchLogin(true, moment()));
        store.dispatch(dispatchOne('SET_TAB', 'web'));
    };

    const showInfo = () => {
        store.dispatch({ type: 'OPEN_MODAL', element: <LoginInfo />, title: '문의 및 연락처' });
    };

    // user 정보 reset
    const resetUsers = async () => {
        await StorageUtils.setDeviceData('jwt', null);
    };

    // 인증 번호 남은 시간 timer
    useEffect(() => {
        if (time > 0) {
            interval = setInterval(() => {
                setTime((prevTime) => {
                    if (prevTime == 0) {
                        clearInterval(interval);
                        Alert.alert('인증 시간이 초과되었습니다.');
                        return prevTime;
                    }

                    console.log(prevTime - 1);

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
                        style={[commonTextStyles.fonts, commonInputStyles.inputText]}
                        onChangeText={(input) => changeValue('username', input)}
                    />
                    <TextInput
                        id="password"
                        value={value.password}
                        placeholder="비밀번호를 입력하세요."
                        placeholderTextColor={`#a9a9a9`}
                        secureTextEntry
                        style={[commonTextStyles.fonts, commonInputStyles.inputText]}
                        onChangeText={(input) => changeValue('password', input)}
                    />
                </View>
                <Pressable style={[isLogin ? commonInputStyles.buttonGray : commonInputStyles.buttonRed]} onPress={doLogin}>
                    <FontText style={commonTextStyles.white}>로그인</FontText>
                </Pressable>
            </View>

            {isLogin && (
                <View style={styles.inputBox}>
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
                    <Pressable style={commonInputStyles.buttonRed} onPress={checkOTP}>
                        <FontText style={commonTextStyles.white}>인증번호 확인</FontText>
                    </Pressable>
                </View>
            )}

            <View style={styles.infoBox}>
                <FontText style={styles.desc}>{`* 로그인 아이디, 비밀번호는\nKATE/KTalk 아이디(사번), 비밀번호와 동일합니다.`}</FontText>
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
        color: `#222`,
        fontSize: 12,
    },
    restTime: {
        flexDirection: `row`,
        gap: 3,
    },
});

export default LDAPLogin;
