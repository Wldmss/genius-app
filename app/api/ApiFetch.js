import { Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Updates from 'expo-updates';
import { setDevelopment } from '(login)/_layout';

let server_url = process.env.SERVER_URL;
let isDev = false;

export const apiFetchStore = (_store) => {
    store = _store;

    isDev = store.getState().commonReducer.isDev;
    server_url = isDev ? process.env.DEV_SERVER_URL : process.env.SERVER_URL;
};

/** api fetch : 웹 통신 오류로 사용 x */

export async function postForm(url, body) {
    const response = await fetch(`${server_url}/${url}`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(body),
    }).catch((error) => {
        if (isDev) catchError(`${server_url}/${url}`, error);
    });

    if (!response.ok) {
        throw new Error(`오류가 발생했습니다. ${response.status}`);
    }

    return await response.json();
}

export async function post(url, body) {
    const response = await fetch(`${server_url}/${url}`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    }).catch((error) => {
        if (isDev) catchError(`${server_url}/${url}`, error);
    });

    if (!response.ok) {
        throw new Error(`오류가 발생했습니다. ${response.status}`);
    }

    return await response.json();
}

export async function get(url) {
    const response = await fetch(`${server_url}/${url}`, {
        method: 'GET',
    }).catch((error) => {
        if (isDev) catchError(`${server_url}/${url}`, error);
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
