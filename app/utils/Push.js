import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { dispatchOne } from 'utils/DispatchUtils';

/** expo-notification 관련 코드 (사용 x) */

export const pushStore = (_store) => {
    store = _store;
};

// foreground alert
Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
        // trigger 가 있는 경우는 정상적으로 값이 들어오지 않아 다시 보내줘야 함.
        const trigger = notification?.request?.trigger;
        const hasTrigger = trigger != null;

        if (hasTrigger) {
            const remoteMessage = trigger?.remoteMessage;
            if (remoteMessage) schedulePushNotification(remoteMessage);
        }

        return {
            shouldShowAlert: !hasTrigger,
            shouldPlaySound: !hasTrigger,
            shouldSetBadge: false,
        };
    },
});

// foreground 알림용 스케줄러
export async function schedulePushNotification(remoteMessage) {
    const notification = remoteMessage.notification;
    const data = remoteMessage.data;

    const message = { ...notification, color: process.env.EXPO_PUBLIC_PUSH_COLOR, data: data };

    await Notifications.scheduleNotificationAsync({
        content: message,
        trigger: null,
        // trigger: { seconds: 1 },
    });
}

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
        });

        await Notifications.setNotificationChannelAsync('genius', {
            name: '공지',
            importance: Notifications.AndroidImportance.MAX,
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

/** push 알림 설정 (expo-notification) */
export function useNotification() {
    useEffect(() => {
        // 알림 권한 확인
        checkNotificationPermission();

        // push 수신
        const receivePush = Notifications.addNotificationReceivedListener((response) => {});

        // push 클릭 이벤트
        const clickPushEvent = Notifications.addNotificationResponseReceivedListener((response) => {
            console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!');
            store.dispatch(dispatchOne('SET_LINK', true));
            store.dispatch(dispatchOne('SET_PARAMS', response.notification.request.content.data));
        });

        // background로 받을 때 처리를... 어떻게 하냐 todo

        return () => {
            receivePush.remove();
            clickPushEvent.remove();
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
