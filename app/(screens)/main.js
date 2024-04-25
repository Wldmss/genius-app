import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import store from 'store/store';
import * as SecureStore from 'expo-secure-store';
import * as Authentication from 'expo-local-authentication';
import { dispatchMultiple, dispatchOne } from 'utils/DispatchUtils';
import * as StorageUtils from 'utils/StorageUtils';
import Constants from 'expo-constants';

const { profile } = Constants.expoConfig.extra;

/** genius main */
const Main = () => {
    const [doneBio, setDoneBio] = useState(false);
    const resetLogin = useSelector((state) => state.loginReducer.resetLogin);

    // 테스트 용 (storage delete)
    const storeStorageData = async () => {
        try {
            await SecureStore.deleteItemAsync('bio');
            await SecureStore.deleteItemAsync('pin');
            await SecureStore.deleteItemAsync('jwt');
            await SecureStore.deleteItemAsync('hasVisit');
            // await SecureStore.setItemAsync('jwt', '');
        } catch (err) {
            console.log(err);
        }
    };

    // 로그인 리셋
    const resetStorageData = async () => {
        await SecureStore.deleteItemAsync('pin');
        await SecureStore.deleteItemAsync('bio');
        await SecureStore.deleteItemAsync('jwt');

        store.dispatch(dispatchOne('RESET_LOGIN', false));
        store.dispatch(dispatchOne('SET_TAB', 'main'));
    };

    // async store data
    const getStorageData = async () => {
        const bioData = await StorageUtils.getDeviceData('bio'); // 생체 인증 등록 여부 ('true'/'false')
        const pinData = await StorageUtils.getDeviceData('pin'); // 설정 pin
        const jwt = await StorageUtils.getDeviceData('jwt'); // jwt token

        let bio = { isRegistered: false, modFlag: false };
        let pin = { isRegistered: false, value: '', modFlag: true };

        // 생체인증 등록 여부
        const hasBio = bioData != null && bioData == 'true';
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
                SET_JWT: jwt,
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

        if (isSupported) {
            const biometryType = await Authentication.supportedAuthenticationTypesAsync();
            bioValue.SET_BIO_SUPPORTED = biometryType.includes(2) ? 2 : biometryType.includes(1) ? 1 : null;
        }

        // 단말 생체인증 등록 여부 확인
        bioValue.SET_BIO_RECORDS = bioValue.SET_BIO_SUPPORTED && (await Authentication.isEnrolledAsync());

        store.dispatch(dispatchMultiple(bioValue));
        setDoneBio(true);
    };

    // 최초 접속 확인
    const checkFirst = async () => {
        try {
            const hasVisit = await StorageUtils.getDeviceData('hasVisit');
            return hasVisit == null || hasVisit != 'true';
        } catch (err) {
            return false;
        }
    };

    // storage 데이터 확인
    const checkStorage = () => {
        if (doneBio) {
            getStorageData();
        } else {
            checkBioSupported().then(() => {
                getStorageData();
            });
        }
    };

    useEffect(() => {
        // storeStorageData();

        // TEST
        if (profile == 'staging') {
            checkStorage();
        } else {
            checkFirst().then((isFirst) => {
                if (isFirst) {
                    store.dispatch(dispatchOne('SET_TAB', 'guide'));
                } else {
                    checkStorage();
                }
            });
        }
    }, []);

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
