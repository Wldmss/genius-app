const initialState = {
    open: false,
    title: null,
    hideClose: false, // 닫기 버튼 유무
    element: null,
    alert: null,
};

const modalReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'OPEN_MODAL':
            return {
                ...state,
                open: true,
                title: action.title || null,
                hideClose: action.hideClose,
                element: action.element,
            };
        case 'CLOSE_MODAL':
            return {
                ...state,
                open: false,
                title: null,
                hideClose: false,
                element: null,
            };
        case 'SET_ALERT':
            return {
                ...state,
                alert: action.payload,
            };
        default:
            return state;
    }
};

export default modalReducer;
