import { useEffect } from 'react';
import { Alert, BackHandler, View } from 'react-native';
import { useSelector } from 'react-redux';
import { dispatchMultiple } from 'utils/DispatchUtils';

/** QR 출석 체크 */
const CheckIn = () => {
    const active = useSelector((state) => state.loginReducer.active);

    const checkIn = async () => {
        // 서버로 체크인 정보 전송

        console.log('------------------checkIn----------------');
        console.log(active);
        Alert.alert(process.env.EXPO_PUBLIC_NAME, `출석 체크 완료`, [
            {
                text: '확인',
                onPress: () => {
                    if (active) {
                        store.dispatch(dispatchMultiple({ SET_LINK: false, SET_TAB: 'web' }));
                    } else {
                        // 앱 종료
                        store.dispatch({ type: 'INIT_APP' });
                        BackHandler.exitApp();
                    }
                },
            },
        ]);
    };

    useEffect(() => {
        checkIn();
    }, []);

    return <View></View>;
};

export default CheckIn;
