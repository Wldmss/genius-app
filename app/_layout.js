import { useEffect, useRef, useState } from 'react';
import { Provider } from 'react-redux';
import { StyleSheet, SafeAreaView, Alert } from 'react-native';
import PopModal from 'modal/PopModal';
import Contents from 'components/Contents';
import store from 'store/store';
import Constants from 'expo-constants';
import Loading from 'components/Loading';
import * as Notifications from 'expo-notifications';
import Push from 'utils/Push';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

function useNotification() {
    const [notification, setNotification] = useState(false);
    const notificationListener = useRef();
    const responseListener = useRef();

    useEffect(() => {
        notificationListener.current = Notifications.addNotificationReceivedListener((response) => {
            Alert.alert(response);
            setNotification(response);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
            console.log('---response----');
            console.log(response);
            Alert.alert(response);
        });

        return () => {
            Notifications.removeNotificationSubscription(notificationListener.current);
            Notifications.removeNotificationSubscription(responseListener.current);
        };
    }, []);
}

const App = () => {
    useNotification();

    return (
        <Provider store={store}>
            <SafeAreaView style={styles.container}>
                <Contents />
                <PopModal />
                <Loading />
                {/* <Push /> */}
                {/* <PushUtils /> */}
            </SafeAreaView>
        </Provider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Constants.statusBarHeight,
    },
});

export default App;
