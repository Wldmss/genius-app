import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Alert, AppState, BackHandler } from 'react-native';
import { Stack, router } from 'expo-router';
import store from 'store/store';
import { dispatchOne } from 'utils/DispatchUtils';
import { StatusBar } from 'expo-status-bar';

const Contents = () => {
    const commonOptions = { headerShown: false };

    const statusBar = useSelector((state) => state.commonReducer.statusBar);
    const token = useSelector((state) => state.loginReducer.token);
    const tab = useSelector((state) => state.loginReducer.tab);
    const exitFlag = useSelector((state) => state.loginReducer.exitFlag);

    // token 없는 경우
    useEffect(() => {
        console.log('== token change ==');
        console.log(token);

        if (token == null) {
            // 최초 접속, 로그아웃
            store.dispatch(dispatchOne('SET_TAB', 'main'));
        }
    }, [token]);

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
        if (nextAppState === 'active') {
            store.dispatch({ type: 'INIT_APP' });
        }
    };

    useEffect(() => {
        const appState = AppState.addEventListener('change', handleAppStateChange);
        return () => {
            appState.remove();
        };
    }, []);

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
            </Stack>
        </>
    );
};

export default Contents;
