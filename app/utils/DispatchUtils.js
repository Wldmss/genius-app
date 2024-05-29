import { Alert } from 'react-native';

// 다중 dispatch
export const dispatchMultiple = (value) => (dispatch) => {
    Object.keys(value).forEach((key) => {
        dispatch({ type: key, payload: value[key] });
    });
};

// 단일 dispatch
export const dispatchOne = (key, value) => (dispatch) => {
    dispatch({ type: key, payload: value });
};

// 로그인 dispatch (isLogin이 변경되면 Contents.js > useEffect 에서 감지함)
export const dispatchLogin = (isLogin, now) => (dispatch) => {
    dispatch({ type: 'SET_LOGIN', payload: isLogin });
    dispatch({ type: 'SET_EXPIRE', payload: now });
};
