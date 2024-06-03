import { useEffect, useState } from 'react';
import { StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Provider } from 'react-redux';
import store from 'store/store';

import { loadAsync } from 'expo-font';
import { Try } from 'expo-router/build/views/Try';
import { ErrorBoundary } from 'utils/ErrorBoundary';

import Constants from 'expo-constants';

// import { pushStore, useNotification } from 'utils/Push';
import { pushFcmStore, useFirebase } from 'utils/PushFcm';
import { backStore } from 'utils/BackUtils';

import PopModal from 'modal/PopModal';
import Splash from '(utils)/splash';
import Snackbar from 'utils/Snackbar';

import Contents from 'components/Contents';
import { apiStore } from 'api/Api';

import * as Updates from 'expo-updates';
import { checkVersion, loginApiStore } from 'api/LoginApi';

import * as StorageUtils from 'utils/StorageUtils';
import { dispatchOne } from 'utils/DispatchUtils';
import { apiFetchStore } from 'api/ApiFetch';
import Development from '(utils)/development';

const splashTime = 4000;
const { profile } = Constants.expoConfig.extra;

/** layout (main)
 * 최초 로드
 */
const App = () => {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [splashLoaded, setSplashLoaded] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);
    const [updateProgress, setUpdateProgress] = useState(0);
    const [version, setVersion] = useState(Constants.expoConfig.version);
    const [dev, setDev] = useState(false);

    console.log('profile :: ', profile);

    // expo-notification (사용 x)
    // useNotification();
    // pushStore(store);

    // firebase-messaging
    useFirebase();
    pushFcmStore(store);

    // api store
    apiFetchStore(store);
    apiStore(store);
    loginApiStore(store);

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

    // 개발자 모드 체크
    const checkDevelopment = async () => {
        const isDev = await StorageUtils.getDeviceData('isDev');
        const devFlag = isDev != null && isDev == 'true';

        setDev(devFlag);
        store.dispatch(dispatchOne('SET_DEV', devFlag));
    };

    // 서버 체크
    const serverCheck = async () => {
        return await checkVersion().then((result) => {
            if (result) {
                Alert.alert(process.env.EXPO_PUBLIC_NAME, '앱을 업데이트 합니다.', [
                    {
                        text: '예',
                        onPress: () => {
                            // 앱 자동 업데이트 tODO
                            Alert.alert('업데이트');
                        },
                    },
                ]);
            }
            return true;
        });
    };

    // 앱 업데이트 체크
    /** runTimeVersion이 동일해야 업데이트가 가능함 */
    async function onFetchUpdateAsync() {
        try {
            const update = await Updates.checkForUpdateAsync(); // 업데이트 확인

            if (update.isAvailable) {
                try {
                    setVersion(update.manifest.runtimeVersion);
                    setIsUpdate(true);
                    await Updates.fetchUpdateAsync(); // 업데이트 다운로드 (expo-updates)
                    setSplashLoaded(true);
                } finally {
                    setIsUpdate(false);
                    // Alert.alert(process.env.EXPO_PUBLIC_NAME, '업데이트 되었습니다.\n앱을 다시 시작합니다.', [
                    //     {
                    //         text: '확인',
                    //         onPress: async () => {
                    //             await Updates.reloadAsync();
                    //         },
                    //     },
                    // ]);
                    await Updates.reloadAsync();
                }
            }
        } catch (error) {
            console.log(error);
        } finally {
            setSplashLoaded(true);
        }
    }

    // splash
    const prepare = async () => {
        try {
            loadFonts();
            await checkDevelopment();
            await serverCheck();

            await new Promise((resolve) => setTimeout(resolve, splashTime)).then(async () => {
                if (profile != 'preview' && profile != 'development') {
                    await onFetchUpdateAsync();
                } else {
                    setSplashLoaded(true);
                }
            });
        } catch (e) {
            console.warn(e);
        }
    };

    useEffect(() => {
        prepare();
    }, []);

    return (
        <Try catch={ErrorBoundary}>
            <Provider store={store}>
                <Splash isUpdate={isUpdate} updateProgress={updateProgress} version={version} />
                {splashLoaded && fontsLoaded && (
                    <SafeAreaView style={styles.container}>
                        <Development isDev={dev} />
                        <Contents />
                        <PopModal />
                        <Snackbar />
                    </SafeAreaView>
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
