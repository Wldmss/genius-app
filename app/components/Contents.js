import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Alert, AppState, BackHandler } from 'react-native';
import store from 'store/store';
import moment from 'moment';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { dispatchOne } from 'utils/DispatchUtils';
import { checkLogin } from 'api/LoginApi';
import { backEventHandler } from 'utils/BackUtils';

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
    const jwt = useSelector((state) => state.loginReducer.jwt);
    const exitPressed = useSelector((state) => state.commonReducer.exitPressed);

    let timeout = null;

    // 로그인
    useEffect(() => {
        console.log('----------login----------');
        console.log(isLogin);
        console.log(token);
        console.log(jwt);

        if (token == null) {
            if (isLogin) {
                if (jwt == null) {
                    noUsers(true);
                    return;
                }

                // ldap 인증
                checkLogin().then(({ status, data }) => {
                    if (status && !data) {
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
                    onPress: async () => {
                        store.dispatch(dispatchOne('SET_TAB', 'ldap'));
                    },
                },
            ]
        );
    };

    // tab 변경 이벤트
    useEffect(() => {
        console.log('== tab change ==');
        console.log(tab);
        console.log(token);
        if (tab == null) {
            store.dispatch(dispatchOne('SET_TAB', 'main'));
        } else {
            if (tab == 'web') {
                store.dispatch(dispatchOne('SET_LOADING', true));

                let timeout = setTimeout(() => {
                    router.push(tab);
                }, loadTime);

                return () => {
                    clearTimeout(timeout);
                };
            } else {
                router.push(tab);
            }
        }
    }, [tab]);

    // 앱 상태 관리
    const handleAppStateChange = (nextAppState) => {
        console.log('App state :::::: ', nextAppState);
        let resetFlag = nextAppState === 'active' && exitFlag;

        if (!resetFlag && expire != null) {
            const now = moment();
            const diff = now.diff(expire, 'minutes');
            resetFlag = diff > sessionTime; // TODO 세션의 기준을 정해야 함
        }

        if (resetFlag) {
            store.dispatch({ type: 'INIT_APP' });
        }
    };

    useEffect(() => {
        const appState = AppState.addEventListener('change', handleAppStateChange);
        return () => {
            appState.remove();
        };
    }, [exitFlag]);

    // 뒤로가기
    useEffect(() => {
        backEventHandler(timeout);
    }, [tab, exitPressed]);

    // 앱 종료
    useEffect(() => {
        console.log('== exit flag ==');
        console.log(exitFlag);
        console.log(exitPressed);
        if (exitFlag && exitPressed) {
            store.dispatch(dispatchOne('SET_EXIT_PRESSED', false));
            BackHandler.exitApp();
            // exitAlert();
        }
    }, [exitFlag, exitPressed]);

    // 앱 종료 alert
    const exitAlert = () => {
        Alert.alert('앱 종료', `${process.env.EXPO_PUBLIC_NAME}를 종료하시겠습니까?`, [
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
            <Stack screenOptions={commonOptions}>
                <Stack.Screen name="(login)" options={commonOptions} />
                <Stack.Screen name="(screens)" options={commonOptions} />
                <Stack.Screen name="(utils)" />
            </Stack>
        </>
    );
};

export default Contents;
