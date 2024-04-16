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
        default:
            return state;
    }
};

export default commonReducer;
