import { useEffect, useState } from 'react';
import { StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Provider } from 'react-redux';
import store from 'store/store';

import { loadAsync } from 'expo-font';
import { Try } from 'expo-router/build/views/Try';
import { ErrorBoundary } from 'utils/ErrorBoundary';

import Constants from 'expo-constants';

import { pushStore, useNotification } from 'utils/Push';
// import { pushFcmStore, useFirebase } from 'utils/PushFcm';
import { backStore } from 'utils/BackUtils';

import PopModal from 'modal/PopModal';
import Splash from '(utils)/splash';
import Snackbar from 'utils/Snackbar';

import Contents from 'components/Contents';
import { apiStore } from 'api/Api';

import * as Updates from 'expo-updates';
import { checkVersion, loginApiStore } from 'api/LoginApi';

const splashTime = 2000;
const { profile } = Constants.expoConfig.extra;

/** layout (main) */
const App = () => {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [splashLoaded, setSplashLoaded] = useState(false);
    const [hide, setHide] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);
    const [updateProgress, setUpdateProgress] = useState(0);
    const [version, setVersion] = useState(Constants.expoConfig.version);

    console.log('profile :: ', profile);
    console.log(process.env.GOOGLE_SERVICES_JSON);

    // expo-notification
    useNotification();
    pushStore(store);

    // firebase-messaging (사용 x : ios 빌드 안됨)
    // useFirebase();
    // pushFcmStore(store);

    // api store
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

    // splash
    const prepare = async () => {
        try {
            loadFonts();
            serverCheck();

            if (profile != 'preview' && profile != 'development') {
                await onFetchUpdateAsync(true);
            } else {
                await new Promise((resolve) => setTimeout(resolve, splashTime)).then(() => {
                    setSplashLoaded(true);
                });
            }
        } catch (e) {
            console.warn(e);
        }
    };

    // 앱 업데이트 체크
    /** runTimeVersion이 동일해야 업데이트가 가능함 */
    async function onFetchUpdateAsync(flag) {
        try {
            const update = await Updates.checkForUpdateAsync(); // 업데이트 확인

            if (flag && update.isAvailable) {
                try {
                    setVersion(update.manifest.runtimeVersion);
                    setIsUpdate(true);
                    await Updates.fetchUpdateAsync(); // 업데이트 다운로드 (expo-updates)
                    setSplashLoaded(true);
                } finally {
                    setIsUpdate(false);
                    await Updates.reloadAsync();
                }
            }
        } catch (error) {
            console.log(error);
        } finally {
            setSplashLoaded(true);
        }
    }

    // 서버 체크
    const serverCheck = async () => {
        return await checkVersion().then((result) => {
            if (result) {
                Alert.alert(process.env.EXPO_PUBLIC_NAME, '앱을 업데이트 합니다.', [
                    {
                        text: '예',
                        onPress: async () => {
                            // 앱 자동 업데이트 tODO
                            Alert.alert('업데이트');
                        },
                    },
                ]);
            }
            return true;
        });
    };

    useEffect(() => {
        prepare();
    }, []);

    // 사용자 활동 감지 (사용 x)
    const handleUserActivity = () => {
        console.log('touch!!!!!!!!!!!!!!!!!!!!!!!!!');
        // 사용자 활동이 감지되면 화면을 보여주는 타이머를 초기화하고 화면을 보여주도록 설정
        setHide(false);
    };

    // 화면이 처음 렌더링될 때와 사용자 활동을 감지할 때마다 이벤트 핸들러를 등록 (사용 x)
    useEffect(() => {
        console.log('hide value!');
        console.log(hide);
        if (fontsLoaded && !hide) {
            const activityListener = setInterval(() => {
                // 일정 간격마다 사용자 활동을 확인
                // 사용자 활동이 없는 경우 화면을 숨김
                console.log('hide!!');
                setHide(true);
            }, 60000); // 60초 후에 화면을 숨김

            return () => {
                clearInterval(activityListener); // 컴포넌트가 언마운트될 때 타이머 제거
            };
        }
    }, [hide, fontsLoaded]);

    return (
        <Try catch={ErrorBoundary}>
            <Provider store={store}>
                {!splashLoaded ? (
                    <Splash isUpdate={isUpdate} updateProgress={updateProgress} version={version} />
                ) : (
                    fontsLoaded && (
                        <SafeAreaView style={styles.container}>
                            <Contents />
                            <PopModal />
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
