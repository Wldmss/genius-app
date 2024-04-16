import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Alert, Platform, View, TouchableWithoutFeedback, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSelector } from 'react-redux';
import store from 'store/store';
import { dispatchOne } from 'utils/DispatchUtils';
import * as ScreenOrientation from 'expo-screen-orientation';
import { router } from 'expo-router';
import { backEventHandler } from 'utils/BackUtils';
import * as FileUtils from 'utils/FileUtils';
import Loading from 'components/Loading';
import ErrorPage from '(utils)/error';
import ApiFetch from 'api/ApiFetch';
import Api from 'api/Api';

/** web view */
const Web = () => {
    const isLink = useSelector((state) => state.commonReducer.isLink);
    const camera = useSelector((state) => state.commonReducer.camera);
    const params = useSelector((state) => state.commonReducer.params);
    const exitPressed = useSelector((state) => state.commonReducer.exitPressed);

    const webViewRef = useRef(null);

    const [backButtonEnabled, setBackButtonEnabled] = useState(false);

    // const tempUri = 'https://naver.com';
    // const tempUri = 'https://ktedu.kt.com';
    // const tempUri = 'https://aice.study/main';
    // const tempUri =  'https://aice.study/info/aice';
    // const tempUri = 'https://ktedu.kt.com/mobile/m/support/notice/noticeList.do';
    // const tempUri =  'https://ktedu.kt.com/education/courseContents.do?classId=200034420_01';
    // const tempUri = '192.168.50.254:8080/api/v1/file';
    const tempUri = 'http://192.168.50.254:8080/file';

    const [currentURI, setURI] = useState(tempUri);
    const [hide, setHide] = useState(false);

    let timeout = null;

    // webview 통신
    const handleOnMessage = (event) => {
        const { data } = event.nativeEvent;
        console.log(data);

        if (data.type) {
            switch (data.type) {
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
                case 'download':
                    console.log('download');
                    console.log(data.url);
                    FileUtils.handleDownloadRequest(data.url, webViewRef);
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
        router.push('camera');
    };

    // webview load
    const webViewLoaded = (event) => {
        console.log(event.nativeEvent);
        clearTimeout(timeout);
        store.dispatch(dispatchOne('SET_LOADING', false));
        setBackButtonEnabled(true);
        setHide(false);
    };

    // webview error
    const handleError = (event) => {
        console.log('on error :: ');
        console.log(event.nativeEvent);
        setHide(true);
        store.dispatch(dispatchOne('SET_LOADING', false));
        // store.dispatch(dispatchOne('SET_TAB', 'error'));
    };

    // Webview navigation state change
    const onNavigationStateChange = (navState) => {
        const { url, canGoBack } = navState;
        if (!url) return;

        setBackButtonEnabled(canGoBack);

        console.log('onNavigationStateChange::');
        console.log(url);
    };

    // webview 뒤로가기
    const goBack = () => {
        webViewRef.current.goBack();
    };

    // webview 앞으로 가기
    const goForward = () => {
        webViewRef.current.goForward(handleGoFoward);
    };

    const handleGoFoward = () => {
        setHide(false);
    };

    // for ios download
    const handleDownload = ({ nativeEvent }) => {
        const { downloadUrl } = nativeEvent;
        console.log(downloadUrl);
    };

    // onShouldStartLoadWithRequest
    const handleStartLoadWithRequest = (request) => {
        console.log('handleStartLoadWithRequest');

        const { url } = request;
        console.log(url);

        if (request.uri != currentURI) setURI(request.uri);

        return true;
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
        backEventHandler(timeout, goBack, backButtonEnabled);
    }, [backButtonEnabled, exitPressed, camera]);

    // web view 로드 오류 처리
    useEffect(() => {
        setBackButtonEnabled(false);
        store.dispatch(dispatchOne('SET_EXIT_PRESSED', false));

        timeout = setTimeout(() => {
            if (hide) handleError();
        }, 10000);

        return () => clearTimeout(timeout);
    }, []);

    return (
        <WebView
            ref={webViewRef}
            style={[styles.webview, hide ? styles.none : styles.flex]}
            source={{
                uri: tempUri,
                method: 'POST',
                // body: JSON.stringify({
                //     userid: 'test1001',
                //     pwd: 'test100!',
                //     url: '',
                // }),
            }}
            onLoadStart={() => setHide(true)}
            onLoad={webViewLoaded}
            onMessage={handleOnMessage}
            onError={handleError}
            onHttpError={handleError}
            onNavigationStateChange={onNavigationStateChange}
            originWhitelist={['*']}
            onShouldStartLoadWithRequest={handleStartLoadWithRequest}
            injectedJavaScriptBeforeContentLoaded={`
                window.onerror = function(message, sourcefile, lineno, colno, error){
                    // alert("Message: " + message + "\\n\\nError: " + error);
                    return true;
                };

                window.onload = function() {
                    triggerOnSubmit();
                };

                function triggerOnSubmit() {
                    // let form = document.getElementById("downloadFrm");
                    var form = $("#downloadFrm");
                    form.onsubmit = function() {
                        alert('form submitted!');
                        return true;
                    }
                }
            `}
            injectedJavaScript={`
                window.addEventListener('click', function (event) {
                    window.ReactNativeWebView.postMessage(JSON.stringify(event.target.id));
                }
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
            allowsInlineMediaPlayback={true}
            keyboardDisplayRequiresUserAction={true} // keyboard 프로그래밍 맞춰서 (ios)
            allowsLinkPreview={true} // 링크 미리보기 (ios)
            pullToRefreshEnabled={true} // 당겨서 새로고침 (ios)
            lackPermissionToDownloadMessage="권한이 거부되어 파일을 다운로드할 수 없습니다"
            downloadingMessage="다운로드를 시작합니다."
            onFileDownload={handleDownload}
            automaticallyAdjustContentInsets={false}
            allowUniversalAccessFromFileURLs={true}
            allowFileAccess={true}
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
    webview: {
        backgroundColor: `#ffffff`,
    },
    flex: {
        flex: 1,
    },
    none: {
        display: `none`,
    },
});

export default Web;
