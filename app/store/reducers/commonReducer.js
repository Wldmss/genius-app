const initialState = {
    statusBar: true, // 상태바 노출 여부
    loading: false, // 로딩 화면
    isLink: false, // 링크 접속 여부
    params: null, // 링크 파라미터
    camera: false, // 카메라 열기 여부
    notification: false, // 알림 허용 여부
    snack: null, // snack bar 값
    test: null, // 테스트 값
    exitPressed: false, // 뒤로가기
    isFirst: false, // 최초 접속 여부
    isWeb: false, // web 접속 여부
    webLink: null, // 웹 접속 링크
    currentLink: null, // 현재 링크
    splash: true, //splash 화면
    isDev: false, // 개발 사이트용
};

const commonReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SHOW_BAR':
            return {
                ...state,
                statusBar: true,
            };
        case 'HIDE_BAR':
            return {
                ...state,
                statusBar: false,
            };
        case 'SET_LOADING':
            return {
                ...state,
                loading: action.payload,
            };
        case 'INIT_APP':
            return {
                ...state,
                loading: false,
                isLink: false,
                camera: false,
                snack: null,
                exitPressed: false,
                isWeb: false,
                webLink: null,
                currentLink: null,
                splash: true,
            };
        case 'SET_LINK':
            return {
                ...state,
                isLink: action.payload,
            };
        case 'SET_PARAMS':
            return {
                ...state,
                params: action.payload,
            };
        case 'SET_CAMERA':
            return {
                ...state,
                camera: action.payload,
            };
        case 'SET_NOTIFICATION':
            return {
                ...state,
                notification: action.payload,
            };
        case 'SET_TEST':
            return {
                ...state,
                test: action.payload,
            };
        case 'SET_SNACK':
            return {
                ...state,
                snack: action.payload,
            };
        case 'SET_EXIT_PRESSED':
            return {
                ...state,
                exitPressed: action.payload,
            };
        case 'SET_FIRST':
            return {
                ...state,
                isFirst: action.payload,
            };
        case 'SET_WEB':
            return {
                ...state,
                isWeb: action.payload,
            };
        case 'SET_WEBLINK':
            return {
                ...state,
                webLink: action.payload,
            };
        case 'SET_CURRENTLINK':
            return {
                ...state,
                currentLink: action.payload,
            };
        case 'SET_SPLASH':
            return {
                ...state,
                splash: action.payload,
            };
        case 'SET_DEV':
            return {
                ...state,
                isDev: action.payload,
            };
        default:
            return state;
    }
};

export default commonReducer;
