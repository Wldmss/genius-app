import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, BackHandler, Alert, Platform, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSelector } from 'react-redux';
import store from 'store/store';
import { dispatchOne } from 'utils/DispatchUtils';
import * as NavigateUtils from 'utils/NavigateUtils';
import * as ScreenOrientation from 'expo-screen-orientation';

const Web = () => {
    const isLink = useSelector((state) => state.loginReducer.isLink);
    const token = useSelector((state) => state.loginReducer.token);
    const tab = useSelector((state) => state.loginReducer.tab);

    const webViewRef = useRef(null);

    const [backButtonEnabled, setBackButtonEnabled] = useState(false);

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
            // store.dispatch(dispatchOne('SET_STATUS_BAR', true));
            StatusBar.setHidden(true);
        }

        handleScreen(true);
    };

    // 전체 화면 (상태바 숨김 해제)
    const exitFullscreen = () => {
        if (Platform.OS === 'android') {
            StatusBar.setHidden(false);
            // store.dispatch(dispatchOne('SET_STATUS_BAR', false));
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
        Alert.alert(
            '로그아웃',
            '로그아웃 하시겠습니까?',
            [
                { text: '아니요', onPress: () => null, style: 'cancel' },
                { text: '예', onPress: () => store.dispatch(dispatchOne('SET_TOKEN', null)) },
            ],
            { cancelable: false }
        );
    };

    // Webview 뒤로가기 처리
    const webViewLoaded = () => {
        setBackButtonEnabled(true);
    };

    // 앱 종료
    const closeGenius = () => {
        BackHandler.exitApp();
    };

    useEffect(() => {
        console.log(isLink);
        if (isLink) BackHandler.exitApp();
        // todo QR 로그인 후 뭔가 해야함
    }, [isLink]);

    useEffect(() => {
        // Handle back event
        const backHandler = () => {
            if (backButtonEnabled) {
                webViewRef.current.goBack();
                return true;
            } else {
                Alert.alert(
                    '앱 종료',
                    'GENIUS를 종료하시겠습니까?',
                    [
                        { text: '아니요', onPress: () => null, style: 'cancel' },
                        { text: '예', onPress: () => closeGenius() },
                    ],
                    { cancelable: false }
                );
                return true;
            }
        };
        // Subscribe to back state event
        BackHandler.addEventListener('hardwareBackPress', backHandler);

        // Unsubscribe
        return () => BackHandler.removeEventListener('hardwareBackPress', backHandler);
    }, [backButtonEnabled]);

    useEffect(() => {
        if (token == null) {
            store.dispatch(NavigateUtils.routeDispatch('main'));
        }
    }, [token]);

    useEffect(() => {
        if (tab == 'WEB') setBackButtonEnabled(false);
    }, [tab]);

    return (
        <WebView
            ref={webViewRef}
            style={styles.webview}
            onLoad={webViewLoaded}
            // source={{ uri: 'http://172.24.27.254:8080' }}
            source={{ uri: 'https://naver.com' }}
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
