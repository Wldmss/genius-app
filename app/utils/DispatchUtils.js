// 다중 dispatch
export const dispatchMultiple = (value) => (dispatch) => {
    Object.keys(value).forEach((key) => {
        dispatch({ type: key, payload: value[key] });
    });
};

// 단일 dispatch
export const dispatchOne = (key, value) => (dispatch) => {
    dispatch({ type: key, payload: value });
};
