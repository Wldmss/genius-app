import { useEffect, useState } from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { Provider } from 'react-redux';
import store from 'store/store';

import { loadAsync } from 'expo-font';
import { Try } from 'expo-router/build/views/Try';
import { ErrorBoundary } from 'utils/ErrorBoundary';

import Contents from 'components/Contents';
import Constants from 'expo-constants';

import { useNotification } from 'utils/Push';
import * as Notifications from 'expo-notifications';

import PopModal from 'modal/PopModal';
import Loading from 'components/Loading';
import Splash from '(screens)/splash';
// import PushFcm from 'utils/PushFcm';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

const splashTime = 2000;

/** layout (main) */
const App = () => {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [splashLoaded, setSplashLoaded] = useState(false);

    useNotification();
    console.log('profile :: ', process.env.EXPO_PUBLIC_PROFILE);

    // font load
    const loadFonts = async () => {
        await loadAsync({
            NotoSans: require('assets/fonts/NotoSansKR-Regular.ttf'),
        }).finally(() => {
            setFontsLoaded(true);
        });
    };

    // splash
    const prepare = async () => {
        try {
            loadFonts();
            await new Promise((resolve) => setTimeout(resolve, splashTime));
        } catch (e) {
            console.warn(e);
        } finally {
            setSplashLoaded(true);
        }
    };

    useEffect(() => {
        prepare();
    }, []);

    return (
        <Try catch={ErrorBoundary}>
            <Provider store={store}>
                {!splashLoaded ? (
                    <Splash />
                ) : (
                    fontsLoaded && (
                        <SafeAreaView style={styles.container}>
                            <Contents />
                            <PopModal />
                            <Loading />
                            {/* <PushFcm /> */}
                        </SafeAreaView>
                    )
                )}
            </Provider>
        </Try>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Constants.statusBarHeight,
    },
});

export default App;
