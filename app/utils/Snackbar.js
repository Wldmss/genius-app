import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { Snackbar as Snack } from 'react-native-paper';
import store from 'store/store';
import { dispatchOne } from './DispatchUtils';
import Constants from 'expo-constants';
import { FontText } from './TextUtils';

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
        }
    }, [snack]);

    return (
        <Snack
            visible={snack != null}
            style={styles.snackbar}
            // wrapperStyle={{ top: Constants.statusBarHeight }}
            onDismiss={onDismissSnackBar}
            onTouchEnd={onDismissSnackBar}>
            <FontText style={styles.text}>{snack}</FontText>
        </Snack>
    );
};

const styles = StyleSheet.create({
    snackbar: {
        borderRadius: 25,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        marginBottom: 25,
    },
    text: {
        color: `white`,
        textAlign: `center`,
    },
});

export default Snackbar;
