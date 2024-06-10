import moment from 'moment';

const initialState = {
    loginKey: null, // storage loginKey token
    token: null, // login token (loginKey)
    pin: null, // { isRegistered: true, value: '', modFlag: false }
    bio: null, // { isRegistered: true, modFlag: false }
    tab: null, // web, ldap, pin, bio, test ..
    bioSupported: null, // 2: face id, 1: touch id, null // 생체 인증 지원 범위
    bioRecords: false, // 생체 인증 등록 여부
    exitFlag: false, // 앱 종료 여부
    expire: null, // 세션 만료 시간
    isLogin: false, // 로그인 여부
    resetLogin: false, // 로그인 리셋
    webPinFlag: false, // 웹에서 pin 변경
    webBioFlag: false, // 웹에서 bio 변경
    active: false, // 로그인 이후 web 활동 여부
    logout: false, // 로그아웃 처리
    deviceToken: null, // push device token
};

const loginReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_LOGINKEY':
            return {
                ...state,
                loginKey: action.payload,
            };
        case 'SET_TOKEN':
            return {
                ...state,
                token: action.payload,
            };
        case 'SET_PIN':
            return {
                ...state,
                pin: action.payload,
            };
        case 'SET_BIO':
            return {
                ...state,
                bio: action.payload,
            };
        case 'SET_TAB':
            return {
                ...state,
                tab: action.payload,
            };
        case 'SET_BIO_SUPPORTED':
            return {
                ...state,
                bioSupported: action.payload,
            };
        case 'SET_BIO_RECORDS':
            return {
                ...state,
                bioRecords: action.payload,
            };
        case 'SET_EXIT':
            return {
                ...state,
                exitFlag: action.payload,
            };
        case 'INIT_APP':
            return {
                ...state,
                token: null,
                tab: null,
                exitFlag: false,
                isLogin: false,
                expire: null,
                active: false,
                logout: false,
            };
        case 'BACKGROUND':
            return {
                ...state,
                exitFlag: false,
                expire: moment(),
            };
        case 'SET_EXPIRE':
            return {
                ...state,
                expire: action.payload,
            };
        case 'SET_LOGIN':
            return {
                ...state,
                isLogin: action.payload,
            };

        case 'RESET_LOGIN':
            return {
                ...state,
                resetLogin: action.payload,
            };
        case 'SET_WEBPIN':
            return {
                ...state,
                webPinFlag: action.payload,
            };
        case 'SET_WEBBIO':
            return {
                ...state,
                webBioFlag: action.payload,
            };
        case 'SET_ACTIVE':
            return {
                ...state,
                active: action.payload,
            };
        case 'SET_LOGOUT':
            return {
                ...state,
                logout: action.payload,
            };
        case 'SET_DEVICETOKEN':
            return {
                ...state,
                deviceToken: action.payload,
            };
        default:
            return state;
    }
};

export default loginReducer;
