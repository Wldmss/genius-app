import { useNavigation } from '@react-navigation/native';
import PropTypes from 'prop-types';
import { dispatchOne } from './DispatchUtils';
import { router } from 'expo-router';

// navigate
export const navigate = (id, navigation) => {
    if (!navigation) navigation = useNavigation();
    navigation.navigate(id);
};

navigate.propTypes = {
    navigation: PropTypes.any.isRequired,
    id: PropTypes.string.isRequired,
};

// store SET_TAB dispatch & navigate
export const navigateDispatch = (id, navigation) => (dispatch) => {
    dispatch(dispatchOne('SET_TAB', id));
    navigation.navigate(id);
};

navigateDispatch.propTypes = {
    navigation: PropTypes.any.isRequired,
    id: PropTypes.string.isRequired,
};

export const routeDispatch = (id) => (dispatch) => {
    dispatch(dispatchOne('SET_TAB', id));
    router.push(id);
};

routeDispatch.propTypes = {
    id: PropTypes.string.isRequired,
};
