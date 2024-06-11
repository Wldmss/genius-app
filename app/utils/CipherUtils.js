import Api from 'api/Api';
import CryptoJS from 'react-native-crypto-js';

const keyString = process.env.AES_KEY;
const ivString = keyString.substring(0, 16);

const key = CryptoJS.enc.Utf8.parse(keyString);
const iv = CryptoJS.enc.Utf8.parse(ivString);

// aes256 암호화
export const encrypt = (value) => {
    const stringValue = typeof value != 'string' ? JSON.stringify(value) : value;

    const encrypt = CryptoJS.AES.encrypt(stringValue, key, {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC,
    });

    const encryptedHex = encrypt.ciphertext.toString(CryptoJS.enc.Hex);

    // Api.test.post('cipher', { encrypt: encryptedHex, key: keyString, iv: ivString }).then((result) => {
    //     console.log('decrypt :: ', result.data);
    // });

    return encryptedHex;
};

// aes256 복호화
export const decrypt = (value) => {
    const ciphertext = CryptoJS.enc.Hex.parse(value);

    const decrypt = CryptoJS.AES.decrypt(ciphertext, key, {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC,
    });

    const decryptedString = decrypt.toString(CryptoJS.enc.Utf8);

    return JSON.parse(decryptedString);
};
