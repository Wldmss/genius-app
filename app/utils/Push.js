import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as TaskManager from 'expo-task-manager';
import { dispatchOne } from 'utils/DispatchUtils';

/** expo-notification 관련 코드 (사용 x) */

export const pushStore = (_store) => {
    store = _store;
};

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';

TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, ({ data, error, executionInfo }) => {
    console.log('Received a notification in the background!');
    console.log(data);
    // Do something with the notification data
});

// push 토큰 발급
export async function getPushToken() {
    const notification = store.getState().commonReducer.notification;

    if (notification) {
        return (await Notifications.getDevicePushTokenAsync()).data;
    }

    return null;
}

// push 토큰 발급 (expo token)
async function getExpoToken() {
    return (await Notifications.getExpoPushTokenAsync()).data;
}

// push 권한 확인
export async function checkNotificationPermission() {
    // 채널 설정 (알림 카테고리)
    if (Platform.OS === 'android') {
        // Notifications.deleteNotificationChannelAsync('expo_notifications_fallback_notification_channel');    // 채널 삭제 (channelId)

        await Notifications.setNotificationChannelAsync('default', {
            name: '알림',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: `#000000`,
            // lightColor: '#FF231F7C',
        });

        await Notifications.setNotificationChannelAsync('genius', {
            name: '공지',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: `#000000`,
            // lightColor: '#FF231F7C',
        });
    }

    checkPermission();
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

// foreground 알림용 스케줄러
async function schedulePushNotification(notification, data) {
    const message = {
        title: notification.title,
        body: notification.body,
        data: data,
    };

    await Notifications.scheduleNotificationAsync({
        content: message,
        trigger: null,
        // trigger: { seconds: 1 },
    });
}

/** push 알림 설정 (expo-notification) */
export function useNotification() {
    const [notification, setNotification] = useState(false);

    useEffect(() => {
        // 알림 권한 확인
        checkNotificationPermission();

        Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

        // push 수신
        const receivePush = Notifications.addNotificationReceivedListener((response) => {
            console.log('response?!@#!@#!@');
            console.log(response);
            setNotification(response);
        });

        // push 클릭 이벤트
        const clickPushEvent = Notifications.addNotificationResponseReceivedListener((response) => {
            console.log(response);
            store.dispatch(dispatchOne('SET_LINK', true));
            store.dispatch(dispatchOne('SET_PARAMS', response.notification.request.content.data));
        });

        const notificationDrop = Notifications.addNotificationsDroppedListener((response) => {
            console.log('drop!!!!!');
            console.log(response);
        });

        return () => {
            receivePush.remove();
            clickPushEvent.remove();
            notificationDrop.remove();
        };
    }, []);
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
