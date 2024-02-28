import { createStore, applyMiddleware, combineReducers } from 'redux';
import { thunk } from 'redux-thunk'; // Redux 비동기 작업을 처리하기 위한 미들웨어
import loginReducer from 'store/reducers/loginReducer';
import modalReducer from 'store/reducers/modalReducer';
import commonReducer from 'store/reducers/commonReducer';

const rootReducer = combineReducers({
    loginReducer,
    modalReducer,
    commonReducer,
});

const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;
