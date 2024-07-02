import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import * as Clipboard from 'expo-clipboard';
import { FontText } from 'utils/TextUtils';
import { commonInputStyles } from 'assets/styles';
import { useEffect } from 'react';
import { encrypt } from 'utils/CipherUtils';
import { dispatchOne } from 'utils/DispatchUtils';
import { downloadAttachment, downloadBlobFile, handleDownloadRequest, snackTest } from 'utils/FileUtils';
import Api from 'api/Api';
import { okAlert } from 'utils/AlertUtils';

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
        // const fileName = 'test.apk';
        // const filePath = `${process.env.TEST_URL}/file/download/${fileName}`;

        // const filePath = 'https://expo.dev/artifacts/eas/po2toeUgD4gEVduxWTR4Df.apk';

        // const data = {
        //     fileNm: fileName,
        // };

        const filePath = 'https://dev.ktedu.kt.com:2443/file/download2.do';
        const data = {
            fileNm: '2021002.jpg',
            p_savefile: '377ec773-1901-4e87-855f-fb85cb56dbea.jpg',
            p_readfile: '2021002.jpg',
            dir: '/boards/notice',
            dwType: 'textbook',
        };

        // const filePath = 'https://ktedu.kt.com/servlet/controller.library.DownloadServlet';
        // const data = {
        //     fileNm: '2024 지니어스2.0-사용자 매뉴얼.pdf',
        //     p_savefile: 'd9325bdc-5eaf-44d8-b91d-e8424a9a81e0.pdf',
        //     p_realfile: '2024 지니어스2.0-사용자 매뉴얼.pdf',
        //     dir: '/boards/notice',
        //     dwType: 'textbook',
        // };

        // downloadFs(filePath, fileName);
        // downloadBlobFile(filePath, data);
        // downloadAttachment(filePath, data);
        // handleDownloadRequest(filePath, data);

        const path = '/storage/emulated/0/Download/login.pptx';
        // openFile(path);

        // await Api.mobile
        //     .post('file/download2.do', data)
        //     .then((response) => {
        //         okAlert(JSON.stringify(response));
        //         console.log(response);
        //     })
        //     .catch((err) => {
        //         console.log(err);
        //     });

        await Api.test
            .get('api/v1/check')
            .then((res) => {
                console.log(res);
            })
            .catch((err) => {
                // console.log(err);
            });
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
            p_savefile: 'd9325bdc-5eaf-44d8-b91d-e8424a9a81e0.pdf',
            p_readfile: '2024 지니어스2.0-사용자 매뉴얼.pdf',
        };
        await fetch('https://', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.log(error);
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
