import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import messaging from '@react-native-firebase/messaging';

const Push = () => {
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
                    console.log(token);
                });
        }

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
        const unsubscribe = messaging().onMessage(async (handlePushNotification) => {
            Alert.Alert('new massage!!', JSON.stringify(handlePushNotification));
        });

        // Clean up the event listeners
        return unsubscribe();
    }, []);

    return <View></View>;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default Push;
