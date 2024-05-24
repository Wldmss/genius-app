import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Alert, Platform, Linking, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSelector } from 'react-redux';
import store from 'store/store';
import { dispatchMultiple, dispatchOne } from 'utils/DispatchUtils';
import * as ScreenOrientation from 'expo-screen-orientation';
import { router } from 'expo-router';
import { backEventHandler } from 'utils/BackUtils';
import * as FileUtils from 'utils/FileUtils';
import Loading from 'components/Loading';
import ErrorPage from '(utils)/error';
import Constants from 'expo-constants';
import * as StorageUtils from 'utils/StorageUtils';
import ScanQR from '(utils)/camera';

const { profile } = Constants.expoConfig.extra;

/** web view */
const Web = () => {
    const isLink = useSelector((state) => state.commonReducer.isLink);
    const camera = useSelector((state) => state.commonReducer.camera);
    const params = useSelector((state) => state.commonReducer.params);
    const exitPressed = useSelector((state) => state.commonReducer.exitPressed);
    const webLink = useSelector((state) => state.commonReducer.webLink);
    const currentLink = useSelector((state) => state.commonReducer.currentLink);

    const webViewRef = useRef(null);

    const [backButtonEnabled, setBackButtonEnabled] = useState(false);
    const [hide, setHide] = useState(false);
    const [postData, setPostData] = useState({});
    const [init, setInit] = useState(false);

    let timeout = null;

    // webview 통신
    const handleOnMessage = (event) => {
        const { data } = event.nativeEvent;
        console.log('handleOnMessage');

        const sendData = JSON.parse(data);
        console.log(sendData);

        if (sendData.type) {
            switch (sendData.type) {
                case 'openCamera':
                    openCamera();
                    break;
                case 'changePin':
                    store.dispatch(dispatchMultiple({ SET_WEBPIN: true, SET_TAB: 'pin' }));
                    break;
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
                case 'download':
                    // webViewRef.current.stopLoading();
                    // window.location.href = sendData.url;
                    // Linking.openURL(sendData.url);
                    // FileUtils.handleDownloadRequest(sendData.url, webViewRef);
                    break;
                case 'downloadBtn':
                    webViewRef.current.stopLoading();
                    const url = 'http://192.168.50.254:8080/api/v1/file';
                    if (Linking.canOpenURL(url)) {
                        Linking.openURL(url);
                    } else {
                        Linking.addEventListener('url', url);
                    }
                    break;
                default:
                    break;
            }
        }
    };

    // 전체 화면 (상태바 숨김) (사용X)
    const enterFullscreen = () => {
        if (Platform.OS === 'android') {
            store.dispatch({ type: 'HIDE_BAR' });
        }

        handleScreen(true);
    };

    // 전체 화면 (상태바 숨김 해제) (사용X)
    const exitFullscreen = () => {
        if (Platform.OS === 'android') {
            store.dispatch({ type: 'SHOW_BAR' });
        }

        handleScreen();
    };

    // screen 가로/세로 모드 처리 (사용X)
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
    };

    // webview load
    const webViewLoaded = ({ nativeEvent }) => {
        console.log('webViewLoaded');
        console.log(nativeEvent);
        clearTimeout(timeout);
        store.dispatch(dispatchOne('SET_LOADING', false));
        setBackButtonEnabled(true);
        setHide(false);
        setInit(true);
    };

    // webview error
    const handleError = (syntheticEvent) => {
        if (syntheticEvent) {
            const { nativeEvent } = syntheticEvent;
            console.log('on error :: ');
            console.log(nativeEvent);
            setHide(true);
            store.dispatch(dispatchOne('SET_LOADING', false));
            // store.dispatch(dispatchOne('SET_TAB', 'error'));
        }
    };

    // Webview navigation state change
    const onNavigationStateChange = (navState) => {
        const { url, canGoBack } = navState;
        if (!url) return;

        let goBack = url.includes('portalMain.do') || url.includes('login.do') ? false : canGoBack;

        setBackButtonEnabled(goBack);
        changeUrl(url);
    };

    // webview 뒤로가기
    const goBack = () => {
        webViewRef.current.goBack();
    };

    // webview 앞으로 가기
    const goForward = () => {
        webViewRef.current.goForward(handleHide);
    };

    const handleHide = () => {
        setHide(false);
    };

    // for ios download
    const handleDownload = ({ nativeEvent }) => {
        const { downloadUrl } = nativeEvent;
        console.log(downloadUrl);
    };

    // onShouldStartLoadWithRequest
    const handleStartLoadWithRequest = (request) => {
        const { url } = request;
        changeUrl(url);
        return true;
    };

    const changeUrl = (url) => {
        if (url != currentLink) store.dispatch(dispatchOne('SET_CURRENTLINK', url));
    };

    useEffect(() => {
        console.log('is link :: ', isLink);
        let sendData = {
            // userid: 'test1001',
            // pwd: 'test100!',
            // url: '',
        };

        let link = null;

        if (isLink) {
            console.log(params);

            if (params && Object.keys(params).length > 0) {
                sendData = { ...sendData, ...params };
                // setPostData(sendData);

                if (Object.keys(params).includes('url')) {
                    link = params.url || '/main/portalMain.do';
                }

                if (params.link == 'checkIn') {
                    link = currentLink != null ? currentLink.replace(process.env.EXPO_PUBLIC_WEB, '') || '/main/portalMain.do' : '';
                }
            }
        }

        if (link != null) {
            console.log(link);
            store.dispatch(dispatchOne('SET_WEBLINK', link));
        }

        console.log(isLink ? '@@@@@@ is link @@@@@' : 'XXXXX not link xXXXXX');
        // todo QR 로그인 후 뭔가 해야함
    }, [isLink]);

    useEffect(() => {
        backEventHandler(timeout, goBack, backButtonEnabled);
    }, [backButtonEnabled, exitPressed, camera]);

    // web view 로드 오류 처리
    useEffect(() => {
        setBackButtonEnabled(false);
        store.dispatch(dispatchOne('SET_ACTIVE', true));
        store.dispatch(dispatchOne('SET_EXIT_PRESSED', false));

        timeout = setTimeout(() => {
            if (hide) {
                handleError();
            }
        }, 10000);

        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        // Alert.alert(webLink);
    }, [webLink]);

    useEffect(() => {
        // if (profile.includes('test') || profile.includes('development')) Alert.alert(`${profile}\n${process.env.EXPO_PUBLIC_WEB}${webLink}`);
        if (profile.includes('staging')) Alert.alert(`${process.env.EXPO_PUBLIC_WEB}${webLink}\nwebview 페이지 입니다.`);
    }, []);

    return camera ? (
        <ScanQR style={styles.camera} />
    ) : (
        <WebView
            ref={webViewRef}
            style={[styles.webview, hide ? styles.none : styles.flex]}
            source={{
                // uri: 'http://172.30.1.91:8080/file',
                // method: 'GET',
                uri: `${process.env.EXPO_PUBLIC_WEB}${webLink || ''}`,
                method: 'POST',
                body: JSON.stringify(postData),
            }}
            javaScriptEnabled={true}
            onLoadStart={() => !init && setHide(true)}
            onLoad={webViewLoaded}
            onMessage={handleOnMessage}
            onError={handleError}
            onNavigationStateChange={onNavigationStateChange}
            originWhitelist={['*']}
            onShouldStartLoadWithRequest={handleStartLoadWithRequest}
            javaScriptCanOpenWindowsAutomatically={true}
            injectedJavaScriptBeforeContentLoaded={`
                window.onerror = function(message, sourcefile, lineno, colno, error){
                    // alert("Message: " + message + "\\n\\nError: " + error);
                    return true;
                };
            `}
            injectedJavaScript={`
                window.addEventListener('click', function (event) {
                    if (event.target.tagName === 'A') {
                        const url = event.target.href;
                        window.ReactNativeWebView.postMessage(JSON.stringify({type : 'download', url: url}));
                        // event.preventDefault();
                    } else {
                        window.ReactNativeWebView.postMessage(JSON.stringify({type : event.target.id}));
                        // event.preventDefault();
                    }
                });
            `}
            startInLoadingState={true}
            renderLoading={() => <Loading />}
            renderError={(event) => {
                console.log('renderError');
                console.log(event);
                return <ErrorPage goBack={goBack} />;
            }}
            cacheEnabled={true}
            thirdPartyCookiesEnabled={true}
            sharedCookiesEnabled={true}
            androidLayerType="hardware"
            mixedContentMode="always"
            allowsFullscreenVideo={true} // 영상 전체보기 지원
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback={true} // 영상 inline (ios)
            keyboardDisplayRequiresUserAction={true} // keyboard 프로그래밍 맞춰서 (ios)
            allowsLinkPreview={true} // 링크 미리보기 (ios)
            pullToRefreshEnabled={true} // 당겨서 새로고침 (ios)
            allowsProtectedMedia={true} // drm 미디어 재생 (android)
            dataDetectorTypes="all" // 클릭 url 변환 (ios)
            allowsBackForwardNavigationGestures={true} // 스와이프 (ios)
            ignoreSilentHardwareSwitch={true} // 무음 스위치 활성화 (ios)
            lackPermissionToDownloadMessage="권한이 거부되어 파일을 다운로드할 수 없습니다"
            downloadingMessage="다운로드를 시작합니다."
            onFileDownload={handleDownload}
            automaticallyAdjustContentInsets={false}
            allowFileAccess={true}
            allowFileAccessFromFileURLs={true}
            allowUniversalAccessFromFileURLs={true}
            onOpenWindow={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                const { targetUrl } = nativeEvent;
                console.log('Intercepted OpenWindow for', targetUrl);
            }}
            onContentProcessDidTerminate={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.warn('Content process terminated, reloading', nativeEvent);
                // webViewRef.current.reload();
            }}
        />
    );
};

const styles = StyleSheet.create({
    container: {},
    webview: {
        backgroundColor: `#ffffff`,
    },
    flex: {
        flex: 1,
    },
    none: {
        display: `none`,
    },
    camera: {},
});

export default Web;
