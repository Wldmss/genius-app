import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { dispatchMultiple, dispatchOne } from './DispatchUtils';
import { FontText } from './TextUtils';

// react-native-firebase/messaging

export const pushFcmStore = (_store) => {
    store = _store;
};

// foreground alert
Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
        return {
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
        };
    },
});

// push 토큰 발급
export async function getMessagingToken() {
    const notification = store.getState().commonReducer.notification;

    if (notification) {
        return await messaging().getToken();
    }

    return null;
}

// push 권한 확인 (ios)
const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission({
        badge: true,
        carPlay: true,
    });
    const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    console.log('Authorization status:', enabled);
    store.dispatch(dispatchOne('SET_NOTIFICATION', enabled));
};

// push 권한 확인
export async function checkNotificationPermission() {
    // 채널 설정 (알림 카테고리)
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: '알림',
            importance: Notifications.AndroidImportance.MAX,
        });

        checkPermission();
    }

    if (Platform.OS == 'ios') {
        requestUserPermission();
    }
}

// 권한 설정 (expo-notification)
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

// foreground push snack
const handleForegroundPush = () => {
    const notification = remoteMessage.notification;
    store.dispatch(
        dispatchOne(
            'SET_SNACK',
            <View style={styles.snack}>
                <FontText style={styles.title}>{notification.title}</FontText>
                <FontText style={styles.body}>{notification.body}</FontText>
            </View>
        )
    );
};

// 기기별로 특정 토픽을 구독하는 함수
async function subscribeToTopic(topic) {
    await messaging().subscribeToTopic(topic);
}

// 기기별로 특정 토픽을 구독 해제하는 함수
async function unsubscribeFromTopic(topic) {
    await messaging().unsubscribeFromTopic(topic);
}

// foreground 알림용 스케줄러
async function schedulePushNotification(notification, data) {
    const message = {
        title: notification.title,
        body: notification.body,
        data: data,
        color: process.env.EXPO_PUBLIC_PUSH_COLOR,
    };

    await Notifications.scheduleNotificationAsync({
        content: message,
        trigger: null,
        // trigger: { seconds: 1 },
    });
}

// 메시지 링크 설정
function clickMessage(data) {
    if (Platform.OS === 'ios') {
        Notifications.setBadgeCountAsync(0);
    }
    store.dispatch(dispatchMultiple({ SET_PARAMS: data, SET_LINK: true }));
}

/** FCM push 알림 설정 */
export function useFirebase() {
    useEffect(() => {
        // 알림 권한 확인
        checkNotificationPermission();

        // 알림 topic 구독
        subscribeToTopic('snack');

        // (클릭) 앱 종료
        messaging()
            .getInitialNotification()
            .then(async (remoteMessage) => {
                if (remoteMessage) {
                    clickMessage(remoteMessage?.data);
                }
            });

        // (클릭) background
        messaging().onNotificationOpenedApp(async (remoteMessage) => {
            clickMessage(remoteMessage?.data);
        });

        // (수신) background
        messaging().setBackgroundMessageHandler(async (remoteMessage) => {
            console.log(remoteMessage);
            return false;
        });

        // (수신) foreground
        const unsubscribe = messaging().onMessage(async (remoteMessage) => {
            if (remoteMessage?.notification) schedulePushNotification(remoteMessage.notification, remoteMessage.data);
        });

        // (클릭) fore/background, quit
        const clickPushEvent = Notifications.addNotificationResponseReceivedListener((response) => {
            clickMessage(response?.notification?.request?.content?.data);
        });

        return () => {
            unsubscribe;
            clickPushEvent.remove();
        };
    }, []);
}

const styles = StyleSheet.create({
    snack: {},
    title: {
        color: `#fff`,
    },
    body: { color: `#fff`, fontSize: 12 },
});
