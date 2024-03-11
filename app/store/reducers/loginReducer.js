const initialState = {
    token: null,
    pin: null,
    bio: null,
    users: null,
    tab: null,
    bioSupported: false,
    bioRecords: false,
    isLink: false,
    params: null,
    exitFlag: false,
    expire: null,
    camera: false,
    isLogin: false,
    test:null
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
        case 'SET_LINK':
            return {
                ...state,
                isLink: action.payload,
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
                isLink: false,
                exitFlag: false,
                expire: null,
                camera: false,
            };
        case 'SET_EXPIRE':
            return {
                ...state,
                expire: action.payload,
            };
        case 'SET_CAMERA':
            return {
                ...state,
                camera: action.payload,
            };
        case 'SET_PARAMS':
            return {
                ...state,
                params: action.payload,
            };
        case 'SET_LOGIN':
            return {
                ...state,
                isLogin: action.payload,
            };
            case 'SET_TEST':
            return {
                ...state,
                test: action.payload,
            };
        default:
            return state;
    }
};

export default loginReducer;
