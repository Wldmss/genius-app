import React, { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { commonInputStyles, commonTextStyles } from 'assets/styles';
import { ldapLogin } from 'api/LoginApi';
import { useSelector } from 'react-redux';
import store from 'store/store';
import { dispatchMultiple, dispatchOne } from 'utils/DispatchUtils';
import * as StorageUtils from 'utils/StorageUtils';
import * as NavigateUtils from 'utils/NavigateUtils';
import LoginInfo from 'modal/LoginInfo';

/** LDAP 로그인 */
const LDAPLogin = () => {
    const pin = useSelector((state) => state.loginReducer.pin);

    const otpRef = useRef(null);
    const timeRef = useRef(0);
    const [value, setValue] = useState({ username: '', password: '', otp: '' });
    const [isLogin, setIsLogin] = useState(false);

    const changeValue = (id, input) => {
        setValue({ ...value, [id]: input });
    };

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

    const sendLDAP = () => {
        console.log(value);

        setIsLogin(true);
        sendOTP();

        // LDAP 로그인 TODO
        ldapLogin(value.username, value.password).then((res) => {
            if (res.status) {
                setIsLogin(true);
                sendOTP();
            } else {
                Alert.alert('로그인에 실패했습니다.');
            }
        });
    };

    // OTP 전송 (TODO)
    const sendOTP = () => {
        if (otpRef.current) otpRef.current.focus();
    };

    const checkOTP = () => {
        console.log(value.otp);

        // 인증번호 확인 로직 추가
        if (value.otp == '') {
            Alert.alert('인증번호가 일치하지 않습니다.');
            return;
        }

        saveUserData();
    };

    const saveUserData = async () => {
        await StorageUtils.setDeviceData('users', value.username);

        let storeData = {
            SET_USERS: value.username,
        };

        // if (!pin.isRegistered) {
        //     storeData['SET_PIN'] = { ...pin, modFlag: true };
        // }

        store.dispatch(dispatchMultiple(storeData));
        store.dispatch(dispatchOne('SET_TOKEN', {}));
        store.dispatch(NavigateUtils.routeDispatch('web'));
    };

    const showInfo = () => {
        store.dispatch({ type: 'OPEN_MODAL', element: <LoginInfo />, title: '문의 및 연락처' });
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
                        style={commonInputStyles.inputText}
                        onChangeText={(input) => changeValue('username', input)}
                    />
                    <TextInput
                        id="password"
                        value={value.password}
                        placeholder="비밀번호를 입력하세요."
                        placeholderTextColor={`#a9a9a9`}
                        secureTextEntry
                        style={commonInputStyles.inputText}
                        onChangeText={(input) => changeValue('password', input)}
                    />
                </View>
                <Pressable style={commonInputStyles.buttonRed} onPress={doLogin}>
                    <Text style={commonTextStyles.white}>로그인</Text>
                </Pressable>
            </View>

            {isLogin && (
                <View style={styles.inputBox}>
                    <View style={styles.inputBox}>
                        <TextInput
                            id="otp"
                            ref={otpRef}
                            value={value.otp}
                            placeholder="인증번호를 입력하세요."
                            placeholderTextColor={`#a9a9a9`}
                            style={commonInputStyles.inputText}
                            onChangeText={(input) => changeValue('otp', input)}
                        />
                        <Text>{`남은시간 : ${timeRef.current}초`}</Text>
                    </View>
                    <Pressable style={commonInputStyles.buttonRed} onPress={checkOTP}>
                        <Text style={commonTextStyles.white}>인증번호 확인</Text>
                    </Pressable>
                </View>
            )}

            <View style={styles.infoBox}>
                <Text style={styles.desc}>{`로그인 아이디, 비밀번호는\nKATE/KTalk 아이디(사번), 비밀번호와\n동일합니다.`}</Text>
                <Pressable style={styles.infoButton} onPress={showInfo}>
                    <Text style={styles.infoText}>문의 및 연락처</Text>
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
    },
    inputBox: {
        gap: 12,
    },
    infoBox: {
        gap: 10,
        alignItems: `center`,
    },
    desc: {
        fontSize: 12,
        textAlign: `center`,
    },
    infoButton: {
        borderWidth: 1,
        borderColor: `#ccc`,
        paddingHorizontal: 15,
        paddingVertical: 5,
        height: 30,
        lineHeight: 22,
        borderRadius: 4,
    },
    infoText: {
        textAlign: `center`,
        color: `#222`,
        fontSize: 12,
    },
});

export default LDAPLogin;
