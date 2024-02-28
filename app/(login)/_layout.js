import React from 'react';
import PropTypes from 'prop-types';
import { Image, ImageBackground, StyleSheet, View } from 'react-native';
import TopLogo from 'assets/login_top_title.svg';
import { Slot } from 'expo-router';
import OtherLogin from 'components/OtherLogin';

const genius_logo = require('assets/genius_logo.png');
const genius_background = require('assets/genius_login_full_mobile.png');

/** 로그인 페이지 (공통) */
const LoginLayout = () => {
    return (
        <View style={styles.container} id="content">
            <ImageBackground source={genius_background} style={styles.loginBackground}>
                <TopLogo style={styles.title} />
                <View style={styles.enterBox}>
                    <Image source={genius_logo} style={styles.logo} resizeMode="contain" />
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
    title: {
        marginBottom: 10,
        width: 230,
    },
    enterBox: {
        position: `relative`,
        maxWidth: 300,
        shadowColor: '#ddd',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.6,
        shadowRadius: 16,
        borderRadius: 15,
        justifyContent: `center`,
        alignItems: `center`,
        backgroundColor: `#fff`,
        color: `#666`,
        fontSize: 12,
        gap: 20,
        paddingVertical: 30,
        paddingHorizontal: 30,
    },
    loginBackground: {
        flex: 1,
        justifyContent: `center`,
        alignItems: `center`,
        width: `100%`,
        height: `100%`,
    },
    logo: {
        height: 30,
        width: 250,
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

LoginLayout.propTypes = {};

export default LoginLayout;
