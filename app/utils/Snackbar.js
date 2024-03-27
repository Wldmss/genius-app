import React from 'react';
import { StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { Snackbar as Snack } from 'react-native-paper';
import store from 'store/store';
import { dispatchOne } from './DispatchUtils';
import Constants from 'expo-constants';

const Snackbar = () => {
    const snack = useSelector((state) => state.commonReducer.snack);

    const onDismissSnackBar = () => {
        store.dispatch(dispatchOne('SET_SNACK', null));
    };

    return (
        <Snack
            visible={snack != null}
            style={styles.snackbar}
            wrapperStyle={{ top: Constants.statusBarHeight }}
            onDismiss={onDismissSnackBar}
            onTouchEnd={onDismissSnackBar}>
            {snack}
        </Snack>
    );
};

const styles = StyleSheet.create({
    snackbar: {
        borderRadius: 10,
    },
});

export default Snackbar;
