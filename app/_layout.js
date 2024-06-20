import { useEffect, useState } from 'react';
import { StyleSheet, SafeAreaView, Alert, Linking, Text, TextInput } from 'react-native';
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
import Test from '(screens)/test';
import BackHeader from '(utils)/back';
import { alertStore } from 'utils/AlertUtils';
import { fileStore } from 'utils/FileUtils';
import * as ScreenOrientation from 'expo-screen-orientation';
import Loading from 'components/Loading';

const splashTime = 2000;
const { profile, isTest } = Constants.expoConfig.extra;

/** layout (main)
 * 최초 로드
 */
const App = () => {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [splashLoaded, setSplashLoaded] = useState(false);
    const [prepareLoaded, setPrepareLoaded] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);
    const [updateProgress, setUpdateProgress] = useState(0);
    const [version, setVersion] = useState(Constants.expoConfig.version);
    const [dev, setDev] = useState(false);
    const [ready, setReady] = useState(false);

    console.log('profile :: ', profile);

    // 세로 모드 고정
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);

    // 시스템 font size 적용 방지
    Text.defaultProps = Text.defaultProps || {};
    Text.defaultProps.allowFontScaling = false;

    TextInput.defaultProps = TextInput.defaultProps || {};
    TextInput.defaultProps.allowFontScaling = false;

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

    // alert store
    alertStore(store);

    // file store
    fileStore(store);

    // font load
    const loadFonts = async () => {
        try {
            await loadAsync({
                NotoSans: require('assets/fonts/NotoSansKR-Regular.ttf'),
            }).finally(() => {
                setFontsLoaded(true);
            });
        } catch (error) {
            console.log(error);
        }
    };

    // 개발자 모드 체크
    const checkDevelopment = async () => {
        if (isTest) {
            const isDev = await StorageUtils.getDeviceData('isDev');
            const devFlag = isDev != null && isDev == 'true';

            setDev(devFlag);
            store.dispatch(dispatchOne('SET_DEV', devFlag));
        }
    };

    // 서버 체크
    const serverCheck = async () => {
        if (profile != 'production') {
            setReady(true);
            // 테스트 용 앱 업그레이드
            const update = false;
            if (update) {
                Alert.alert(process.env.EXPO_PUBLIC_NAME, '업데이트가 있습니다.\n다운로드 페이지로 이동합니다.', [
                    {
                        text: '확인',
                        onPress: () => {
                            Linking.openURL(`${process.env.TEST_URL}/download`);
                        },
                    },
                ]);
            }
        } else {
            await checkVersion().then((result) => {
                setReady(result.status);

                if (result && result.status && result.update) {
                    Alert.alert(process.env.EXPO_PUBLIC_NAME, '앱을 업데이트 합니다.', [
                        {
                            text: '예',
                            onPress: async () => {
                                const updateUrl = process.env.UPDATE_URL;
                                if (await Linking.canOpenURL(updateUrl)) Linking.openURL(updateUrl);
                            },
                        },
                    ]);
                }
            });
        }
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
                    Alert.alert(process.env.EXPO_PUBLIC_NAME, '업데이트 되었습니다.\n앱을 다시 시작합니다.', [
                        {
                            text: '확인',
                            onPress: async () => {
                                await Updates.reloadAsync();
                            },
                        },
                    ]);
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
            await loadFonts();
            await checkDevelopment();
            await serverCheck();
            setPrepareLoaded(true);

            new Promise((resolve) => setTimeout(resolve, splashTime)).then(async () => {
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

    useEffect(() => {
        if (prepareLoaded && splashLoaded) setLoaded(true);
    }, [prepareLoaded, splashLoaded]);

    return (
        <Try catch={ErrorBoundary}>
            <Provider store={store}>
                <Splash isUpdate={isUpdate} updateProgress={updateProgress} version={version} />
                {ready && loaded && fontsLoaded && (
                    <SafeAreaView style={styles.container}>
                        <BackHeader />
                        <Development isDev={dev} />
                        <Contents />
                        {/* <Test /> */}
                        <PopModal />
                        <Snackbar />
                        <Loading show={false} />
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
