import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import * as Clipboard from 'expo-clipboard';
import { FontText } from 'utils/TextUtils';
import { commonInputStyles } from 'assets/styles';
import { useEffect } from 'react';
import { encrypt } from 'utils/CipherUtils';
import { dispatchOne } from 'utils/DispatchUtils';
import { downloadAttachment, handleDownloadRequest, snackTest } from 'utils/FileUtils';

export default function Test() {
    const test = useSelector((state) => state.commonReducer.test);

    const copy = async () => {
        await Clipboard.setStringAsync(test);
    };

    const getCopy = async () => {
        const content = await Clipboard.getStringAsync();
        console.log(content);
    };

    const testCipher = async () => {
        console.log('&&&&&&&&&&&&&&&& aes test &&&&&&&&&&&&&&&&&');
        // const valueArr = [82047550, 82047551, 82047552, 82047553, 82047554, 'new1234!'];
        // const valueArr = ['82047550', '82047551', '82047552', '82047553', '82047554', 'new1234'];
        // const valueArr = ['rlawldms1!', 'rlarla!@#$rla'];

        // for (let value of valueArr) {
        //     encrypt(value);
        // }

        encrypt(process.env.TEST_TOKEN);
    };

    const testTest = async () => {
        // const filePath = `${process.env.TEST_URL}/file/download/Pipy,%20DEV-SPACE%20Nexus%20%20레포지토리%20설정.zip`;
        // const filePath = 'https://ktedu.kt.com/file/download.do?fileId=100024328';
        // const fileName = 'Pipy, DEV-SPACE Nexus  레포지토리 설정.zip';

        // const fileName = 'login.pptx';
        // const fileName = 'logo-png.png';
        const fileName = 'test.apk';
        // const filePath = `${process.env.TEST_URL}/file/download/${fileName}`;

        const filePath = 'https://expo.dev/artifacts/eas/po2toeUgD4gEVduxWTR4Df.apk';

        // downloadFs(filePath, fileName);
        // downloadBlobFile(filePath, fileName);
        // downloadAttachment(filePath, fileName);
        handleDownloadRequest(filePath, fileName);

        const path = '/storage/emulated/0/Download/login.pptx';
        // openFile(path);
    };

    const iPhoneTest = async () => {
        const link =
            'itms-services://?action=download-manifest&url=https://c7dc-211-36-151-238.ngrok-free.app/file/download/plist/manifest-test.plist';
        const canOpen = await Linking.canOpenURL(link);
        if (canOpen) {
            Linking.openURL(link);
        }
    };

    const servletFileTest = async () => {
        const data = {
            p_savefile: '',
            p_readfile: '',
        };
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    };

    useEffect(() => {
        store.dispatch(dispatchOne('SET_SPLASH', false));
    }, []);

    return (
        <View style={styles.container}>
            {/* <FontText style={styles.text} onPress={copy}>
                {test}
            </FontText> */}

            <Pressable style={commonInputStyles.buttonWhite} onPress={testTest}>
                <FontText>테스트</FontText>
            </Pressable>
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
