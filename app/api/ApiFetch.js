import { Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Updates from 'expo-updates';
import { setDevelopment } from '(login)/_layout';

export const apiFetchStore = (_store) => {
    store = _store;
};

const server = null;

const checkDevelopment = () => {
    const isDev = store.getState().commonReducer.isDev;
    const url = isDev ? process.env.EXPO_PUBLIC_DEV_SERVER_URL : process.env.EXPO_PUBLIC_SERVER_URL;

    return { isDev: isDev, url: url };
};

export async function postForm(url, body) {
    const serverInfo = server == null ? checkDevelopment() : server;

    const response = await fetch(`${serverInfo.url}/${url}`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(body),
    }).catch((error) => {
        if (serverInfo.isDev) catchError(`${serverInfo.url}/${url}`, error);
    });

    if (!response.ok) {
        throw new Error(`오류가 발생했습니다. ${response.status}`);
    }

    return await response.json();
}

export async function post(url, body) {
    const serverInfo = server == null ? checkDevelopment() : server;

    const response = await fetch(`${serverInfo.url}/${url}`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    }).catch((error) => {
        if (serverInfo.isDev) catchError(`${serverInfo.url}/${url}`, error);
    });

    if (!response.ok) {
        throw new Error(`오류가 발생했습니다. ${response.status}`);
    }

    return await response.json();
}

export async function get(url) {
    const serverInfo = server == null ? checkDevelopment() : server;

    const response = await fetch(`${serverInfo.url}/${url}`, {
        method: 'GET',
    }).catch((error) => {
        if (serverInfo.isDev) catchError(`${serverInfo.url}/${url}`, error);
    });

    if (!response.ok) {
        throw new Error(`오류가 발생했습니다. ${response.status}`);
    }

    return await response.json();
}

const catchError = (url, error) => {
    Alert.alert(`개발자 모드`, `${url}\n${error}`, [
        {
            text: '무시하고 계속',
            onPress: () => null,
        },
        {
            text: '모드 변경',
            onPress: async () => {
                setDevelopment();
            },
        },
        {
            text: '복사 및 재시작',
            onPress: async () => {
                await Clipboard.setStringAsync(`${url}\n\n${error}`);
                await Updates.reloadAsync();
            },
        },
    ]);
};
