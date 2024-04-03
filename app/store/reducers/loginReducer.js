const initialState = {
    jwt: null, // storage jwt token
    token: null, // login token (jwt)
    pin: null, // { isRegistered: true, value: '', modFlag: false }
    bio: null, // { isRegistered: true, modFlag: false }
    tab: null, // web, ldap, pin, bio, test ..
    bioSupported: null, // 2: face id, 1: touch id, null // 생체 인증 지원 범위
    bioRecords: false, // 생체 인증 등록 여부
    exitFlag: false, // 앱 종료 여부
    expire: null, // 세션 만료 시간
    isLogin: false, // 로그인 여부
};

const loginReducer = (state = initialState, action) => {
    switch (action.type) {
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
        case 'SET_JWT':
            return {
                ...state,
                jwt: action.payload,
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
        default:
            return state;
    }
};

export default loginReducer;
