import { useEffect, useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { dispatchOne } from 'utils/DispatchUtils';
import store from 'store/store';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

async function checkNotificationPermission() {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        store.dispatch(dispatchOne('SET_NOTIFICATION', finalStatus == 'granted'));
    }

    return null;
}

async function sendPushNotification(token) {
    const message = {
        to: token,
        sound: 'default',
        title: 'Original Title',
        body: 'And here is the body!',
        data: { someData: 'goes here' },
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

/** push 알림 설정 (expo-notification) */
export function useNotification() {
    const [notification, setNotification] = useState(false);
    const notificationListener = useRef();
    const responseListener = useRef();

    useEffect(() => {
        checkNotificationPermission();

        notificationListener.current = Notifications.addNotificationReceivedListener((response) => {
            Alert.alert('add!!');
            console.log('add!!');
            setNotification(response);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
            Alert.alert('response!!');
            console.log('response!!');
        });

        return () => {
            Notifications.removeNotificationSubscription(notificationListener.current);
            Notifications.removeNotificationSubscription(responseListener.current);
        };
    }, []);
}
