import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, TextInput, Pressable, Alert, Keyboard } from 'react-native';
import { commonInputStyles, commonTextStyles } from 'assets/styles';
import { useSelector } from 'react-redux';
import store from 'store/store';
import { dispatchLogin, dispatchMultiple, dispatchOne } from 'utils/DispatchUtils';
import * as StorageUtils from 'utils/StorageUtils';
import moment from 'moment';
import { FontText } from 'utils/TextUtils';
import { checkLogin } from 'api/LoginApi';

/** pin 로그인/등록/수정 */
const PinLogin = () => {
    const pin = useSelector((state) => state.loginReducer.pin);
    const webPinFlag = useSelector((state) => state.loginReducer.webPinFlag);

    const pinLength = 6;
    const pinCount = 5;
    const resetCount = useRef(pinCount);
    const originRef = useRef(null);
    const enterRef = useRef(null);
    const checkRef = useRef(null);
    const registRef = useRef(0);

    const [isMod, setIsMod] = useState(false);
    const [value, setValue] = useState({ enter: '', check: '', origin: '' });
    const [isSame, setIsSame] = useState(null);
    const [message, setMessage] = useState({ alertFlag: true, text: null });

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

            setMessage({
                ...message,
                text: sameFlag == null ? null : sameFlag ? '일치합니다.' : '일치하지 않습니다.',
                alertFlag: sameFlag != null && !sameFlag,
            });

            if (sameFlag && id == 'check') {
                Keyboard.dismiss();
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
                Keyboard.dismiss();
                // registRef.current = registRef.current + 1;
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
        Keyboard.dismiss();

        if (
            isMod &&
            (value.enter.length != pinLength || (pin?.modFlag && value.check.length != pinLength) || (isMod && value.origin.length != pinLength))
        ) {
            // Alert.alert(`${pinLength}자리를 입력해주세요.`);
            setMessage({ ...message, alertFlag: true, text: `${pinLength}자리를 입력해주세요.` });
            return false;
        }

        // pin 수정
        if (isMod && !checkSame(pin?.value, value.origin)) {
            // Alert.alert('현재 PIN이 일치하지 않습니다.');
            setMessage({ ...message, alertFlag: true, text: '현재 PIN이 일치하지 않습니다.' });
            originRef.current.focus();
            return false;
        }

        const sameFlag = !pin?.modFlag || checkSame(value.enter, value.check);
        if (!sameFlag) {
            // Alert.alert('PIN이 일치하지 않습니다.');
            setMessage({ ...message, alertFlag: true, text: 'PIN이 일치하지 않습니다.' });
            return false;
        }

        if (isMod && checkSame(value.enter, value.origin)) {
            // Alert.alert('PIN이 동일합니다. 다른 PIN으로 설정해주세요.');
            setMessage({ ...message, alertFlag: true, text: 'PIN이 동일합니다. 다른 PIN으로 설정해주세요.' });
            enterRef.current.focus();
            return false;
        }

        if (pin?.modFlag && confirmPin()) {
            // Alert.alert('안전한 PIN을 설정해주세요.');
            setMessage({ ...message, alertFlag: true, text: '안전한 PIN을 설정해주세요.' });
            setValue({ ...value, enter: '', check: '' });
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
            store.dispatch(dispatchLogin(true, moment()));
            setMessage({ ...message, alertFlag: true, text: null });
        } else {
            enterRef.current.focus();

            if (resetCount.current == 1) {
                Alert.alert('PIN 입력 횟수를 초과하였습니다.\n로그인 정보를 초기화 합니다.');
                store.dispatch(dispatchOne('RESET_LOGIN', true));
                resetCount.current = pinCount;
            } else {
                resetCount.current = resetCount.current - 1;
                // Alert.alert('PIN이 일치하지 않습니다. 다시 시도해주세요.');
                setMessage({
                    ...message,
                    alertFlag: true,
                    text: `PIN이 일치하지 않습니다. (남은 횟수 : ${resetCount.current}회)`,
                });
            }
        }
    };

    // PIN 등록
    const registPin = async () => {
        setMessage({ ...message, alertFlag: true, text: null });

        try {
            await registChangePin();
        } catch (err) {
            console.log(err);
        }
    };

    // pin 체크 시 token 검증
    const checkLoginInfo = async () => {
        await checkLogin(true).then(async (res) => {
            if (res.status) {
                await registChangePin();
            } else {
                Alert.alert(process.env.EXPO_PUBLIC_NAME, `PIN 변경 권한이 없습니다.`, [
                    {
                        text: '확인',
                        onPress: async () => {
                            store.dispatch(
                                dispatchMultiple({
                                    SET_PIN: { ...pin, modFlag: false },
                                    SET_TAB: 'pin',
                                })
                            );
                        },
                    },
                ]);
            }
        });
    };

    // pin 변경
    const registChangePin = async () => {
        const tabValue = webPinFlag ? 'web' : pin.isRegistered ? 'pin' : 'ldap'; // PIN 변경인 경우 PIN 로그인 으로, 웹에서 변경시 웹으로

        await StorageUtils.setDeviceData('pin', value.enter);
        store.dispatch(dispatchOne('SET_PIN', { ...pin, isRegistered: true, value: value.enter, modFlag: false }));

        Alert.alert(`PIN이 ${isMod ? '변경' : '설정'}되었습니다.`);

        const dispatchData = {
            SET_TAB: tabValue,
        };

        if (webPinFlag) dispatchData['SET_WEBPIN'] = false;

        store.dispatch(dispatchMultiple(dispatchData));
    };

    // PIN 검사
    const confirmPin = () => {
        const checkPin = value.enter;

        // 연속된 숫자 확인
        let isSequentialAscending = true;
        let isSequentialDescending = true;

        for (let i = 0; i < checkPin.length - 1; i++) {
            const currentDigit = parseInt(checkPin[i]);
            const nextDigit = parseInt(checkPin[i + 1]);

            // 오름차순 확인
            if (nextDigit !== currentDigit + 1) {
                isSequentialAscending = false; // 오름차순이 아님
            }

            // 내림차순 확인
            if (nextDigit !== currentDigit - 1) {
                isSequentialDescending = false; // 내림차순이 아님
            }
        }

        // 동일한 숫자 확인
        const passPattern = /^(?!(\d)\1{5}$)\d{6}$/;

        return isSequentialAscending || isSequentialDescending || !passPattern.test(checkPin);
    };

    // 로그인 trigger
    useEffect(() => {
        if (registRef.current > 0) handlePinButton();
    }, [registRef.current]);

    useEffect(() => {
        setValue({ ...value, enter: '', check: '' });
        setIsMod(pin?.isRegistered && pin?.modFlag);
    }, [pin]);

    useEffect(() => {
        resetCount.current = pinCount;
        if (webPinFlag) store.dispatch(dispatchOne('SET_PIN', { ...pin, modFlag: true }));
    }, []);

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
                    </>
                )}
                {message.text != null && (
                    <FontText style={[styles.smallText, message.alertFlag ? commonTextStyles.warning : commonTextStyles.success]}>
                        {message.text}
                    </FontText>
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
    smallText: {
        fontSize: 12,
    },
});

export default PinLogin;
