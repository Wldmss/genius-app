/** async storage */
import PropTypes from 'prop-types';
import * as SecureStore from 'expo-secure-store';

// get data
export const getDeviceData = async (key) => {
    try {
        const storageData = await SecureStore.getItemAsync(key);
        return storageData != null && storageData != '' ? storageData : null;
    } catch (err) {
        console.log(`Device Data Load Error :: ${err}`);
    }
};

getDeviceData.propTypes = {
    key: PropTypes.any.isRequired,
};

// set data
export const setDeviceData = async (key, value) => {
    try {
        const cryptoValue = value != null ? String(value) : '';
        await SecureStore.setItemAsync(key, cryptoValue);
    } catch (err) {
        console.log(`Device Data Save Error :: ${err}`);
    }
};

setDeviceData.propTypes = {
    key: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};
