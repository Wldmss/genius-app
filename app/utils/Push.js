import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { dispatchOne } from 'utils/DispatchUtils';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
    handleSuccess: (result) => {
        console.log('handleSuccess');
        console.log(result);
    },
    handleError: (result) => {
        console.log('handleError');
        console.log(result);
    },
});

export const pushStore = (_store) => {
    store = _store;
};

// push 토큰 발급
export async function getPushToken() {
    const notification = store.getState().commonReducer.notification;
    console.log(notification);

    if (notification) {
        return (await Notifications.getDevicePushTokenAsync()).data;
    }

    return null;
}

/** push 알림 설정 (expo-notification) */
export function useNotification() {
    const [notification, setNotification] = useState(false);

    useEffect(() => {
        checkNotificationPermission();

        const received1 = Notifications.addNotificationReceivedListener((response) => {
            console.log('received1');
            console.log(response);
            setNotification(response);
        });

        const received2 = Notifications.addNotificationResponseReceivedListener((response) => {
            console.log('received2');
            console.log(response);
            redirect(response.notification);
        });

        return () => {
            received1.remove();
            received2.remove();
        };
    }, []);

    useEffect(() => {
        console.log('notification useeffect');
        console.log(notification);
    }, [notification]);
}

// push 권한 확인
async function checkNotificationPermission() {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    checkPermission();

    return null;
}

// 권한 설정
export async function checkPermission() {
    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        store.dispatch(dispatchOne('SET_NOTIFICATION', finalStatus == 'granted'));
    }
}

function redirect(notification) {
    const url = notification.request.content.data?.url;
    console.log('redirect!!');
    console.log(url);
    if (url) {
        router.push(url);
    }
}

// push 전송 test (expo-notification)
export async function sendPushNotification(token) {
    const message = {
        to: token,
        sound: 'default',
        title: 'Original Title',
        body: 'And here is the body!',
        data: { someData: 'goes here' },
    };

    console.log(message);

    await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
    });
}
