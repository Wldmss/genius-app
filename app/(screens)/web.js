import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Alert, Linking, Platform, View, Pressable } from 'react-native';
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
import { FontText } from 'utils/TextUtils';

const { profile } = Constants.expoConfig.extra;

import BackIcon from 'assets/icons/icon-back.svg';
import RightIcon from 'assets/icons/icon-arrow-right.svg';
import UpIcon from 'assets/icons/icon-arrow-up.svg';
import RefreshIcon from 'assets/icons/icon-refresh.svg';
import CancelIcon from 'assets/icons/icon-cancel.svg';
import { downloadAttachment } from 'utils/FileUtils';

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
    const [browser, setBrowser] = useState({ open: false, title: '' });

    let timeout = null;
    const mainUrl = '/mobile/m/main/portalMain.do';
    const browserList = [
        { url: 'ktleaders.com', title: '리더스 닷컴' },
        { url: 'ktcustomerhighway.com', title: '고객 속마음 도로' },
    ];

    // webview 통신
    const handleOnMessage = (event) => {
        const { data } = event.nativeEvent;

        const sendData = JSON.parse(data);
        console.log(sendData);

        if (sendData?.type) {
            switch (sendData.type) {
                case 'openCamera':
                    // QR 체크인
                    openCamera();
                    break;
                case 'changePin':
                    // PIN 변경
                    store.dispatch(dispatchMultiple({ SET_WEBPIN: true, SET_TAB: 'pin' }));
                    break;
                case 'changeBio':
                    // 생체인증 변경
                    store.dispatch(dispatchMultiple({ SET_WEBBIO: true, SET_TAB: 'bio' }));
                    break;
                case 'changeMobileLogin':
                    // 세션 만료
                    endSession();
                    break;
                case 'openUrl':
                    // 외부 브라우저
                    if (sendData?.url) {
                        openWindow(sendData.url);
                    } else {
                        Alert.alert('올바르지 않은 경로입니다.\n다시 시도해주세요.');
                    }
                    break;
                case 'openBrowser':
                    // 인앱 브라우저
                    if (sendData?.url) {
                        openWindow(sendData.url, true);
                    } else {
                        Alert.alert('올바르지 않은 경로입니다.\n다시 시도해주세요.');
                    }
                    break;
                case 'openApp':
                    // 외부 앱 열기
                    if (sendData?.data) {
                        const fileData = sendData.data; // JSON.parse(sendData.data);
                        openApp(fileData);
                    } else {
                        Alert.alert('올바르지 않은 경로입니다.\n다시 시도해주세요.');
                    }
                    break;
                case 'fileDown':
                    // 파일 다운로드
                    if (sendData?.url && sendData?.data) {
                        const fileData = sendData.data; // JSON.parse(sendData.data);
                        const fileName = fileData.fileNm;
                        downloadAttachment(`${webUrl}${sendData.url}`, fileName);
                    } else {
                        Alert.alert('올바르지 않은 경로입니다.\n다시 시도해주세요.');
                    }
                    break;
                case 'initApp':
                    // 앱 로그아웃
                    initApp();
                    break;
                case 'enterFullscreen':
                    // 전체화면 > landscape mode
                    enterFullscreen();
                    break;
                case 'exitFullscreen':
                    // 전체화면 해제 > protrait mode
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

    // 전체 화면 (가로모드)
    const enterFullscreen = () => {
        handleScreen(true);
    };

    // 전체 화면 (세로모드)
    const exitFullscreen = () => {
        handleScreen(false);
    };

    // screen 가로/세로 모드 처리
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
                    clearSession();
                },
            },
        ]);
        return true;
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
                        clearSession();
                    },
                },
            ],
            { cancelable: false }
        );
    };

    // clear web session
    const clearSession = () => {
        if (webViewRef.current) webViewRef.current.postMessage('clearSession');
    };

    // init app
    const initApp = () => {
        store.dispatch({ type: 'INIT_APP' });
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

    // for ios download : postMessage로 처리
    const handleDownload = ({ nativeEvent }) => {
        const { downloadUrl } = nativeEvent;
    };

    // Webview navigation state change
    const onNavigationStateChange = (navState) => {
        handleLoading(false);

        const { url, canGoBack } = navState;
        if (!url) return;

        let goBack = url.includes('portalMain.do') || url.includes('login.do') ? false : canGoBack;
        setBackButtonEnabled(goBack);

        checkBrowser(url);
        checkVideo();
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
        if (url.startsWith('mailto') || url.startsWith('tel') || url.startsWith('sms')) {
            Linking.openURL(url);
            return false;
        }

        return true;
    };

    // browser header 확인
    const checkBrowser = (url) => {
        let title = null;

        for (let browser of browserList) {
            if (url.includes(browser.url)) title = browser.title;
        }

        setBrowser({ ...browser, open: title != null, title: title });
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
            try {
                await WebBrowser.openAuthSessionAsync(targetUrl, {
                    toolbarColor: 'white', // 안드로이드 옵션
                    controlsColor: 'white', // iOS 옵션
                    dismissButtonStyle: 'close', // iOS 옵션
                    readerMode: false, // iOS 옵션
                    enableBarCollapsing: true, // iOS 옵션
                });
            } catch (err) {
                console.log(err);
            }
        }
    };

    // 앱 열기
    const openApp = async (data) => {
        const { web_link, app_link } = data;

        try {
            if (Platform.OS == 'android') {
                // android 에서는 canOpenURL 적용이 안됨
                await Linking.openURL(app_link).catch((error) => {
                    openWindow(web_link);
                });
            } else {
                const supported = await Linking.canOpenURL(app_link);

                if (supported) {
                    // 설치되어 있으면
                    await Linking.openURL(app_link);
                } else {
                    // 앱이 없으면
                    openWindow(web_link);
                }
            }
        } catch (error) {
            Alert.alert('앱을 열 수 없습니다.');
        }
    };

    // page intercept
    const interceptPage = (targetUrl) => {
        console.log('Intercepted OpenWindow for', targetUrl);

        let title = '그룹교육';

        for (let browser of browserList) {
            if (targetUrl.includes(browser.url)) title = browser.title;
        }

        setBrowser({ ...browser, open: true, title: title });

        if (webViewRef.current) webViewRef.current.injectJavaScript(`window.location.href = '${targetUrl}';`);
    };

    // main 으로 이동
    const goToHome = () => {
        if (webViewRef.current) webViewRef.current.injectJavaScript(`window.location.href = '${webUrl}${mainUrl}';`);
    };

    // 로딩 : 로딩바 삭제 요청
    const handleLoading = (load) => {
        store.dispatch(dispatchOne('SET_LOADING', false));
    };

    // video 확인 (자동 재생 안하기로 함)
    const checkVideo = () => {
        if (webViewRef.current) webViewRef.current.postMessage('checkVideo');
    };

    // 새로고침
    const reload = () => {
        if (webViewRef.current) webViewRef.current.reload();
    };

    // scroll to top
    const scrollTop = () => {
        if (webViewRef.current) webViewRef.current.injectJavaScript(`window.scrollTo(0, 0);`);
    };

    useEffect(() => {
        let link = null;

        if (isLink) {
            if (params && Object.keys(params).length > 0) {
                if (Object.keys(params).includes('url')) {
                    link = params.url || mainUrl;
                }

                if (params.link == 'checkIn') {
                    link = currentLink != null ? currentLink.replace(webUrl, '') || mainUrl : '';
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
        <View style={styles.container}>
            <View style={[styles.header, browser.open ? '' : commonStyles.none]}>
                <CancelIcon style={commonStyles.hidden} />
                <FontText style={styles.headerTxt}>{browser.title}</FontText>
                <Pressable onPress={goToHome} style={styles.icon}>
                    <CancelIcon />
                </Pressable>
            </View>
            <WebView
                ref={webViewRef}
                style={[styles.webview, hide ? commonStyles.none : commonStyles.container]}
                source={{
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
                /* app -> web postMessage */
                function listener(event) {
                    const type = event.data;

                    switch (type) {
                        case 'clearSession': 
                            // 세션 종료
                            location.href = 'https://ktedu.kt.com/mobile/m/logout.do';
                            window.ReactNativeWebView.postMessage(JSON.stringify({ type : 'initApp' }));
                            break;
                        case 'checkVideo':
                            // 비디오 영상 확인
                            play();
                            break;
                    }
                }

                document.addEventListener('message', listener); // android
                window.addEventListener('message', listener);   // ios

                /* id click */
                window.addEventListener('click', function (event) {
                    if(event.target.id){
                        window.ReactNativeWebView.postMessage(JSON.stringify({ type : event.target.id }));
                        // event.preventDefault();
                    }
                });

                /* 영상 자동 재생 (사용 x) */
                function play(){
                    let video = document.getElementById('myvideo');

                    if (video) {
                        video.setAttribute('webkit-playsinline', ''); // ios
                        video.setAttribute('playsinline', ''); // android

                        // video.play();
                    }
                }

                /* full screen */
                (function(event) {
                    // full screen (android)
                    const fullscreenChangeHandler = () => {
                        if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
                            window.ReactNativeWebView.postMessage(JSON.stringify({ type : 'enterFullscreen' }));
                        }else {
                            window.ReactNativeWebView.postMessage(JSON.stringify({ type : 'exitFullscreen' }));
                        }
                    };

                    document.addEventListener('fullscreenchange', fullscreenChangeHandler);
                    document.addEventListener('webkitfullscreenchange', fullscreenChangeHandler);
                    document.addEventListener('mozfullscreenchange', fullscreenChangeHandler);
                    document.addEventListener('msfullscreenchange', fullscreenChangeHandler);
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
                allowFileAccessFromFileURLs={true}
                allowUniversalAccessFromFileURLs={true}
                onOpenWindow={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    const { targetUrl } = nativeEvent;
                    interceptPage(targetUrl);
                }}
                onContentProcessDidTerminate={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.warn('Content process terminated, reloading', nativeEvent);
                    // webViewRef.current.reload();
                }}
            />
            <View style={[styles.footer, browser.open ? '' : commonStyles.none]}>
                <Pressable onPress={goBack} style={styles.icon}>
                    <BackIcon />
                </Pressable>
                <Pressable onPress={goForward} style={styles.icon}>
                    <RightIcon />
                </Pressable>
                <Pressable onPress={reload} style={styles.icon}>
                    <RefreshIcon />
                </Pressable>
                <Pressable onPress={scrollTop} style={styles.icon}>
                    <UpIcon />
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        top: 0,
        height: 45,
        backgroundColor: `#eeeeee`,
        flexDirection: `row`,
        justifyContent: `space-between`,
        paddingHorizontal: 20,
        alignItems: `center`,
    },
    headerTxt: {
        fontSize: 18,
        lineHeight: 48,
    },
    icon: {
        marginVertical: `auto`,
    },
    cancel: {
        height: 18,
        width: 18,
    },
    footer: {
        bottom: 0,
        height: 45,
        backgroundColor: `#eeeeee`,
        flexDirection: `row`,
        justifyContent: `space-between`,
        paddingHorizontal: 20,
    },
    webview: {
        backgroundColor: `#ffffff`,
    },
});

export default Web;
