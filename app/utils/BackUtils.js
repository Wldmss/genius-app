import { Alert, BackHandler } from 'react-native';
import { dispatchMultiple, dispatchOne } from './DispatchUtils';
import PropTypes from 'prop-types';

export const backStore = (_store) => {
    store = _store;
};

/** 뒤로 가기 처리 */
export const backEventHandler = (timeout, goBack, backButtonEnabled) => {
    const tab = store.getState().loginReducer.tab;
    const camera = store.getState().commonReducer.camera;
    const exitPressed = store.getState().commonReducer.exitPressed;
    const webPinFlag = store.getState().loginReducer.webPinFlag;

    // Handle back event
    const backHandler = () => {
        if (tab == 'web' && backButtonEnabled) {
            // web view 내 뒤로 가기
            if (goBack) {
                goBack();
            } else {
                store.dispatch(dispatchOne('SET_CAMERA', false));
            }
        } else if (tab == 'web' && camera) {
            // 카메라 open 인 경우
            store.dispatch(dispatchOne('SET_CAMERA', false));
        } else if (webPinFlag) {
            // pin 변경인 경우
            Alert.alert(process.env.EXPO_PUBLIC_NAME, `PIN 변경을 취소하시겠습니까?`, [
                {
                    text: '아니요',
                    onPress: () => null,
                    style: 'cancel',
                },
                {
                    text: '예',
                    onPress: () => {
                        store.dispatch(dispatchMultiple({ SET_WEBPIN: false, SET_TAB: 'web' }));
                    },
                },
            ]);
        } else {
            // 앱 종료
            if (exitPressed) {
                // 뒤로 가기 두 번
                store.dispatch(dispatchOne('SET_EXIT', true));
                clearTimeout(timeout);
            } else {
                // 뒤로 가기 한 번
                store.dispatch(dispatchOne('SET_EXIT_PRESSED', true));
                store.dispatch(dispatchOne('SET_SNACK', '버튼을 한 번 더 누르면 종료됩니다.'));

                timeout = setTimeout(() => {
                    store.dispatch(dispatchOne('SET_EXIT_PRESSED', false));
                }, 2000);

                return () => clearTimeout(timeout);
            }
        }

        return true;
    };
    // Subscribe to back state event
    BackHandler.addEventListener('hardwareBackPress', backHandler);

    // Unsubscribe
    return () => BackHandler.removeEventListener('hardwareBackPress', backHandler);
};

backEventHandler.propTypes = {
    timeout: PropTypes.any.isRequired, // 뒤로가기 timeout
    goBack: PropTypes.func, // web view undo 처리
    backEventHandler: PropTypes.bool, // web view 뒤로가기
};
