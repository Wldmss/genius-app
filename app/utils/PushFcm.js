import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { dispatchOne } from './DispatchUtils';
import { FontText } from './TextUtils';

export const pushFcmStore = (_store) => {
    store = _store;
};

// push 토큰 발급
export async function getMessagingToken() {
    const notification = store.getState().commonReducer.notification;

    if (notification) {
        return await messaging().getToken();
    }

    return null;
}

// push 권한 확인 - 안됨
const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    console.log('Authorization status:', enabled);
    store.dispatch(dispatchOne('SET_NOTIFICATION', enabled));
};

// push 권한 확인 (expo-notification)
export async function checkNotificationPermission() {
    // 채널 설정 (알림 카테고리)
    if (Platform.OS === 'android') {
        // Notifications.deleteNotificationChannelAsync('expo_notifications_fallback_notification_channel');    // 채널 삭제 (channelId)

        await Notifications.setNotificationChannelAsync('default', {
            name: '알림',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: `#ffffff`,
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

/** FCM push 알림 설정 */
export function useFirebase() {
    useEffect(() => {
        // 알림 권한 확인
        checkNotificationPermission();

        // 알림 topic 구독
        subscribeToTopic('snack');

        // Check if the app was opened from a notification (when the app was completely quit)
        messaging()
            .getInitialNotification()
            .then(async (remoteMessage) => {
                if (remoteMessage) {
                    console.log('Notification caused app to open from quit state:', remoteMessage.notification);
                }
            });

        // Handle user opening the app from a notification (when the app is in the background)
        messaging().onNotificationOpenedApp(async (remoteMessage) => {
            console.log('Notification caused app to open from background state:', remoteMessage.data.screen, navigation);
        });

        // Handle push notifications when the app is in the background
        messaging().setBackgroundMessageHandler(async (remoteMessage) => {
            console.log('Message handled in the background!', remoteMessage);
        });

        // Listen for push notifications when the app is in the foreground
        const unsubscribe = messaging().onMessage(async (remoteMessage) => {
            // Alert.alert('new massage!!', JSON.stringify(remoteMessage));
            console.log('new massage!!', JSON.stringify(remoteMessage));
            // handleForegroundPush();

            // if (Platform.OS === 'ios') {
            //     PushNotificationIOS.presentLocalNotification({
            //         alertTitle: remoteMessage.notification.title,
            //         alertBody: remoteMessage.notification.body,
            //     });
            // }
        });

        // Clean up the event listeners
        return unsubscribe;
    }, []);
}

const styles = StyleSheet.create({
    snack: {},
    title: {
        color: `#fff`,
    },
    body: { color: `#fff`, fontSize: 12 },
});
