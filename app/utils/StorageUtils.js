/** async storage */
import PropTypes from 'prop-types';
import * as SecureStore from 'expo-secure-store';
// import { AES, enc } from 'crypto-js';

const cryptoKey = 'genius';

// get data
export const getDeviceData = async (key) => {
    try {
        const storageData = await SecureStore.getItemAsync(key);
        return storageData != null ? storageData : null;
        // return storageData != null ? AES.decrypt(storageData, key).toString(enc.Utf8) : null;
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
        // const cryptoValue = AES.encrypt(String(value), key).toString();
        const cryptoValue = String(value);
        await SecureStore.setItemAsync(key, cryptoValue);
    } catch (err) {
        console.log(`Device Data Save Error :: ${err}`);
    }
};

setDeviceData.propTypes = {
    key: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};

// get data
export const getDeviceDataObj = async (key) => {
    try {
        const storageData = await SecureStore.getItemAsync(key);
        const decryptValue = storageData != null ? AES.decrypt(storageData, cryptoKey) : {};
        return decryptValue;
        // return storageData != null ? JSON.parse(storageData) : {};
    } catch (err) {
        console.log(`Device Data Load Error :: ${err}`);
    }
};

getDeviceDataObj.propTypes = {
    key: PropTypes.any.isRequired,
};

// set data
export const setDeviceDataObj = async (key, value) => {
    try {
        // const cryptoValue = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, value);
        const cryptoValue = AES.encrypt(value, key).toString();
        await SecureStore.setItemAsync(key, cryptoValue);
    } catch (err) {
        console.log(`Device Data Save Error :: ${err}`);
    }
};

setDeviceDataObj.propTypes = {
    key: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};

// change data
export const changeDeviceData = async (key, changeObj) => {
    if (changeObj && Object.keys(changeObj).length > 0) {
        const data = await getDeviceData(key);
        // todo 뭔가 안돼
        Object.keys(changeObj).map((change) => {
            data[change] = changeObj[change];
        });

        await setDeviceData(key, JSON.stringify(data));
    }
};

changeDeviceData.propTypes = {
    key: PropTypes.string.isRequired,
    changeObj: PropTypes.object.isRequired,
};
