import { Pressable, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import * as Clipboard from 'expo-clipboard';
import { FontText } from 'utils/TextUtils';
import { commonInputStyles } from 'assets/styles';
import { loginTest } from 'api/LoginApi';
import axios from 'axios';
import ApiFetch from 'api/ApiFetch';

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
