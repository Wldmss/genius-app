const initialState = {
    statusBar: true,
    loading: false,
    isLink: false,
    params: null,
    camera: false,
    test: null,
    notification: false,
    snack: null,
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
        default:
            return state;
    }
};

export default commonReducer;
