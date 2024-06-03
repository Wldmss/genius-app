import { Pressable, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import * as Clipboard from 'expo-clipboard';
import { FontText } from 'utils/TextUtils';
import { commonInputStyles } from 'assets/styles';
import { loginTest } from 'api/LoginApi';
import axios from 'axios';
import * as ApiFetch from 'api/ApiFetch';
import { useEffect } from 'react';
import { encrypt } from 'utils/CipherUtils';

export default function Test() {
    const test = useSelector((state) => state.commonReducer.test);

    const copy = async () => {
        await Clipboard.setStringAsync(test);
    };

    const click = async () => {
        // await loginTest('test1001', 'test100!', '');
        const send = {
            userid: 'test1001',
            pwd: 'test100!',
            url: '',
        };

        await ApiFetch.postForm('loginProcAjax.do', send).then((response) => {
            console.log(response);
        });
    };

    const testCipher = async () => {
        const valueArr = [82047550, 82047551, 82047552, 82047553, 82047554, 91260490, 91352089, 'new1234!'];
        // const valueArr = ['82047550', '82047551', '82047552', '82047553', '82047554', '91260490', '91352089'];
        // const valueArr = ['rlawldms1!', 'rlarla!@#$rla'];

        for (let value of valueArr) {
            encrypt(value);
        }
    };

    useEffect(() => {
        console.log('&&&&&&&&&&&&&&&& aes test &&&&&&&&&&&&&&&&&');
        testCipher();

        // const encryptUsername = CryptoJS.AES.encrypt(value, key).toString();
        // console.log(encryptUsername);

        // Api.test.post('cipher', { encrypt: encryptUsername, key: key, iv: ivString }).then((result) => {
        //     console.log('decrypt ::: ', result);
        // });

        // // var decrypted = CryptoJS.AES.decrypt(encryptUsername, key);
        // // console.log('js :: ', decrypted.toString(CryptoJS.enc.Utf8));

        // console.log('----');

        // const decrypted2 = CryptoJS.AES.decrypt(test.toString(), key, {
        //     iv: iv,
        //     mode: CryptoJS.mode.CBC,
        //     padding: CryptoJS.pad.Pkcs7,
        // });

        // console.log('js :: ', decrypted2.toString(CryptoJS.enc.Utf8));
    }, []);

    return (
        <View style={styles.container}>
            <FontText style={styles.text} onPress={copy}>
                {test}
            </FontText>

            {/* <Pressable style={commonInputStyles.buttonWhite} onPress={click}>
                <FontText>테스트</FontText>
            </Pressable> */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: `center`,
        alignItems: `center`,
    },
    text: {
        flex: 1,
    },
});
