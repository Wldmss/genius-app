import React, { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { commonInputStyles, commonTextStyles } from 'assets/styles';
import { checkPushToken, login } from 'api/LoginApi';
import { useSelector } from 'react-redux';
import store from 'store/store';
import { dispatchLogin, dispatchMultiple, dispatchOne } from 'utils/DispatchUtils';
import * as StorageUtils from 'utils/StorageUtils';
import LoginInfo from 'modal/LoginInfo';
import moment from 'moment';

/** LDAP 로그인 */
const LDAPLogin = () => {
    const users = useSelector((state) => state.loginReducer.users);
    const notification = useSelector((state) => state.commonReducer.notification);

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

        // LDAP 로그인 TODO
        login(value.username, value.password, notification).then((res) => {
            if (res.status) {
                setToken(res.data ? res.data.token : null);
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

        checkUsers();
    };

    // 사용자 정보 확인
    const checkUsers = () => {
        if (users != null && users !== value.username) {
            Alert.alert(
                'GENIUS',
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
        if (changeFlag) {
            await StorageUtils.setDeviceData('users', value.username);
        }

        let storeData = {
            SET_USERS: value.username,
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
        // store.dispatch(dispatchOne('SET_USERS', null));
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
