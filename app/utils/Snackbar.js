import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Easing, Pressable } from 'react-native';
import { useSelector } from 'react-redux';
import { dispatchOne } from './DispatchUtils';
import { FontText } from './TextUtils';

const app_icon = require('assets/icons/app-icon.png');

/** 하단 snackbar */
const Snackbar = () => {
    const snack = useSelector((state) => state.commonReducer.snack);
    const slideAnim = useRef(new Animated.Value(100)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const onDismissSnackBar = () => {
        store.dispatch(dispatchOne('SET_SNACK', null));
    };

    const showSnack = () => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const hideSnack = () => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 100,
                duration: 300,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(onDismissSnackBar);
    };

    useEffect(() => {
        if (snack != null) {
            showSnack();

            if (!snack.hold) {
                new Promise((resolve) => setTimeout(resolve, 3000)).then(async () => {
                    hideSnack();
                });
            }
        } else {
            hideSnack();
        }
    }, [snack]);

    return (
        <Animated.View
            style={[
                styles.snackbar,
                {
                    transform: [{ translateY: slideAnim }],
                    opacity: fadeAnim,
                },
            ]}>
            <Pressable onPress={hideSnack}>
                <View style={styles.textBox}>
                    <Image source={app_icon} style={styles.logo} />
                    <FontText style={styles.text}>{snack != null ? snack.message : ''}</FontText>
                </View>
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    snackbar: {
        position: 'absolute',
        bottom: 25,
        alignItems: `center`,
        width: `100%`,
    },
    textBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        borderRadius: 25,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingVertical: 10,
        paddingHorizontal: 30,
    },
    logo: {
        width: 23,
        height: 23,
        borderRadius: 30,
    },
    text: {
        color: 'white',
    },
});

export default Snackbar;
