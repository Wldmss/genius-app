import { useEffect, useState } from 'react';
import { StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Provider } from 'react-redux';
import store from 'store/store';

import { loadAsync } from 'expo-font';
import { Try } from 'expo-router/build/views/Try';
import { ErrorBoundary } from 'utils/ErrorBoundary';

import Constants from 'expo-constants';

import { pushStore, useNotification } from 'utils/Push';
import { pushFcmStore, useFirebase } from 'utils/PushFcm';

import PopModal from 'modal/PopModal';
import Loading from 'components/Loading';
import Splash from '(utils)/splash';
import Snackbar from 'utils/Snackbar';

import Contents from 'components/Contents';
import { apiStore } from 'api/Api';

import * as Updates from 'expo-updates';
import { backStore } from 'utils/BackUtils';

const { EXPO_PUBLIC_NAME, EXPO_PUBLIC_PROFILE } = process.env;

const splashTime = 2000;

/** layout (main) */
const App = () => {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [splashLoaded, setSplashLoaded] = useState(false);

    console.log('profile :: ', EXPO_PUBLIC_PROFILE);

    // expo-notification (사용 x)
    // useNotification();
    // pushStore(store);

    // firebase-messaging
    useFirebase();
    pushFcmStore(store);

    // api store
    apiStore(store);

    // back handler store
    backStore(store);

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
            if (EXPO_PUBLIC_PROFILE == 'production') {
                await onFetchUpdateAsync();
            } else {
                await new Promise((resolve) => setTimeout(resolve, splashTime));
            }
        } catch (e) {
            console.warn(e);
        } finally {
            setSplashLoaded(true);
        }
    };

    // 앱 업데이트 체크
    async function onFetchUpdateAsync() {
        try {
            const update = await Updates.checkForUpdateAsync();

            if (update.isAvailable) {
                Alert.alert(EXPO_PUBLIC_NAME, '업데이트 하시겠습니까?', [
                    { text: '아니요', onPress: () => null, style: 'cancel' },
                    {
                        text: '예',
                        onPress: async () => {
                            try {
                                await Updates.fetchUpdateAsync();
                                await Updates.reloadAsync();
                            } finally {
                                Alert.alert(`업데이트가 완료되었습니다.`);
                                // Updates.reloadAsync();
                            }
                        },
                    },
                ]);

                return true;
            }
        } catch (error) {
            Alert.alert(`${error}`);
        }
    }

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
                            <Snackbar />
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
