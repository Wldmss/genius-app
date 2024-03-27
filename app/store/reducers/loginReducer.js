const initialState = {
    token: null, // jwt token (로그인 시 세팅)
    pin: null,
    bio: null,
    users: null, // storage jwt token
    tab: null,
    bioSupported: null,
    bioRecords: false,
    exitFlag: false,
    expire: null,
    isLogin: false,
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
        case 'SET_USERS':
            return {
                ...state,
                users: action.payload,
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
