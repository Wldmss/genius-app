import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import store from 'store/store';
import * as SecureStore from 'expo-secure-store';
import * as Authentication from 'expo-local-authentication';
import { dispatchMultiple } from 'utils/DispatchUtils';
import * as StorageUtils from 'utils/StorageUtils';

const genius_logo = require('assets/genius_logo.png');

/** genius main */
const Main = () => {
    const [doneBio, setDoneBio] = useState(false);

    // 테스트 용 (storage delete)
    const storeStorageData = async () => {
        try {
            await SecureStore.deleteItemAsync('genius');
            await SecureStore.deleteItemAsync('bio');
            await SecureStore.deleteItemAsync('pin');
            await SecureStore.deleteItemAsync('users');
            // await SecureStore.setItemAsync('users', '');
        } catch (err) {
            console.log(err);
        }
    };

    // async store data
    const getStorageData = async () => {
        let bioData = await StorageUtils.getDeviceData('bio');
        let pinData = await StorageUtils.getDeviceData('pin');
        let users = await StorageUtils.getDeviceData('users');

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
                SET_USERS: users,
                SET_TAB: tabValue,
            })
        );
    };

    // bio check
    const checkBioSupported = async () => {
        let bioValue = {
            SET_BIO_SUPPORTED: false,
            SET_BIO_RECORDS: false,
        };

        // 단말 생체인증 지원 여부 확인
        const isSupported = await Authentication.hasHardwareAsync();

        if (isSupported) {
            const biometryType = await Authentication.supportedAuthenticationTypesAsync();
            bioValue.SET_BIO_SUPPORTED = biometryType.includes(1) || biometryType.includes(2);
        }

        // 단말 생체인증 등록 여부 확인
        bioValue.SET_BIO_RECORDS = bioValue.SET_BIO_SUPPORTED && (await Authentication.isEnrolledAsync());

        store.dispatch(dispatchMultiple(bioValue));
        setDoneBio(true);
    };

    useEffect(() => {
        // storeStorageData();

        if (doneBio) {
            getStorageData();
        } else {
            checkBioSupported().then(() => {
                getStorageData();
            });
        }
    }, []);

    return (
        <View style={styles.container}>
            <Image source={genius_logo} resizeMode="contain" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: `center`,
        alignItems: `center`,
    },
});

export default Main;
