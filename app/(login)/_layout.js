import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { Slot } from 'expo-router';
import OtherLogin from 'components/OtherLogin';

import TopLogo from 'assets/images/login-top.svg';
const genius_background = require('assets/images/login-bg.png');
import { GeniusLogo } from 'utils/ImageUtils';

/** 로그인 페이지 (공통) */
const LoginLayout = () => {
    return (
        <View style={styles.container} id="content">
            <ImageBackground source={genius_background} style={styles.loginBackground}>
                <TopLogo style={styles.title} />
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
