import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Alert, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSelector } from 'react-redux';
import Constants from 'expo-constants';
import { commonStyles } from 'assets/styles';
import { dispatchMultiple, dispatchOne } from 'utils/DispatchUtils';
import { backEventHandler } from 'utils/BackUtils';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as WebBrowser from 'expo-web-browser';
import Loading from 'components/Loading';
import ErrorPage from '(utils)/error';
import Camera from '(utils)/camera';
import { handleDownloadRequest } from 'utils/FileUtils';

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
    const [webUrl, setWebUrl] = useState(isDev ? process.env.DEV_SERVER_URL : process.env.WEB_URL);
    const [video, setVideo] = useState({ show: false, src: null });

    let timeout = null;

    // webview 통신
    const handleOnMessage = (event) => {
        const { data } = event.nativeEvent;
        console.log('handleOnMessage');

        const sendData = JSON.parse(data);
        console.log(sendData);

        if (sendData?.type) {
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
                case 'changeMobileLogin': // 세션 만료
                    endSession();
                    break;
                case 'openUrl': // 외부 브라우저
                    if (sendData?.url) {
                        openWindow(sendData.url);
                    } else {
                        Alert.alert('올바르지 않은 경로입니다.\n다시 시도해주세요.');
                    }
                    break;
                case 'openBrowser': // 인앱 브라우저
                    if (sendData?.url) {
                        openWindow(sendData.url, true);
                    } else {
                        Alert.alert('올바르지 않은 경로입니다.\n다시 시도해주세요.');
                    }
                    break;
                case 'openApp': // 외부 앱 열기
                    if (sendData?.data) {
                        const fileData = sendData.data; // JSON.parse(sendData.data);
                        openApp(fileData);
                    } else {
                        Alert.alert('올바르지 않은 경로입니다.\n다시 시도해주세요.');
                    }
                    break;
                case 'filedown':
                    if (sendData?.url && sendData?.data) {
                        const fileData = sendData.data; // JSON.parse(sendData.data);
                        const fileName = fileData.fileNm;
                        handleDownloadRequest(`${webUrl}${sendData.url}`, fileName);
                    } else {
                        Alert.alert('올바르지 않은 경로입니다.\n다시 시도해주세요.');
                    }
                    break;
                case 'videoPlayed':
                    setVideo({ ...video, show: true, src: sendData.url });
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

    // 전체 화면 (상태바 숨김)
    const enterFullscreen = () => {
        // if (Platform.OS === 'android') {
        //     store.dispatch({ type: 'HIDE_BAR' });
        // }

        handleScreen(true);
    };

    // 전체 화면 (상태바 숨김 해제)
    const exitFullscreen = () => {
        // if (Platform.OS === 'android') {
        //     store.dispatch({ type: 'SHOW_BAR' });
        // }

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
        handleLoading(false);
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
            handleLoading(false);
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

        if (profile == 'production') Alert.alert('다운로드 기능 준비중입니다.');
    };

    // Webview navigation state change
    const onNavigationStateChange = (navState) => {
        handleLoading(false);

        const { url, canGoBack } = navState;
        if (!url) return;

        let goBack = url.includes('portalMain.do') || url.includes('login.do') ? false : canGoBack;
        setBackButtonEnabled(goBack);
    };

    // onShouldStartLoadWithRequest
    const handleStartLoadWithRequest = (request) => {
        const { url } = request;

        handleLoading(true);

        if (checkUrl(url)) {
            changeUrl(url);
            return true;
        } else {
            handleLoading(false);
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

        if (url.startsWith('mailto') || url.startsWith('tel') || url.startsWith('sms')) {
            Linking.openURL(url);
            return false;
        }

        return true;
    };

    const changeUrl = (url) => {
        if (url != currentLink) store.dispatch(dispatchOne('SET_CURRENTLINK', url));
    };

    // window.open intercept
    const openWindow = async (targetUrl, inAppFlag) => {
        const canOpen = await Linking.canOpenURL(targetUrl);

        if (!inAppFlag && canOpen) {
            await Linking.openURL(targetUrl);
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

    // 앱 열기
    const openApp = async (data) => {
        const { web_link, app_link } = data;

        try {
            const supported = await Linking.canOpenURL(app_link);

            if (supported) {
                // 설치되어 있으면
                await Linking.openURL(app_link);
            } else {
                // 앱이 없으면
                openWindow(web_link);
            }
        } catch (error) {
            Alert.alert('앱을 열 수 없습니다.');
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
                        store.dispatch({ type: 'INIT_APP' });
                    },
                },
            ],
            { cancelable: false }
        );
    };

    // 로딩
    const handleLoading = (load) => {
        store.dispatch(dispatchOne('SET_LOADING', load));
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
        const web_url = profile != 'production' && isDev ? process.env.DEV_SERVER_URL : process.env.WEB_URL;
        setWebUrl(web_url);
    }, [isDev, webLink]);

    return camera ? (
        <Camera />
    ) : (
        <WebView
            ref={webViewRef}
            style={[styles.webview, hide ? commonStyles.none : commonStyles.container]}
            source={{
                // uri: `${process.env.TEST_URL}/file`,
                uri: `${webUrl}${webLink || ''}`,
            }}
            textZoom={100}
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
                /* id click */
                window.addEventListener('click', function (event) {
                    if(event.target.id){
                        window.ReactNativeWebView.postMessage(JSON.stringify({ type : event.target.id }));
                        // event.preventDefault();
                    }
                });

                /* full screen */
                (function(event) {
                    const video = document.getElementById('myvideo');

                    if (video) {
                        video.setAttribute('webkit-playsinline', ''); // ios
                        video.setAttribute('playsinline', ''); // android

                        video.play();

                        // video.addEventListener('play', function() {
                        //     const videoSrc = video.src || video.querySelector('source').src;
                        //     window.ReactNativeWebView.postMessage(JSON.stringify({ type : 'videoPlayed', url : videoSrc }));
                        // });

                        const fullscreenChangeHandler = () => {
                            if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
                                window.ReactNativeWebView.postMessage(JSON.stringify({ type : 'enterFullscreen' }));
                                // video.play();
                            }else {
                                window.ReactNativeWebView.postMessage(JSON.stringify({ type : 'exitFullscreen' }));
                            }
                        };

                        document.addEventListener('fullscreenchange', fullscreenChangeHandler);
                        document.addEventListener('webkitfullscreenchange', fullscreenChangeHandler);
                        document.addEventListener('mozfullscreenchange', fullscreenChangeHandler);
                        document.addEventListener('msfullscreenchange', fullscreenChangeHandler);
                    }
                })();
            `}
            startInLoadingState={true}
            renderLoading={() => <Loading show={true} />}
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
            downloadingMessage="다운로드중.."
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
