import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, Alert } from 'react-native';
import { commonInputStyles, commonTextStyles } from 'assets/styles';
import { useSelector } from 'react-redux';
import store from 'store/store';
import { dispatchOne } from 'utils/DispatchUtils';
import * as StorageUtils from 'utils/StorageUtils';

const PinLogin = () => {
    const pin = useSelector((state) => state.loginReducer.pin);
    const users = useSelector((state) => state.loginReducer.users);
    const token = useSelector((state) => state.loginReducer.token);

    const pinLength = 6;
    const enterRef = useRef(null);
    const checkRef = useRef(null);
    const registRef = useRef(0);

    const [value, setValue] = useState({ enter: '', check: '' });
    const [isSame, setIsSame] = useState(null);
    const [isLogin, setIsLogin] = useState(false);

    const changePin = (id, input) => {
        // 숫자가 아닌 경우 return
        if (isNaN(input)) {
            Alert.alert('숫자를 입력해주세요.');
            return;
        }

        setValue({ ...value, [id]: input });

        // pin 등록 시 일치여부 확인
        if (pin?.modFlag) {
            const otherId = id == 'enter' ? 'check' : 'enter';
            let sameFlag = null;
            if (value[otherId].length == pinLength && input) {
                sameFlag = checkSame(value[otherId], input);
            }

            setIsSame(sameFlag);
        }

        // pin 입력 시 자동 설정
        if (id == 'enter' && input.length == pinLength) {
            if (pin?.modFlag) {
                if (checkRef.current) {
                    checkRef.current.focus();
                    return;
                }
            } else {
                registRef.current = registRef.current + 1;
                return;
            }
        }
    };

    // 일치 여부 확인
    const checkSame = (value1, value2) => {
        return Number(value1) == Number(value2);
    };

    // pin 설정
    const handlePinButton = () => {
        if (value.enter.length != pinLength || (pin?.modFlag && value.check.length != pinLength)) {
            Alert.alert(`${pinLength}자리를 입력해주세요.`);
            return false;
        }

        const sameFlag = !pin?.modFlag || checkSame(value.enter, value.check);
        if (!sameFlag) {
            Alert.alert('PIN이 일치하지 않습니다.');
            return false;
        }

        if (!pin?.modFlag) {
            // 로그인
            loginPin();
        } else {
            // PIN 등록
            registPin();
        }

        registRef.current = 0;
    };

    // PIN 로그인
    const loginPin = () => {
        if (pin.value != null && checkSame(value.enter, pin.value)) {
            if (users == null) {
                // pin 만 설정하고 LDAP 로그인을 안한 경우
                store.dispatch(dispatchOne('SET_TAB', 'ldap'));
            } else {
                // LDAP 서버 인증 (TODO)
                checkLdap();
            }
        } else {
            enterRef.current.focus();
            Alert.alert('PIN이 일치하지 않습니다. 다시 시도해주세요.');
            setIsLogin(false);
        }
    };

    // LDAP 인증
    const checkLdap = () => {
        store.dispatch(dispatchOne('SET_TOKEN', {}));
        setIsLogin(true);
    };

    // PIN 등록
    const registPin = async () => {
        try {
            const tabValue = pin.isRegistered ? 'pin' : 'ldap'; // PIN 변경인 경우 PIN 로그인 으로

            await StorageUtils.setDeviceData('pin', value.enter);
            store.dispatch(dispatchOne('SET_PIN', { ...pin, isRegistered: true, value: value.enter, modFlag: false }));

            Alert.alert('PIN이 설정되었습니다.');

            store.dispatch(dispatchOne('SET_TAB', tabValue));
        } catch (err) {
            console.log(err);
        }
    };

    // 로그인 trigger
    useEffect(() => {
        if (registRef.current > 0) handlePinButton();
    }, [registRef.current]);

    useEffect(() => {
        if (isLogin) {
            const tabValue = token == null ? 'ldap' : 'web';
            store.dispatch(dispatchOne('SET_TAB', tabValue));
        }
    }, [isLogin]);

    useEffect(() => {
        setValue({ ...value, enter: '', check: '' });
    }, [pin]);

    return (
        <View style={styles.container} id="pin">
            <View style={styles.inputBox}>
                <TextInput
                    id="enter"
                    ref={enterRef}
                    value={value.enter}
                    inputMode="numeric"
                    maxLength={pinLength}
                    placeholder="PIN 입력"
                    placeholderTextColor={`#a9a9a9`}
                    secureTextEntry
                    style={commonInputStyles.inputNumber}
                    onChangeText={(input) => changePin('enter', input)}
                />
                {pin?.modFlag && (
                    <>
                        <TextInput
                            id="check"
                            ref={checkRef}
                            value={value.check}
                            inputMode="numeric"
                            maxLength={pinLength}
                            placeholder="PIN 입력 확인"
                            placeholderTextColor={`#a9a9a9`}
                            secureTextEntry
                            style={commonInputStyles.inputNumber}
                            onChangeText={(input) => changePin('check', input)}
                        />
                        <Text style={isSame != null ? (isSame ? commonTextStyles.success : commonTextStyles.warning) : ''}>
                            {isSame != null ? (isSame ? `일치합니다.` : `일치하지 않습니다.`) : ''}
                        </Text>
                    </>
                )}
            </View>
            <Pressable style={commonInputStyles.buttonRed} onPress={handlePinButton}>
                <Text style={commonTextStyles.white}>{pin?.modFlag ? 'PIN 설정' : '로그인 하기'}</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 20,
    },
    inputBox: {
        gap: 12,
    },
});

export default PinLogin;
