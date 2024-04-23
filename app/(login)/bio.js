import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Pressable, Alert, TextInput, Keyboard } from 'react-native';
import { useSelector } from 'react-redux';
import { commonInputStyles, commonTextStyles } from 'assets/styles';
import store from 'store/store';
import moment from 'moment';
import * as Authentication from 'expo-local-authentication';
import * as StorageUtils from 'utils/StorageUtils';
import { dispatchLogin, dispatchOne } from 'utils/DispatchUtils';
import { FontText } from 'utils/TextUtils';

/** 생체 인증 로그인/등록 */
const BioLogin = () => {
    const pin = useSelector((state) => state.loginReducer.pin);
    const bioStore = useSelector((state) => state.loginReducer.bio);
    const bioRecords = useSelector((state) => state.loginReducer.bioRecords);
    const bioSupported = useSelector((state) => state.loginReducer.bioSupported);

    const pinLength = 6;
    const pinCount = 5;

    const [bio, setBio] = useState(bioStore);
    const [isPin, setIsPin] = useState(false);
    const pinRef = useRef(null);
    const [pinValue, setPinValue] = useState(null);

    const resetCount = useRef(pinCount);

    // 생체 인증
    const authenticate = async (isRegister) => {
        try {
            const { success } = await Authentication.authenticateAsync({
                promptMessage: `${process.env.EXPO_PUBLIC_NAME} ${isRegister ? `등록` : `로그인`}`,
                AuthenticationType: bioSupported,
            });

            return success;
        } catch (error) {
            Alert.alert('다시 시도해주세요.');
            console.error('생체 인증 오류 :', error);
        }
    };

    // 생체 인증 로그인
    const loginBio = async () => {
        if (bioRecords && (bio?.isRegistered || bio?.modFlag)) {
            const success = await authenticate();
            if (success) {
                store.dispatch(dispatchLogin(true, moment()));
            }
        } else {
            Alert.alert('생체 인증이 등록되어있지 않습니다.');
        }
    };

    // 생체 인증 등록
    const registBio = async () => {
        const success = await authenticate(true);
        if (success) {
            Alert.alert(process.env.EXPO_PUBLIC_NAME, '생체 인증이 등록되었습니다.', [
                {
                    text: '확인',
                    onPress: async () => {
                        const bioValue = { ...bio, isRegistered: true, modFlag: false };
                        store.dispatch(dispatchOne('SET_BIO', bioValue));
                        await StorageUtils.setDeviceData('bio', 'true');
                        setBio(bioValue);
                    },
                },
            ]);
        }
    };

    const changePin = (input) => {
        // 숫자가 아닌 경우 return
        if (isNaN(input)) {
            Alert.alert('숫자를 입력해주세요.');
            return;
        }

        setPinValue(input);

        if (input.length == pinLength) {
            Keyboard.dismiss();
        }
    };

    // pin 확인
    const handlePinButton = () => {
        const isSame =
            pinValue && pinValue.length == pinLength && String(pin.value).length == String(pinValue).length && Number(pin.value) == Number(pinValue);

        if (isSame) {
            setIsPin(false);
            tryBio();
        } else {
            if (resetCount.current == 1) {
                Alert.alert('PIN 입력 횟수를 초과하였습니다.\n로그인 정보를 초기화 합니다.');
                store.dispatch(dispatchOne('RESET_LOGIN', true));
                resetCount.current = pinCount;
            } else {
                resetCount.current = resetCount.current - 1;
                Alert.alert(`PIN이 일치하지 않습니다.\n (남은 횟수 : ${resetCount.current} 회)`);
                pinRef.current.focus();
            }
        }
    };

    // 등록/로그인 확인
    const tryBio = () => {
        if (bio?.modFlag) {
            registBio();
        } else {
            loginBio();
        }
    };

    useEffect(() => {
        if (bio?.isRegistered) {
            tryBio();
        } else {
            setPinValue(null);
            setIsPin(true);
            resetCount.current = pinCount;
        }
    }, [bio]);

    return (
        <View>
            <View style={styles.inputBox}>
                <FontText style={commonTextStyles.center}>{`생체 인증 ${bio?.modFlag ? '등록' : '로그인'}`}</FontText>
                {isPin ? (
                    <View style={styles.pinBox}>
                        <TextInput
                            ref={pinRef}
                            value={pinValue}
                            inputMode="numeric"
                            maxLength={pinLength}
                            placeholder={`PIN 입력`}
                            placeholderTextColor={`#a9a9a9`}
                            secureTextEntry
                            style={[commonTextStyles.fonts, commonInputStyles.inputNumber, pinValue && pinValue.length > 0 ? styles.spacing : '']}
                            onChangeText={(input) => changePin(input)}
                        />
                        <Pressable style={commonInputStyles.buttonRed} onPress={handlePinButton}>
                            <FontText style={commonTextStyles.white}>{'확인'}</FontText>
                        </Pressable>
                    </View>
                ) : (
                    <View>
                        <FontText style={styles.infoText}>지문 또는 Face ID를 입력해주세요</FontText>
                        <Pressable style={commonInputStyles.buttonWhite} onPress={tryBio}>
                            <FontText>다시 시도</FontText>
                        </Pressable>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {},
    inputBox: {
        gap: 10,
        margin: `0 auto`,
    },
    infoText: {
        textAlign: `center`,
        marginBottom: 10,
    },
    spacing: {
        letterSpacing: 5,
    },
    pinBox: {
        gap: 12,
    },
});

export default BioLogin;
