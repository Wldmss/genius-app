const initialState = {
    statusBar: true,
    loading: false,
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
            };
        default:
            return state;
    }
};

export default commonReducer;
