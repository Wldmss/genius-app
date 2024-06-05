import { Pressable, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import * as Clipboard from 'expo-clipboard';
import { FontText } from 'utils/TextUtils';
import { commonInputStyles } from 'assets/styles';
import * as ApiFetch from 'api/ApiFetch';
import { useEffect, useState } from 'react';
import { encrypt } from 'utils/CipherUtils';
import * as FileSystem from 'expo-file-system';
import { dispatchOne } from 'utils/DispatchUtils';
import * as WebBrowser from 'expo-web-browser';

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
        console.log('&&&&&&&&&&&&&&&& aes test &&&&&&&&&&&&&&&&&');
        const valueArr = [82047550, 82047551, 82047552, 82047553, 82047554, 91260490, 91352089, 'new1234!'];
        // const valueArr = ['82047550', '82047551', '82047552', '82047553', '82047554', '91260490', '91352089'];
        // const valueArr = ['rlawldms1!', 'rlarla!@#$rla'];

        for (let value of valueArr) {
            encrypt(value);
        }
    };

    const [web, setWeb] = useState(null);
    const [progress, setProgress] = useState(0);
    const url = 'https://85a4-117-111-17-91.ngrok-free.app/file/download/test.txt';
    // const url = 'https://expo.dev/artifacts/eas/skcuKXwqy65NwwVP7CRyje.apk';
    const fileArr = url.split('/');
    const fileName = fileArr[fileArr.length - 1];
    console.log(fileName);
    const downloadPath = FileSystem.documentDirectory + '';

    const downloadCallback = (downloadProgress) => {
        const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        console.log(progress);
        setProgress(progress);
    };

    const downloadResumable = FileSystem.createDownloadResumable(url, downloadPath + fileName, {}, downloadCallback);

    const download = async () => {
        await downloadResumable
            .downloadAsync()
            .then((result) => {
                console.log(result);

                if (result.status === 200) {
                    console.log('Download Complete!', `File saved at: ${result.uri}`);
                    setWeb(result.uri);
                    moveFile(result.uri);
                } else {
                    console.log('Download Failed!', 'Unable to download the file.');
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const moveFile = async (downloadUri) => {
        if (downloadUri) {
            const newLocation = FileSystem.documentDirectory + 'KTedu/' + downloadUri.split('/').pop();
            console.log(newLocation);
            try {
                await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'KTedu/', { intermediates: true });
                await FileSystem.moveAsync({
                    from: downloadUri,
                    to: newLocation,
                });
                console.log('File moved to:', newLocation);
                // setNewUri(newLocation);
            } catch (e) {
                console.error('Error moving file:', e);
            }
        } else {
            console.error('No file to move');
        }
    };

    const webTest = async () => {
        await WebBrowser.openBrowserAsync(url, {
            toolbarColor: 'white', // 안드로이드 옵션
            controlsColor: 'white', // iOS 옵션
            dismissButtonStyle: 'close', // iOS 옵션
            readerMode: false, // iOS 옵션
            enableBarCollapsing: true, // iOS 옵션
        });
    };

    useEffect(() => {
        store.dispatch(dispatchOne('SET_SPLASH', false));

        // webTest();
        // download();
        // testCipher();
    }, []);

    return (
        <View style={styles.container}>
            {/* <FontText style={styles.text} onPress={copy}>
                {test}
            </FontText> */}

            <Pressable style={commonInputStyles.buttonWhite} onPress={download}>
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
