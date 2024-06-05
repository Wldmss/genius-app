import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Alert, Platform, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSelector } from 'react-redux';
import Constants from 'expo-constants';
import { commonStyles } from 'assets/styles';
import { dispatchMultiple, dispatchOne } from 'utils/DispatchUtils';
import { backEventHandler } from 'utils/BackUtils';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as WebBrowser from 'expo-web-browser';
import * as Updates from 'expo-updates';
import Loading from 'components/Loading';
import ErrorPage from '(utils)/error';
import Camera from '(utils)/camera';

const { profile } = Constants.expoConfig.extra;

/** web view */
const Web = () => {
    const isLink = useSelector((state) => state.commonReducer.isLink);
    const camera = useSelector((state) => state.commonReducer.camera);
    const params = useSelector((state) => state.commonReducer.params);
    const exitPressed = useSelector((state) => state.commonReducer.exitPressed);
    const webLink = useSelector((state) => state.commonReducer.webLink);
    const currentLink = useSelector((state) => state.commonReducer.currentLink);
    const isDev = useSelector((state) => state.commonReducer.isDev);

    const webViewRef = useRef(null);

    const [backButtonEnabled, setBackButtonEnabled] = useState(false);
    const [hide, setHide] = useState(false);
    const [init, setInit] = useState(false);
    const [webUrl, setWebUrl] = useState(process.env.WEB_URL);

    let timeout = null;

    // webview 통신
    const handleOnMessage = (event) => {
        const { data } = event.nativeEvent;
        console.log('handleOnMessage');

        const sendData = JSON.parse(data);
        console.log(sendData);

        if (sendData.type) {
            switch (sendData.type) {
                case 'openCamera': // QR 체크인
                    openCamera();
                    break;
                case 'changePin': // PIN 변경
                    store.dispatch(dispatchMultiple({ SET_WEBPIN: true, SET_TAB: 'pin' }));
                    break;
                case 'changeBio': // 생체인증 변경
                    store.dispatch(dispatchMultiple({ SET_WEBBIO: true, SET_TAB: 'bio' }));
                    break;
                case 'endSession': // 세션 만료
                    endSession();
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
        Alert.alert(process.env.EXPO_PUBLIC_NAME, '로그아웃 하시겠습니까?', [
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

    // webview 뒤로가기
    const goBack = () => {
        if (backButtonEnabled) {
            webViewRef.current.goBack();
        } else {
            Alert.alert(process.env.EXPO_PUBLIC_NAME, `로그아웃 됩니다.`, [
                {
                    text: '확인',
                    onPress: () => {
                        store.dispatch({ type: 'INIT_APP' });
                    },
                },
            ]);
        }
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
        Alert.alert('다운로드 기능 준비중입니다.');
    };

    // Webview navigation state change
    const onNavigationStateChange = (navState) => {
        const { url, canGoBack } = navState;
        if (!url) return;

        let goBack = url.includes('portalMain.do') || url.includes('login.do') ? false : canGoBack;
        setBackButtonEnabled(goBack);
    };

    // onShouldStartLoadWithRequest
    const handleStartLoadWithRequest = (request) => {
        const { url } = request;

        if (checkUrl(url)) {
            changeUrl(url);
            return true;
        } else {
            return false;
        }
    };

    // url 확인
    const checkUrl = (url) => {
        console.log(url);
        if (url.includes('popupKyobo.do')) {
            openWindow(url);

            return false;
        }

        return true;
    };

    const changeUrl = (url) => {
        if (url != currentLink) store.dispatch(dispatchOne('SET_CURRENTLINK', url));
    };

    // window.open intercept
    const openWindow = async (targetUrl, inAppFlag) => {
        const canOpen = Linking.canOpenURL(targetUrl);

        if (!inAppFlag && canOpen) {
            Linking.openURL(targetUrl);
        } else {
            await WebBrowser.openBrowserAsync(targetUrl, {
                toolbarColor: 'white', // 안드로이드 옵션
                controlsColor: 'white', // iOS 옵션
                dismissButtonStyle: 'close', // iOS 옵션
                readerMode: false, // iOS 옵션
                enableBarCollapsing: true, // iOS 옵션
            });
        }
    };

    // 세션 만료
    const endSession = () => {
        Alert.alert(
            process.env.EXPO_PUBLIC_NAME,
            `세션이 만료되었습니다.\n로그인 페이지로 이동합니다.`,
            [
                {
                    text: '확인',
                    onPress: () => {
                        Updates.reloadAsync();
                    },
                },
            ],
            { cancelable: false }
        );
    };

    useEffect(() => {
        let link = null;

        if (isLink) {
            if (params && Object.keys(params).length > 0) {
                if (Object.keys(params).includes('url')) {
                    link = params.url || '/main/portalMain.do';
                }

                if (params.link == 'checkIn') {
                    link = currentLink != null ? currentLink.replace(webUrl, '') || '/main/portalMain.do' : '';
                }
            }
        }

        if (link != null) {
            store.dispatch(dispatchMultiple({ SET_LINK: false, SET_WEBLINK: link }));
        }
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
        if (!profile.includes('staging') && webLink != null && webLink != '') Alert.alert(webLink);
    }, [webLink]);

    useEffect(() => {
        const web_url = profile != 'production' && isDev ? process.env.EXPO_PUBLIC_DEV_SERVER_URL : process.env.WEB_URL;
        setWebUrl(web_url);

        // if (profile.includes('test') || profile.includes('development')) Alert.alert(`${profile}\n${webUrl}${webLink}`);
        if (profile.includes('staging')) {
            Alert.alert(`${web_url}${webLink} 접속`, `로그인 연동 준비중입니다.\n로그인 페이지 로드 시 다시 로그인 해주세요.`, [
                {
                    text: '확인',
                    onPress: () => null,
                },
            ]);
        }
    }, [isDev]);

    return camera ? (
        <Camera />
    ) : (
        <WebView
            ref={webViewRef}
            style={[styles.webview, hide ? commonStyles.none : commonStyles.container]}
            source={{
                uri: 'https://85a4-117-111-17-91.ngrok-free.app/file',
                method: 'GET',
                // uri: `${webUrl}${webLink || ''}`,
                // method: 'POST',
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
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type : event.target.id }));
                    // event.preventDefault();
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
            // setSupportMultipleWindows={false}
            allowFileAccessFromFileURLs={true}
            allowUniversalAccessFromFileURLs={true}
            onOpenWindow={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                const { targetUrl } = nativeEvent;
                console.log('Intercepted OpenWindow for', targetUrl);
                openWindow(targetUrl, true);
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
    webview: {
        backgroundColor: `#ffffff`,
    },
});

export default Web;
