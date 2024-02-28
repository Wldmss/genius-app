const initialState = {
    statusBar: true,
};

const commonReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_STATUS_BAR':
            return {
                ...state,
                statusBar: action.payload,
            };
        default:
            return state;
    }
};

export default commonReducer;
