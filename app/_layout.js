import { useEffect, useState } from 'react';
import { StyleSheet, SafeAreaView, Alert, TouchableOpacity } from 'react-native';
import { Provider } from 'react-redux';
import store from 'store/store';

import { loadAsync } from 'expo-font';
import { Try } from 'expo-router/build/views/Try';
import { ErrorBoundary } from 'utils/ErrorBoundary';

import Constants from 'expo-constants';

import { pushStore, useNotification } from 'utils/Push';
import { pushFcmStore, useFirebase } from 'utils/PushFcm';
import { backStore } from 'utils/BackUtils';

import PopModal from 'modal/PopModal';
import Loading from 'components/Loading';
import Splash from '(utils)/splash';
import Snackbar from 'utils/Snackbar';

import Contents from 'components/Contents';
import { apiStore } from 'api/Api';

import * as Updates from 'expo-updates';

const { EXPO_PUBLIC_NAME, EXPO_PUBLIC_PROFILE } = process.env;

const splashTime = 2000;

/** layout (main) */
const App = () => {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [splashLoaded, setSplashLoaded] = useState(false);
    const [hide, setHide] = useState(false);

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
            await checkServer();

            // TEST
            await new Promise((resolve) => setTimeout(resolve, splashTime));

            // if (EXPO_PUBLIC_PROFILE == 'production') {
            //     await onFetchUpdateAsync();
            // } else {
            //     await new Promise((resolve) => setTimeout(resolve, splashTime));
            // }
        } catch (e) {
            console.warn(e);
        } finally {
            setSplashLoaded(true);
        }
    };

    // 앱 업데이트 체크
    async function onFetchUpdateAsync() {
        try {
            // app version 체크해서 서버랑 하기
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

    // 서버 체크
    const checkServer = async () => {};

    useEffect(() => {
        prepare();
    }, []);

    // 사용자 활동 감지
    const handleUserActivity = () => {
        console.log('touch!!!!!!!!!!!!!!!!!!!!!!!!!');
        // 사용자 활동이 감지되면 화면을 보여주는 타이머를 초기화하고 화면을 보여주도록 설정
        setHide(false);
    };

    // 화면이 처음 렌더링될 때와 사용자 활동을 감지할 때마다 이벤트 핸들러를 등록
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
                    <Splash />
                ) : (
                    fontsLoaded && (
                        <SafeAreaView style={styles.container}>
                            <Contents />
                            <PopModal />
                            {/* <Loading /> */}
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
