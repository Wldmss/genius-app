import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, TextInput, Pressable, Alert } from 'react-native';
import { commonInputStyles, commonTextStyles } from 'assets/styles';
import { useSelector } from 'react-redux';
import store from 'store/store';
import { dispatchLogin, dispatchOne } from 'utils/DispatchUtils';
import * as StorageUtils from 'utils/StorageUtils';
import moment from 'moment';
import { FontText } from 'utils/TextUtils';

/** pin 로그인/등록/수정 */
const PinLogin = () => {
    const pin = useSelector((state) => state.loginReducer.pin);

    const pinLength = 6;
    const originRef = useRef(null);
    const enterRef = useRef(null);
    const checkRef = useRef(null);
    const registRef = useRef(0);

    const [isMod, setIsMod] = useState(false);
    const [value, setValue] = useState({ enter: '', check: '', origin: '' });
    const [isSame, setIsSame] = useState(null);

    const changePin = (id, input) => {
        // 숫자가 아닌 경우 return
        if (isNaN(input)) {
            Alert.alert('숫자를 입력해주세요.');
            return;
        }

        setValue({ ...value, [id]: input });

        // pin 등록 시 일치여부 확인
        if (pin?.modFlag && id != 'origin') {
            const otherId = id == 'enter' ? 'check' : 'enter';
            let sameFlag = null;
            if (value[otherId].length == pinLength && input.length == pinLength && input) {
                sameFlag = checkSame(value[otherId], input);
            } else {
                sameFlag = null;
            }

            setIsSame(sameFlag);

            if (sameFlag && id == 'check') {
                registRef.current = registRef.current + 1;
                return;
            }
        }

        // 현재 pin 입력 시 자동 설정
        if (isMod && id == 'origin' && input.length == pinLength && enterRef.current) {
            enterRef.current.focus();
            return;
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
        return String(value1).length == String(value2).length && Number(value1) == Number(value2);
    };

    // pin 설정
    const handlePinButton = () => {
        if (value.enter.length != pinLength || (pin?.modFlag && value.check.length != pinLength) || (isMod && value.origin.length != pinLength)) {
            Alert.alert(`${pinLength}자리를 입력해주세요.`);
            return false;
        }

        // pin 수정
        if (isMod && !checkSame(pin?.value, value.origin)) {
            Alert.alert('현재 PIN이 일치하지 않습니다.');
            originRef.current.focus();
            return false;
        }

        const sameFlag = !pin?.modFlag || checkSame(value.enter, value.check);
        if (!sameFlag) {
            Alert.alert('PIN이 일치하지 않습니다.');
            return false;
        }

        if (isMod && checkSame(value.enter, value.origin)) {
            Alert.alert('PIN이 동일합니다. 다른 PIN으로 설정해주세요.');
            enterRef.current.focus();
            return false;
        }

        if (pin?.modFlag && confirmPin()) {
            Alert.alert('안전한 PIN을 설정해주세요.');
            setValue({ ...value, enter: '', check: '' });
            setIsSame(null);
            enterRef.current.focus();
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
            store.dispatch(dispatchLogin(moment()));
        } else {
            enterRef.current.focus();
            Alert.alert('PIN이 일치하지 않습니다. 다시 시도해주세요.');
        }
    };

    // PIN 등록
    const registPin = async () => {
        try {
            const tabValue = pin.isRegistered ? 'pin' : 'ldap'; // PIN 변경인 경우 PIN 로그인 으로

            await StorageUtils.setDeviceData('pin', value.enter);
            store.dispatch(dispatchOne('SET_PIN', { ...pin, isRegistered: true, value: value.enter, modFlag: false }));

            Alert.alert(`PIN이 ${isMod ? '변경' : '설정'}되었습니다.`);

            store.dispatch(dispatchOne('SET_TAB', tabValue));
        } catch (err) {
            console.log(err);
        }
    };

    // PIN 검사
    const confirmPin = () => {
        const checkPin = value.enter;

        // 연속된 숫자 확인
        let isSequential = true;
        for (let i = 0; i < checkPin.length - 1; i++) {
            const currentDigit = parseInt(checkPin[i]);
            const nextDigit = parseInt(checkPin[i + 1]);
            if (nextDigit !== currentDigit + 1) {
                isSequential = false; // 연속된 숫자가 아님
            }
        }

        // 동일한 숫자 확인
        const passPattern = /^(?!(\d)\1{5}$)\d{6}$/;

        return isSequential || !passPattern.test(checkPin);
    };

    // 로그인 trigger
    useEffect(() => {
        if (registRef.current > 0) handlePinButton();
    }, [registRef.current]);

    useEffect(() => {
        setValue({ ...value, enter: '', check: '' });
        setIsMod(pin?.isRegistered && pin?.modFlag);
    }, [pin]);

    return (
        <View style={styles.container} id="pin">
            <View style={styles.inputBox}>
                {isMod && (
                    <TextInput
                        id="origin"
                        ref={originRef}
                        value={value.origin}
                        inputMode="numeric"
                        maxLength={pinLength}
                        placeholder="현재 PIN 입력"
                        placeholderTextColor={`#a9a9a9`}
                        secureTextEntry
                        style={[commonTextStyles.fonts, commonInputStyles.inputNumber, value.origin.length > 0 ? styles.spacing : '']}
                        onChangeText={(input) => changePin('origin', input)}
                    />
                )}
                <TextInput
                    id="enter"
                    ref={enterRef}
                    value={value.enter}
                    inputMode="numeric"
                    maxLength={pinLength}
                    placeholder={`${isMod ? '새로운 ' : ''}PIN 입력`}
                    placeholderTextColor={`#a9a9a9`}
                    secureTextEntry
                    style={[commonTextStyles.fonts, commonInputStyles.inputNumber, value.enter.length > 0 ? styles.spacing : '']}
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
                            style={[commonTextStyles.fonts, commonInputStyles.inputNumber, value.check.length > 0 ? styles.spacing : '']}
                            onChangeText={(input) => changePin('check', input)}
                        />
                        {isSame != null && (
                            <FontText style={isSame != null ? (isSame ? commonTextStyles.success : commonTextStyles.warning) : ''}>
                                {isSame != null ? (isSame ? `일치합니다` : `일치하지 않습니다`) : ''}
                            </FontText>
                        )}
                    </>
                )}
            </View>
            <Pressable style={commonInputStyles.buttonRed} onPress={handlePinButton}>
                <FontText style={commonTextStyles.white}>{pin?.modFlag ? 'PIN 설정' : '로그인'}</FontText>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 15,
    },
    inputBox: {
        gap: 12,
    },
    spacing: {
        letterSpacing: 5,
    },
});

export default PinLogin;
