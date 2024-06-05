import React, { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { Snackbar as Snack } from 'react-native-paper';
import { dispatchOne } from './DispatchUtils';
import { FontText } from './TextUtils';

const app_icon = require('assets/icons/app-icon.png');

const Snackbar = () => {
    const snack = useSelector((state) => state.commonReducer.snack);

    const onDismissSnackBar = () => {
        store.dispatch(dispatchOne('SET_SNACK', null));
    };

    useEffect(() => {
        if (snack != null) {
            const timeout = setTimeout(() => {
                onDismissSnackBar();
            }, 2000);

            return () => clearTimeout(timeout);
        } else {
            onDismissSnackBar();
        }
    }, [snack]);

    return (
        <Snack
            visible={snack != null}
            style={styles.snackbar}
            // wrapperStyle={{ top: Constants.statusBarHeight }}
            onDismiss={onDismissSnackBar}
            onTouchEnd={onDismissSnackBar}>
            <View style={styles.textBox}>
                <Image source={app_icon} style={styles.logo} />
                <FontText style={styles.text}>{snack}</FontText>
            </View>
        </Snack>
    );
};

const styles = StyleSheet.create({
    snackbar: {
        borderRadius: 25,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        marginBottom: 25,
    },
    textBox: {
        flexDirection: `row`,
        gap: 10,
        justifyContent: `center`,
    },
    logo: {
        width: 25,
        height: 25,
        borderRadius: 30,
    },
    text: {
        color: `white`,
    },
});

export default Snackbar;
