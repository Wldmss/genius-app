import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Pressable, Alert } from 'react-native';
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
    const bioStore = useSelector((state) => state.loginReducer.bio);
    const bioRecords = useSelector((state) => state.loginReducer.bioRecords);

    const [bio, setBio] = useState(bioStore);

    // 생체 인증
    const authenticate = async (isRegister) => {
        try {
            const { success } = await Authentication.authenticateAsync({
                promptMessage: `${isRegister ? 'GENIUS 등록' : 'GENIUS 로그인'}`,
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
                store.dispatch(dispatchLogin(moment()));
            }
        } else {
            Alert.alert('생체 인증이 등록되어있지 않습니다.');
        }
    };

    // 생체 인증 등록
    const registBio = async () => {
        const success = await authenticate(true);
        if (success) {
            Alert.alert('GENIUS', '생체 인증이 등록되었습니다.', [
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

    // 등록/로그인 확인
    const tryBio = () => {
        if (bio?.modFlag) {
            registBio();
        } else {
            loginBio();
        }
    };

    useEffect(() => {
        tryBio();
    }, [bio]);

    return (
        <View>
            <View style={styles.inputBox}>
                <FontText style={commonTextStyles.center}>{`생체 인증 ${bio?.modFlag ? '등록' : '로그인'}`}</FontText>
                <FontText style={styles.infoText}>지문 또는 Face ID를 입력해주세요</FontText>
                <Pressable style={commonInputStyles.buttonWhite} onPress={tryBio}>
                    <FontText>다시 시도</FontText>
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {},
    inputBox: {
        gap: 5,
        margin: `0 auto`,
    },
    infoText: {
        textAlign: `center`,
        marginBottom: 10,
    },
});

export default BioLogin;
