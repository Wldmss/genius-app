import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, BackHandler, Alert, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSelector } from 'react-redux';
import store from 'store/store';
import { dispatchOne } from 'utils/DispatchUtils';
import * as ScreenOrientation from 'expo-screen-orientation';
import { router } from 'expo-router';

/** web view */
const Web = () => {
    const isLink = useSelector((state) => state.commonReducer.isLink);
    const camera = useSelector((state) => state.commonReducer.camera);
    const params = useSelector((state) => state.commonReducer.params);

    const webViewRef = useRef(null);

    const [backButtonEnabled, setBackButtonEnabled] = useState(false);
    const [exitPressed, setExitPressed] = useState(false);
    let timeout = null;

    // webview 통신
    const handleOnMessage = (event) => {
        const data = event.nativeEvent.data;
        console.log(data);

        switch (data) {
            case 'enterFullscreen':
                enterFullscreen();
                break;
            case 'exitFullscreen':
                exitFullscreen();
                break;
            case 'logout':
                doLogout();
                break;
            case 'openCamera':
                openCamera();
                break;
            case 'test':
                console.log('TEST');
                break;
            default:
                break;
        }
    };

    // Webview navigation state change
    const onNavigationStateChange = (navState) => {
        setBackButtonEnabled(navState.canGoBack);

        if (!navState.loading) {
            exitFullscreen();
        }
    };

    // 전체 화면 (상태바 숨김)
    const enterFullscreen = () => {
        if (Platform.OS === 'android') {
            store.dispatch({ type: 'HIDE_BAR' });
        }

        handleScreen(true);
    };

    // 전체 화면 (상태바 숨김 해제)
    const exitFullscreen = () => {
        if (Platform.OS === 'android') {
            store.dispatch({ type: 'SHOW_BAR' });
        }

        handleScreen();
    };

    // screen 가로/세로 모드 처리
    const handleScreen = async (landscape) => {
        const type = landscape ? ScreenOrientation.OrientationLock.LANDSCAPE : ScreenOrientation.OrientationLock.PORTRAIT;
        await ScreenOrientation.lockAsync(type);
    };

    // 로그 아웃
    const doLogout = () => {
        Alert.alert('로그아웃', '로그아웃 하시겠습니까?', [
            { text: '아니요', onPress: () => null, style: 'cancel' },
            {
                text: '예',
                onPress: () => {
                    store.dispatch({ type: 'INIT_APP' });
                },
            },
        ]);
        return true;
    };

    // 카메라 열기
    const openCamera = () => {
        store.dispatch(dispatchOne('SET_CAMERA', true));
        router.push('camera');
    };

    // webview load
    const webViewLoaded = () => {
        clearTimeout(timeout);
        store.dispatch(dispatchOne('SET_LOADING', false));
        setBackButtonEnabled(true);
    };

    // webview error
    const handleError = () => {
        store.dispatch(dispatchOne('SET_LOADING', false));
        store.dispatch(dispatchOne('SET_TAB', 'error'));
    };

    useEffect(() => {
        if (isLink) {
            Alert.alert('is linked!!');
            console.log(params);
        }
        console.log(isLink ? '@@@@@@ is link @@@@@' : 'XXXXX not link xXXXXX');
        // todo QR 로그인 후 뭔가 해야함
    }, [isLink]);

    useEffect(() => {
        // Handle back event
        const backHandler = () => {
            if (backButtonEnabled) {
                webViewRef.current.goBack();
            } else if (camera) {
                store.dispatch(dispatchOne('SET_CAMERA', false));
                router.back();
            } else {
                if (exitPressed) {
                    store.dispatch(dispatchOne('SET_EXIT', true));
                    clearTimeout(timeout);
                } else {
                    store.dispatch(dispatchOne('SET_SNACK', '버튼을 한 번 더 누르면 종료됩니다.'));
                    setExitPressed(true);

                    timeout = setTimeout(() => {
                        setExitPressed(false);
                    }, 2000);

                    return () => clearTimeout(timeout);
                }
            }

            return true;
        };
        // Subscribe to back state event
        BackHandler.addEventListener('hardwareBackPress', backHandler);

        // Unsubscribe
        return () => BackHandler.removeEventListener('hardwareBackPress', backHandler);
    }, [backButtonEnabled, camera, exitPressed]);

    useEffect(() => {
        setBackButtonEnabled(false);
        setExitPressed(false);

        timeout = setTimeout(() => {
            handleError();
        }, 10000);

        return () => clearTimeout(timeout);
    }, []);

    return (
        <WebView
            ref={webViewRef}
            style={styles.webview}
            onLoad={webViewLoaded}
            onError={handleError}
            source={{
                uri: 'https://naver.com',
                // uri: process.env.EXPO_PUBLIC_WEB,
                // headers: {
                //     Authorization: `Bearer ${token}`,
                // },
            }}
            onNavigationStateChange={onNavigationStateChange}
            onMessage={handleOnMessage}
            injectedJavaScript={`
                window.addEventListener('click', function (event) {
                    window.ReactNativeWebView.postMessage(event.target.id);
                });
            `}
            // onShouldStartLoadWithRequest={(e) => FileUtils.handleDownloadRequest(e, webViewRef)}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        border: `1px solid red`,
    },
    webview: {
        flex: 1,
        border: `1px solid orange`,
    },
});

export default Web;
