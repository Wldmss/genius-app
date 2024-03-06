import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Alert, AppState, BackHandler } from 'react-native';
import { Stack, router } from 'expo-router';
import store from 'store/store';
import { dispatchOne } from 'utils/DispatchUtils';
import { StatusBar } from 'expo-status-bar';
import moment from 'moment';
import { login } from 'api/LoginApi';

const Contents = () => {
    const commonOptions = { headerShown: false };
    const sessionTime = 10;

    const statusBar = useSelector((state) => state.commonReducer.statusBar);
    const token = useSelector((state) => state.loginReducer.token);
    const tab = useSelector((state) => state.loginReducer.tab);
    const exitFlag = useSelector((state) => state.loginReducer.exitFlag);
    const expire = useSelector((state) => state.loginReducer.expire);
    const isLogin = useSelector((state) => state.loginReducer.isLogin);
    const users = useSelector((state) => state.loginReducer.users);

    // 로그인
    useEffect(() => {
        console.log('----------login----------');
        console.log(isLogin);
        console.log(token);
        console.log(users);

        if (token == null) {
            if (isLogin) {
                if (users == null) {
                    noUsers(true);
                    return;
                }

                // ldap 인증
                login(users, null).then((res) => {
                    console.log(res);
                    if (res.status) {
                        if (res.data) store.dispatch(dispatchOne('SET_TOKEN', res.data.token));
                    } else {
                        noUsers();
                    }
                });
            } else {
                // 최초 접속, 로그아웃
                store.dispatch(dispatchOne('SET_TAB', 'main'));
            }
        } else {
            if (isLogin) store.dispatch(dispatchOne('SET_TAB', 'web'));
        }
    }, [isLogin, token]);

    // 로그인 정보 불일치
    const noUsers = (noUserFlag) => {
        Alert.alert('GENIUS', `로그인 정보가 ${noUserFlag ? '없습니다.' : '일치하지 않습니다.'}\nLDAP 로그인 페이지로 이동합니다.`, [
            {
                text: '확인',
                onPress: async () => {
                    store.dispatch(dispatchOne('SET_TAB', 'ldap'));
                },
            },
        ]);
    };

    // tab 변경 이벤트
    useEffect(() => {
        console.log('== tab change ==');
        console.log(tab);
        if (tab == null) {
            store.dispatch(dispatchOne('SET_TAB', 'main'));
        } else {
            if (tab == 'web') {
                store.dispatch(dispatchOne('SET_LOADING', true));

                let timeout = setTimeout(() => {
                    router.push(tab);
                }, 500);

                return () => {
                    clearTimeout(timeout);
                };
            } else {
                router.push(tab);
            }
        }
    }, [tab]);

    // 뒤로가기
    useEffect(() => {
        // Handle back event
        const backHandler = () => {
            if (tab != 'web') {
                store.dispatch(dispatchOne('SET_EXIT', true));
            }
            return true;
        };
        // Subscribe to back state event
        BackHandler.addEventListener('hardwareBackPress', backHandler);

        // Unsubscribe
        return () => BackHandler.removeEventListener('hardwareBackPress', backHandler);
    }, [tab]);

    // 앱 상태 관리
    const handleAppStateChange = (nextAppState) => {
        console.log('App state :::::: ', nextAppState);
        let resetFlag = nextAppState === 'active' && exitFlag;

        if (!resetFlag && expire != null) {
            const now = moment();
            const diff = now.diff(expire, 'minutes');
            resetFlag = diff > sessionTime;
        }

        if (resetFlag) store.dispatch({ type: 'INIT_APP' });
    };

    useEffect(() => {
        const appState = AppState.addEventListener('change', handleAppStateChange);
        return () => {
            appState.remove();
        };
    }, [exitFlag]);

    // 앱 종료
    useEffect(() => {
        console.log('== exit flag ==');
        console.log(exitFlag);
        if (exitFlag) {
            Alert.alert(
                '앱 종료',
                'GENIUS를 종료하시겠습니까?',
                [
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
                ],
                { cancelable: false }
            );
        }
    }, [exitFlag]);

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
