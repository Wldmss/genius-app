import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Alert, AppState, BackHandler } from 'react-native';
import moment from 'moment';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { dispatchOne } from 'utils/DispatchUtils';
import { checkLogin } from 'api/LoginApi';
import { backEventHandler } from 'utils/BackUtils';
import Web from '(screens)/web';
import * as Updates from 'expo-updates';
import Constants from 'expo-constants';

const { profile } = Constants.expoConfig.extra;

/** 페이지 router */
const Contents = () => {
    const commonOptions = { headerShown: false };
    const sessionTime = 60;
    const loadTime = 100; //300

    const statusBar = useSelector((state) => state.commonReducer.statusBar);
    const token = useSelector((state) => state.loginReducer.token);
    const tab = useSelector((state) => state.loginReducer.tab);
    const exitFlag = useSelector((state) => state.loginReducer.exitFlag);
    const expire = useSelector((state) => state.loginReducer.expire);
    const isLogin = useSelector((state) => state.loginReducer.isLogin);
    const loginKey = useSelector((state) => state.loginReducer.loginKey);
    const exitPressed = useSelector((state) => state.commonReducer.exitPressed);
    const isWeb = useSelector((state) => state.commonReducer.isWeb);
    const logout = useSelector((state) => state.loginReducer.logout);

    let timeout = null;

    // 로그인
    useEffect(() => {
        console.log('----------login----------');

        if (token == null) {
            if (isLogin) {
                if (loginKey == null) {
                    noUsers(true);
                    return;
                }

                // ldap 인증
                checkLogin().then((response) => {
                    if (!response) {
                        noUsers();
                    }
                });
            } else {
                // 최초 접속, 로그아웃
                store.dispatch(dispatchOne('SET_TAB', 'main'));
            }
        } else {
            if (isLogin) store.dispatch(dispatchOne('SET_TAB', 'web')); //web
        }
    }, [isLogin, token]);

    // 로그인 정보 불일치
    const noUsers = (noUserFlag) => {
        Alert.alert(
            process.env.EXPO_PUBLIC_NAME,
            `로그인 정보가 ${noUserFlag ? '없습니다.' : '일치하지 않습니다.'}\nLDAP 로그인 페이지로 이동합니다.`,
            [
                {
                    text: '확인',
                    onPress: () => {
                        store.dispatch(dispatchOne('SET_TAB', 'ldap'));
                    },
                },
            ]
        );
    };

    // tab 변경 이벤트
    useEffect(() => {
        console.log(`change tab :: ${tab}`);

        if (tab == null) {
            store.dispatch(dispatchOne('SET_TAB', 'main'));
        } else {
            if (tab == 'web') {
                // store.dispatch(dispatchOne('SET_LOADING', true));

                let timeout = setTimeout(() => {
                    store.dispatch(dispatchOne('SET_WEB', true));
                }, loadTime);

                return () => {
                    clearTimeout(timeout);
                };
            } else {
                store.dispatch(dispatchOne('SET_WEB', false));
            }
        }
    }, [tab]);

    useEffect(() => {
        if (!isWeb && tab != null) {
            router.push(tab);
            store.dispatch(dispatchOne('SET_SPLASH', false));
        }
    }, [isWeb, tab]);

    // 앱 상태 관리
    const handleAppStateChange = async (nextAppState) => {
        console.log('App state :::::: ', nextAppState);

        if (nextAppState === 'active' && profile != 'preview' && profile != 'development') {
            await checkUpdates();
        }

        if (nextAppState == 'background') {
            store.dispatch({ type: 'BACKGROUND' });
        }

        let resetFlag = nextAppState === 'active' && logout;

        // 세션 만료 체크 :: background > active 시 background 시점부터 sessionTime 만큼 유효
        if (!resetFlag && expire != null) {
            const now = moment();
            const diff = now.diff(expire, 'minutes');
            resetFlag = diff > sessionTime;
        }

        if (resetFlag) {
            Updates.reloadAsync();
            // store.dispatch({ type: 'INIT_APP' });
        }
    };

    // 업데이트 확인
    const checkUpdates = async () => {
        try {
            const update = await Updates.checkForUpdateAsync(); // 업데이트 확인

            if (update.isAvailable) {
                Alert.alert(process.env.EXPO_PUBLIC_NAME, '업데이트 내역이 있습니다.\n지금 업데이트 하시겠습니까?', [
                    {
                        text: '아니요',
                        onPress: () => null,
                        style: 'cancel',
                    },
                    {
                        text: '예',
                        onPress: async () => {
                            await Updates.reloadAsync();
                        },
                    },
                ]);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        const appState = AppState.addEventListener('change', handleAppStateChange);
        return () => {
            appState.remove();
        };
    }, [exitFlag, expire]);

    // 뒤로가기
    useEffect(() => {
        backEventHandler(timeout);
    }, [tab, exitPressed]);

    // 앱 종료
    useEffect(() => {
        if (exitFlag && exitPressed) {
            store.dispatch(dispatchOne('SET_EXIT_PRESSED', false));
            BackHandler.exitApp();
            // exitAlert();
        }
    }, [exitFlag, exitPressed]);

    // 앱 종료 alert
    const exitAlert = () => {
        Alert.alert(process.env.EXPO_PUBLIC_NAME, `${process.env.EXPO_PUBLIC_NAME}를 종료하시겠습니까?`, [
            {
                text: '아니요',
                onPress: () => {
                    store.dispatch(dispatchOne('SET_EXIT', false));
                },
                style: 'cancel',
            },
            {
                text: '예',
                onPress: () => {
                    BackHandler.exitApp();
                },
            },
        ]);
    };

    return (
        <>
            <StatusBar hidden={!statusBar} style="auto" />
            {isWeb ? (
                <Web />
            ) : (
                <Stack screenOptions={commonOptions}>
                    <Stack.Screen name="(login)" options={commonOptions} />
                    <Stack.Screen name="(screens)" options={commonOptions} />
                    <Stack.Screen name="(utils)" options={commonOptions} />
                </Stack>
            )}
        </>
    );
};

export default Contents;
