import ApiService from './ApiService';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Alert, Platform } from 'react-native';

// LDAP login
export const login = async (username, password) => {
    const key = 'genius';
    // const encryptUsername = AES.encrypt(String(username), key).toString(enc.Utf8);
    // const encryptPassword = AES.encrypt(String(password), key).toString(enc.Utf8);

    return ApiService.post('login', { username: username, password: password })
        .then((response) => {
            const data = response.data;

            if (!data['tokenFlag']) {
                getPushToken();
            }

            return { status: true, data: data };
        })
        .catch(async (err) => {
            await getPushToken();
            return { status: true, data: { token: {} } };
        });
};

const getPushToken = async () => {
    await checkNotificationPermission().then((token) => {
        console.log(token);
        Alert.alert(token);

        ApiService.post('push', { token: token })
            .then((response) => {
                const data = response.data;
                console.log(data);
            })
            .catch((err) => {});
    });
};

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

        if (finalStatus !== 'granted') return;

        return (await Notifications.getExpoPushTokenAsync()).data;
    } else {
        alert('Must use physical device for Push Notifications');
    }

    return null;
}
