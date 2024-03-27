import React, { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { commonInputStyles, commonTextStyles } from 'assets/styles';
import { checkPushToken, login } from 'api/LoginApi';
import { useSelector } from 'react-redux';
import store from 'store/store';
import { dispatchLogin, dispatchMultiple, dispatchOne } from 'utils/DispatchUtils';
import * as StorageUtils from 'utils/StorageUtils';
import LoginInfo from 'modal/LoginInfo';
import moment from 'moment';
import { FontText } from 'utils/TextUtils';

const { EXPO_PUBLIC_NAME } = process.env;

/** LDAP 로그인 */
const LDAPLogin = () => {
    const users = useSelector((state) => state.loginReducer.users);

    const otpRef = useRef(null);
    const timeRef = useRef(0);
    const [value, setValue] = useState({ username: '', password: '', otp: '' });
    const [isLogin, setIsLogin] = useState(false);
    const [token, setToken] = useState(null);

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
        console.log(value);

        // LDAP 로그인
        login(value.username, value.password).then(({ status, data }) => {
            if (status) {
                setToken(data ? data.token : null);
                setIsLogin(true);
            } else {
                resetUsers();
                Alert.alert('로그인에 실패했습니다.');
            }
        });
    };

    // OTP 전송 (TODO)
    const sendOTP = () => {
        Alert.alert('인증번호가 전송되었습니다.');
        console.log('otp send!!');
        if (otpRef.current) otpRef.current.focus();
    };

    // OTP 검증
    const checkOTP = () => {
        console.log(value.otp);

        // 인증번호 확인 로직 추가
        if (value.otp == '') {
            Alert.alert('인증번호가 일치하지 않습니다.');
            return;
        }

        saveUserData(true);
        // checkUsers();
    };

    // 사용자 정보 확인
    const checkUsers = () => {
        if (users != null && users !== value.username) {
            Alert.alert(
                EXPO_PUBLIC_NAME,
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
            saveUserData(users == null);
        }
    };

    // 사용자 정보 저장
    const saveUserData = async (changeFlag) => {
        console.log(token);
        if (changeFlag) {
            await StorageUtils.setDeviceData('users', token);
        }

        let storeData = {
            SET_USERS: token,
            SET_TOKEN: token,
        };

        store.dispatch(dispatchMultiple(storeData));
        store.dispatch(dispatchLogin(moment()));
        store.dispatch(dispatchOne('SET_TAB', 'web'));
        checkPushToken();
    };

    const showInfo = () => {
        store.dispatch({ type: 'OPEN_MODAL', element: <LoginInfo />, title: '문의 및 연락처' });
    };

    // user 정보 reset
    const resetUsers = async () => {
        await StorageUtils.setDeviceData('users', null);
    };

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
                            <FontText style={commonTextStyles.bold}>{timeRef.current}</FontText>
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
