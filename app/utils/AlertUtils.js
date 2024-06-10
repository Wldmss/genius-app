import { Alert } from 'react-native';
import { dispatchMultiple } from './DispatchUtils';

export const alertStore = (_store) => {
    store = _store;
};

export const webLoginChangeAlert = (webPinFlag) => {
    Alert.alert(process.env.EXPO_PUBLIC_NAME, `${webPinFlag ? 'PIN' : '생체 인증'} 변경을 취소하시겠습니까?`, [
        {
            text: '아니요',
            onPress: () => null,
            style: 'cancel',
        },
        {
            text: '예',
            onPress: () => {
                store.dispatch(dispatchMultiple({ SET_WEBPIN: false, SET_WEBBIO: false, SET_TAB: 'web' }));
            },
        },
    ]);
};

export const alert = (message) => {
    Alert.alert(message);
};

export const okAlert = (message, ok, title) => {
    Alert.alert(title || process.env.EXPO_PUBLIC_NAME, message, [
        {
            text: '확인',
            onPress: () => ok,
        },
    ]);
};

export const okCancelAlert = (message, ok, cancel, title) => {
    Alert.alert(title || process.env.EXPO_PUBLIC_NAME, message, [
        {
            text: '아니요',
            onPress: () => cancel,
            style: 'cancel',
        },
        {
            text: '예',
            onPress: () => ok,
        },
    ]);
};

export const asyncOkCancelAlert = (message, ok, cancel, title) => {
    Alert.alert(title || process.env.EXPO_PUBLIC_NAME, message, [
        {
            text: '아니요',
            onPress: async () => cancel,
            style: 'cancel',
        },
        {
            text: '예',
            onPress: async () => ok,
        },
    ]);
};
