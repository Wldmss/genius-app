import { useEffect } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as Device from 'expo-device';
import { dispatchMultiple, dispatchOne } from 'utils/DispatchUtils';
import { router } from 'expo-router';

/** expo-notification 관련 코드 (사용 x) */

export const pushStore = (_store) => {
    store = _store;
};

const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';
TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, ({ data, error, executionInfo }) => {
    // console.log('Received a notification in the background!');
    // console.log(data);
    if (error) {
        console.log(error);
    }
});

Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

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
            shouldSetBadge: !hasTrigger,
        };
    },
});

// foreground 알림용 스케줄러
export async function schedulePushNotification(remoteMessage) {
    const notification = remoteMessage.notification;
    const data = remoteMessage.data;

    const message = { ...notification, data: data };

    await Notifications.scheduleNotificationAsync({
        content: message,
        trigger: null,
        // trigger: { seconds: 1 },
    });
}

// push 토큰 발급
export async function getPushToken() {
    const notification = store.getState().commonReducer.notification;

    try {
        if (notification) {
            return (await Notifications.getDevicePushTokenAsync()).data;
        }

        return null;
    } catch (error) {
        console.log(error);
        return null;
    }
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

// web link 설정
function setLink(response) {
    const data = response?.notification?.request?.content?.data;
    store.dispatch(dispatchMultiple({ SET_PARAMS: data, SET_LINK: true, SET_TAB: 'main' }));
}

/** push 알림 설정 (expo-notification) */
export function useNotification() {
    const lastNotificationResponse = Notifications.useLastNotificationResponse();

    useEffect(() => {
        // 알림 권한 확인
        checkNotificationPermission();

        // push 수신
        const receivePush = Notifications.addNotificationReceivedListener((response) => {});

        // push 클릭 이벤트 (foreground)
        const clickPushEvent = Notifications.addNotificationResponseReceivedListener((response) => {
            // schedulePushNotification(response);
            // const actionIdentifier = response.actionIdentifier;
            // console.log(actionIdentifier);
            // Linking.openURL(response.notification.request.content.data.url);
        });

        // foreground 에서 받은 push fore/background 에서 클릭
        if (lastNotificationResponse) {
            setLink(lastNotificationResponse);
        }

        // background로 받을 때 처리를... 어떻게 하냐 todo

        return () => {
            receivePush.remove();
            clickPushEvent.remove();
        };
    }, [lastNotificationResponse]);
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
        to: token,
        title: notification.title,
        body: notification.body,
        // data: data,
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
    })
        .then((res) => {
            Alert.alert(JSON.stringify(res));
        })
        .catch(() => {
            Alert.alert(JSON.stringify(err));
        });
}
