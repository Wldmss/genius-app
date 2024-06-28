import React from 'react';
import { Alert, ImageBackground, Pressable, StyleSheet, View } from 'react-native';
import { Slot } from 'expo-router';
import OtherLogin from 'components/OtherLogin';
import Constants from 'expo-constants';
import { dispatchOne } from 'utils/DispatchUtils';
import * as StorageUtils from 'utils/StorageUtils';
import * as Updates from 'expo-updates';

import TopLogo from 'assets/images/login-top.svg';
const genius_background = require('assets/images/login-bg.png');
import { GeniusLogo } from 'utils/ImageUtils';
import { deleteSecureStore } from '(screens)/main';
import { useSelector } from 'react-redux';

const { isTest } = Constants.expoConfig.extra;

export const setDevelopment = () => {
    if (isTest) {
        Alert.alert(`개발자 모드`, '모드를 선택해주세요.', [
            {
                text: '취소',
                onPress: () => null,
            },
            {
                text: '운영',
                onPress: async () => {
                    await StorageUtils.setDeviceData('isDev', 'false');
                    store.dispatch(dispatchOne('SET_DEV', false));
                    await Updates.reloadAsync();
                },
            },
            {
                text: '개발',
                onPress: async () => {
                    await StorageUtils.setDeviceData('isDev', 'true');
                    store.dispatch(dispatchOne('SET_DEV', true));
                    await Updates.reloadAsync();
                },
            },
        ]);
    }
};

const test = async () => {
    if (isTest) {
        Alert.alert(`개발자 모드`, '로그인 정보를 초기화 합니다.', [
            {
                text: '취소',
                onPress: () => null,
            },
            {
                text: '확인',
                onPress: async () => {
                    await deleteSecureStore(true);
                    await Updates.reloadAsync();
                },
            },
        ]);
    }
};

/** 로그인 페이지 (공통) */
const LoginLayout = () => {
    const isDev = useSelector((state) => state.commonReducer.isDev);

    return (
        <View style={styles.container}>
            <ImageBackground source={genius_background} style={styles.loginBackground}>
                <Pressable onLongPress={setDevelopment} onPress={() => isDev && test()}>
                    <TopLogo style={styles.title} />
                </Pressable>
                <View style={styles.enterBox}>
                    <GeniusLogo style={styles.logo} />
                    <View style={styles.loginContainer}>
                        <Slot />
                    </View>
                    <OtherLogin />
                </View>
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loginBackground: {
        flex: 1,
        justifyContent: `center`,
        alignItems: `center`,
    },
    title: {
        marginBottom: 10,
        width: 230,
    },
    enterBox: {
        position: `relative`,
        maxWidth: 330,
        shadowColor: '#ddd',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.6,
        shadowRadius: 16,
        borderRadius: 15,
        alignItems: `center`,
        backgroundColor: `#fff`,
        color: `#666`,
        fontSize: 12,
        gap: 20,
        paddingVertical: 30,
        paddingHorizontal: 30,
    },
    logo: {
        height: 30,
    },
    loginContainer: {
        gap: 20,
    },
    otherLoginBox: {
        gap: 5,
    },
    otherText: {
        color: `#454545`,
    },
});

export default LoginLayout;
