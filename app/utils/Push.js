import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { dispatchOne } from 'utils/DispatchUtils';

/** expo-notification 관련 코드 (사용 x) */

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
    handleSuccess: (result) => {},
    handleError: (result) => {},
});

export const pushStore = (_store) => {
    store = _store;
};

// push 토큰 발급
export async function getPushToken() {
    const notification = store.getState().commonReducer.notification;

    if (notification) {
        return (await Notifications.getExpoPushTokenAsync()).data;
    }

    return null;
}

// push 토큰 발급
async function getExpoToken() {
    return (await Notifications.getExpoPushTokenAsync()).data;
}

/** push 알림 설정 (expo-notification) */
export function useNotification() {
    const [notification, setNotification] = useState(false);

    useEffect(() => {
        checkNotificationPermission();

        const received1 = Notifications.addNotificationReceivedListener((response) => {
            console.log(response);
            setNotification(response);
        });

        const received2 = Notifications.addNotificationResponseReceivedListener((response) => {
            console.log(response);
            redirect(response.notification);
        });

        return () => {
            received1.remove();
            received2.remove();
        };
    }, []);
}

// push 권한 확인
export async function checkNotificationPermission() {
    if (Platform.OS === 'android') {
        // Notifications.deleteNotificationChannelAsync('expo_notifications_fallback_notification_channel');
        await Notifications.setNotificationChannelAsync('default', {
            name: '알림',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            // lightColor: '#FF231F7C',
        });
        await Notifications.setNotificationChannelAsync('genius', {
            name: '공지',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            // lightColor: '#FF231F7C',
        });
    }

    checkPermission();

    return null;
}

// 권한 설정
async function checkPermission() {
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

    if (url) {
        router.push(url);
    }
}

// push 전송 test (expo-notification)
export async function sendPushNotification(notification, data) {
    const token = await getExpoToken();

    const message = {
        title: notification.title,
        body: notification.body,
        data: data,
    };

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
