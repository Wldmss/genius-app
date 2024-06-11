import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import * as SecureStore from 'expo-secure-store';
import * as Authentication from 'expo-local-authentication';
import { dispatchMultiple, dispatchOne } from 'utils/DispatchUtils';
import * as StorageUtils from 'utils/StorageUtils';
import AsyncStorage from '@react-native-async-storage/async-storage'; // !! staging build 시에는 지워야 한다

// secure storage delete
export const deleteSecureStore = async (isDev) => {
    try {
        await SecureStore.deleteItemAsync('bio');
        await SecureStore.deleteItemAsync('pin');
        await SecureStore.deleteItemAsync('loginKey');
        if (!isDev) await SecureStore.deleteItemAsync('isDev');
    } catch (err) {
        console.log(err);
    }
};

/** genius main */
const Main = () => {
    const [doneBio, setDoneBio] = useState(false);
    const resetLogin = useSelector((state) => state.loginReducer.resetLogin);
    const bioRecords = useSelector((state) => state.loginReducer.bioRecords);

    // 로그인 리셋
    const resetStorageData = async () => {
        await SecureStore.deleteItemAsync('pin');
        await SecureStore.deleteItemAsync('bio');
        await SecureStore.deleteItemAsync('loginKey');

        store.dispatch(dispatchOne('RESET_LOGIN', false));
        store.dispatch(dispatchOne('SET_TAB', 'main'));
    };

    // async store data
    const getStorageData = async () => {
        const bioData = await StorageUtils.getDeviceData('bio'); // 생체 인증 등록 여부 ('true'/'false')
        const pinData = await StorageUtils.getDeviceData('pin'); // 설정 pin
        const loginKey = await StorageUtils.getDeviceData('loginKey'); // loginKey token

        let bio = { isRegistered: false, modFlag: false };
        let pin = { isRegistered: false, value: '', modFlag: true };

        // 생체인증 등록 여부
        let hasBio = bioData != null && bioData == 'true';

        // 생체 인증 등록 후 단말에서 삭제한 경우
        if (hasBio && !bioRecords) {
            hasBio = false;
            await SecureStore.deleteItemAsync('bio');
        }

        bio.isRegistered = hasBio;
        bio.modFlag = false;

        // PIN 설정 정보
        const hasPin = pinData != null;
        pin.isRegistered = hasPin;
        pin.value = pinData;
        pin.modFlag = !hasPin;

        /** 탭 기준 :
         * - 최초 접속 시 PIN 설정 > LDAP 인증 > 로그인
         * - 접속 시 PIN 로그인/생체 인증 > (자동 LDAP 인증) > 로그인
         * - 우선순위: 생체 인증 > PIN > LDAP
         * */
        const tabValue = hasBio ? 'bio' : 'pin';

        store.dispatch(
            dispatchMultiple({
                SET_PIN: pin,
                SET_BIO: bio,
                SET_LOGINKEY: loginKey,
                SET_TAB: tabValue,
            })
        );
    };

    // bio check
    const checkBioSupported = async () => {
        let bioValue = {
            SET_BIO_SUPPORTED: null,
            SET_BIO_RECORDS: false,
        };

        // 단말 생체인증 지원 여부 확인
        const isSupported = await Authentication.hasHardwareAsync();
        let bioRecords = false;

        if (isSupported) {
            const biometryType = await Authentication.supportedAuthenticationTypesAsync();
            const bioSupported = biometryType.includes(2) ? 2 : biometryType.includes(1) ? 1 : null;
            bioValue.SET_BIO_SUPPORTED = bioSupported;
            bioRecords = bioSupported;
        }

        // 단말 생체인증 등록 여부 확인
        if (bioRecords) {
            const isEnroll = await Authentication.isEnrolledAsync();
            bioRecords = isEnroll;
        }

        bioValue.SET_BIO_RECORDS = bioRecords;

        store.dispatch(dispatchMultiple(bioValue));
        setDoneBio(true);
    };

    // 최초 접속 확인 : ios는 키체인에 저장되어 앱 삭제 시 storage reset이 안됨
    const checkFirst = async () => {
        try {
            const isFirst = await AsyncStorage.getItem('isFirst');
            if (isFirst == null || isFirst != 'true') {
                // 최초 설치
                deleteSecureStore();
                await AsyncStorage.setItem('isFirst', 'true');
            }
        } catch (err) {
            return false;
        }
    };

    useEffect(() => {
        // deleteSecureStore();

        checkFirst().then(() => {
            checkBioSupported();
        });
    }, []);

    useEffect(() => {
        if (doneBio) {
            getStorageData();
        }
    }, [doneBio]);

    useEffect(() => {
        if (resetLogin) resetStorageData();
    }, [resetLogin]);

    return <View style={styles.container}></View>;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: `center`,
        alignItems: `center`,
    },
});

export default Main;
