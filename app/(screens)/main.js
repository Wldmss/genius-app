import React, { useEffect, useState } from 'react';
import { Alert, BackHandler, StyleSheet, Text } from 'react-native';
import { useSelector } from 'react-redux';
import store from '../store/store';
import * as SecureStore from 'expo-secure-store';
import * as Authentication from 'expo-local-authentication';
import { dispatchMultiple, dispatchOne } from 'utils/DispatchUtils';
import * as StorageUtils from 'utils/StorageUtils';
import * as NavigateUtils from 'utils/NavigateUtils';
import { useLocalSearchParams } from 'expo-router';

/** genius main */
const Main = () => {
    const params = useLocalSearchParams();
    const [tab, setTab] = useState(null);
    const [isLink, setIsLink] = useState(null);
    const [doneBio, setDoneBio] = useState(false);
    const token = useSelector((state) => state.loginReducer.token);

    const storeStorageData = async () => {
        try {
            await SecureStore.deleteItemAsync('genius');
            await SecureStore.deleteItemAsync('bio');
            await SecureStore.deleteItemAsync('pin');
            await SecureStore.deleteItemAsync('users');

            // await SecureStore.setItemAsync('genius_pin', '123456');
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

        const hasBio = bioData != null && bioData == 'true';
        bio.isRegistered = hasBio;
        bio.modFlag = false;

        const hasPin = pinData != null;
        pin.isRegistered = hasPin;
        pin.value = pinData;
        pin.modFlag = !hasPin;

        const tabValue = users == null ? 'pin' : hasBio ? 'bio' : hasPin ? 'pin' : 'ldap';

        const exitFlag = isLink && !hasBio && !hasPin;
        if (exitFlag) closeGenius();

        setStoreData({
            SET_PIN: pin,
            SET_BIO: bio,
            SET_USERS: users,
            SET_TAB: tabValue,
        });

        setTab(tabValue);
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

        setStoreData(bioValue);
        setDoneBio(true);
    };

    // store 값 저장
    const setStoreData = (data) => {
        store.dispatch(dispatchMultiple(data));
    };

    // 앱 종료
    const closeGenius = () => {
        Alert.alert('GENIUS 종료', '로그인이 되어있지 않습니다.', [
            {
                text: '닫기',
                onPress: () => {
                    BackHandler.exitApp();
                },
            },
        ]);
    };

    useEffect(() => {
        const link = params && Object.keys(params).length > 0 && Object.keys(params).includes('link') && params['link'] == 'true';

        store.dispatch(dispatchOne('SET_LINK', link));
        // store.dispatch(dispatchOne('SET_TOKEN', link ? {} : null));

        setIsLink(link);
    }, []);

    useEffect(() => {
        if (isLink != null && token == null) {
            setTab(null);
            // storeStorageData();

            if (doneBio) {
                getStorageData();
            } else {
                checkBioSupported().then(() => {
                    getStorageData();
                });
            }
        }
    }, [isLink, token]);

    useEffect(() => {
        if (tab != null) {
            store.dispatch(NavigateUtils.routeDispatch(tab));
        }
    }, [tab]);

    return <Text style={styles.container}>Main..</Text>;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        textAlign: `center`,
    },
});

Main.propTypes = {};

export default Main;
