import { BackHandler } from 'react-native';
import { dispatchOne } from './DispatchUtils';

export const backStore = (_store) => {
    store = _store;
};

/** 뒤로 가기 처리 */
export const backEventHandler = (timeout, webViewRef, backButtonEnabled) => {
    const tab = store.getState().loginReducer.tab;
    const camera = store.getState().commonReducer.camera;
    const exitPressed = store.getState().commonReducer.exitPressed;

    // Handle back event
    const backHandler = () => {
        if (tab == 'web' && backButtonEnabled) {
            // web view 내 뒤로 가기
            webViewRef.current.goBack();
        } else if (tab == 'web' && camera) {
            // 카메라 open 인 경우
            store.dispatch(dispatchOne('SET_CAMERA', false));
            router.back();
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
