import { useEffect } from 'react';
import { Alert } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import store from 'store/store';
import { dispatchOne } from './DispatchUtils';

/** FCM push 알림 설정 */
export default function PushFcm() {
    const requestUserPermission = async () => {
        const authStatus = await messaging().requestPermission();
        const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
            console.log('Authorization status:', authStatus);
        }
    };

    useEffect(() => {
        if (requestUserPermission()) {
            messaging()
                .getToken()
                .then((token) => {
                    // Alert.alert('fcm token :: ', token);
                    store.dispatch(dispatchOne('SET_TEST', token));
                    console.log(token);
                });
        }

        // Check if the app was opened from a notification (when the app was completely quit)
        messaging()
            .getInitialNotification()
            .then(async (remoteMessage) => {
                if (remoteMessage) {
                    Alert.alert('Notification caused app to open from quit state:', JSON.stringify(remoteMessage.notification));
                    console.log('Notification caused app to open from quit state:', remoteMessage.notification);
                }
            });

        // Handle user opening the app from a notification (when the app is in the background)
        messaging().onNotificationOpenedApp(async (remoteMessage) => {
            console.log('Notification caused app to open from background state:', remoteMessage.data.screen, navigation);
        });

        // Handle push notifications when the app is in the background
        messaging().setBackgroundMessageHandler(async (remoteMessage) => {
            Alert.alert('Message handled in the background!', JSON.stringify(remoteMessage));
            console.log('Message handled in the background!', remoteMessage);
        });

        // Listen for push notifications when the app is in the foreground
        messaging().onMessage(async (handlePushNotification) => {
            Alert.alert('new massage!!', JSON.stringify(handlePushNotification));
        });

        // Clean up the event listeners
        // return unsubscribe();
    }, []);
}
