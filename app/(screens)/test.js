import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';
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
import Api from 'api/Api';
import RNFetchBlob from 'rn-fetch-blob';
import { downloadBlobFile, downloadFs, downloadToDevice, handleDownloadRequest } from 'utils/FileUtils';
import { startActivityAsync } from 'expo-intent-launcher';
import SmsRetriever from 'react-native-sms-retriever';
import * as SMS from 'expo-sms';
import * as Linking from 'expo-linking';

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
        // const valueArr = [82047550, 82047551, 82047552, 82047553, 82047554, 'new1234!'];
        // const valueArr = ['82047550', '82047551', '82047552', '82047553', '82047554', 'new1234'];
        // const valueArr = ['rlawldms1!', 'rlarla!@#$rla'];

        // for (let value of valueArr) {
        //     encrypt(value);
        // }

        encrypt('91352089&2024-01-01');
    };

    const blob = () => {
        const url = `${process.env.TEST_URL}/file/download/login.pptx`;
        const fileArr = url.split('/');
        const fileName = fileArr[fileArr.length - 1];

        let DownloadDir = RNFetchBlob.fs.dirs.DownloadDir; // android 저장경로
        let DocumentDir = RNFetchBlob.fs.dirs.DocumentDir; // ios 저장경로

        const dir = Platform.OS == 'android' ? DownloadDir : DocumentDir;

        const commonconfig = {
            useDownloadManager: true,
            notification: true,
            mediaScannable: true,
            title: fileName,
        };

        const configfb = {
            fileCache: true,
            addAndroidDownloads: {
                ...commonconfig,
                path: `${dir}/${fileName}`,
            },
            ...commonconfig,
            path: `${dir}/${fileName}`,
        };

        RNFetchBlob.config(configfb)
            .fetch('GET', url, {})
            .then((res) => {
                if (Platform.OS === 'ios') {
                    RNFetchBlob.fs.writeFile(configfb.path, res.data, 'base64');
                    RNFetchBlob.ios.previewDocument(configfb.path);
                }
                if (Platform.OS === 'android') {
                    console.log('file downloaded');
                }
            });
    };

    const testFetch = async () => {
        // ApiFetch.get(`common/dbCheck.do`)
        //     .then((response) => {
        //         console.log(response);
        //     })
        //     .catch((error) => {
        //         console.log('error');
        //         console.log(error);
        //     });
        // Api.mobile
        //     .get(`common/dbCheck.do`)
        //     .then((response) => {
        //         console.log(response.data)
        //     })
        //     .catch((error) => {
        //         console.log('error');
        //         console.log(error);
        //     });

        Api.test.get('file/download/test.txt').then((response) => {
            console.log(response.data);
            // const type = response.headers['content-type'];
            // const blob = new Blob([response.data], { type: type, encoding: 'UTF-8' });
            // Linking.openURL(response.data);

            const blob = response.data;

            // Create a local file path
            const fileUri = FileSystem.documentDirectory + 'test.txt';

            // Convert the blob to a base64 string
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = async () => {
                const base64data = reader.result.split(',')[1];

                console.log(base64data);

                const directoryUri = getPermission();
                saveReportFile(directoryUri);
                // Write the base64 data to a file
                // await FileSystem.writeAsStringAsync(fileUri, base64data, {
                //     encoding: FileSystem.EncodingType.Base64,
                // });

                console.log('File downloaded to', fileUri);
            };
        });
    };

    const [web, setWeb] = useState(null);
    const [progress, setProgress] = useState(0);
    const url = `${process.env.TEST_URL}/file/download/login.pptx`;
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
        // const directoryUri = FileSystem.documentDirectory + 'Download/';
        // const directoryUri = await getPermission();

        await downloadResumable
            .downloadAsync()
            .then((result) => {
                console.log(result);
                if (result.status === 200) {
                    console.log('Download Complete!', `File saved at: ${result.uri}`);
                    // saveReportFile(directoryUri,result);
                    writeFile(result);
                } else {
                    console.log('Download Failed!', 'Unable to download the file.');
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const writeFile = (result) => {
        const contentType = result.headers['content-type'];
        const typeArr = contentType.split(';');

        ensureDirExists()
            .then(async (dir) => {
                getFile(result.uri).then((contents) => {
                    if (contents != null) {
                        FileSystem.writeAsStringAsync(result.uri, contents, { encoding: FileSystem.EncodingType.UTF8 }).then((res) => {
                            console.log(res);
                        });
                        // FileSystem.StorageAccessFramework.createFileAsync(directoryUri, 'login', typeArr[0])
                        //     .then(async (uri) => {
                        //         console.log(uri);
                        //         FileSystem.writeAsStringAsync(uri, contents)
                        //             .then((content) => {
                        //                 console.log('write Success');
                        //                 console.log(content);
                        //             })
                        //             .catch((e) => console.log(e));
                        //     })
                        //     .then((res) => {
                        //         console.log(res);
                        //         Alert.alert('Success', `File Saved`);
                        //     })
                        //     .catch((e) => {
                        //         console.log(e);
                        //     });
                    }
                });
            })
            .catch((e) => console.log(e));
    };

    const ensureDirExists = async () => {
        const dir = FileSystem.documentDirectory + 'Download/';
        const dirInfo = await FileSystem.getInfoAsync(dir);
        if (!dirInfo.exists) {
            console.log("directory doesn't exist, creating...");
            await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
        } else {
            console.log('directory alreay exists');
        }

        return dir;
    };

    const getFile = async (fileUri) => {
        const result = await FileSystem.getInfoAsync(fileUri);
        if (result.exists) {
            return await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 });
            // FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 }).then((data) => {
            //     FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 }).then((data_1) => {
            //         return data_1;
            //     });
            // });
        } else {
            Alert.alert('파일이 존재하지 않습니다.');
            return null;
        }
    };

    const getPermission = async () => {
        const dir = FileSystem.StorageAccessFramework.getUriForDirectoryInRoot('KTedu');
        console.log(dir);

        FileSystem.StorageAccessFramework.makeDirectoryAsync(dir, 'KTedu').then((result) => {
            console.log(result);
        });

        return null;

        // return `${directory}/KTedu`;

        // const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        // if (!permissions.granted) return null;

        // const directoryUri = permissions.directoryUri;
        // console.log(directoryUri);

        return directoryUri;
    };

    const saveReportFile = async (directoryUri, result) => {
        try {
            await FileSystem.StorageAccessFramework.createFileAsync(directoryUri, 'test.txt', result.headers['content-type'])
                .then(async (uri) => {
                    console.log(uri);
                    // await FileSystem.writeAsStringAsync(uri, result.md5, {
                    //     encoding: FileSystem.EncodingType.Base64,
                    // }); //{ encoding: FileSystem.EncodingType.Base64 }
                })
                .then((res) => {
                    console.log(res);
                    Alert.alert('Success', `File Saved`);
                })
                .catch((e) => {
                    console.log(e);
                });
        } catch (error) {
            Alert.alert('Error', `Could not Download file ${error.message}`);
        }
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

    const webTest = async (urlPath) => {
        await WebBrowser.openBrowserAsync(urlPath, {
            toolbarColor: 'white', // 안드로이드 옵션
            controlsColor: 'white', // iOS 옵션
            dismissButtonStyle: 'close', // iOS 옵션
            readerMode: false, // iOS 옵션
            enableBarCollapsing: true, // iOS 옵션
        });
    };

    const downloadTest = () => {
        downloadBlobFile('https://dev.ktedu.kt.com:2443/mobile/m/educontents/courseData/courseDataDetail.do?contId=200015892', '개발자용.pptx');
    };

    const testTest = async () => {
        // const filePath = 'https://ktedu.kt.com/file/download.do?fileId=100024328';
        // const filePath = `${process.env.TEST_URL}/file/download/Pipy,%20DEV-SPACE%20Nexus%20%20레포지토리%20설정.zip`;
        // const fileName = 'Pipy, DEV-SPACE Nexus  레포지토리 설정.zip';

        const fileName = 'login.pptx';
        const filePath = `${process.env.TEST_URL}/file/download/${fileName}`;
        // downloadFs(filePath, fileName);
        // downloadBlobFile(filePath, fileName);
        handleDownloadRequest(filePath, fileName);

        const path = '/storage/emulated/0/Download/login.pptx';
        // openFile(path);
    };

    const onPhoneNumberPressed = async () => {
        try {
            const phoneNumber = await SmsRetriever.requestPhoneNumber();
        } catch (error) {
            console.log(JSON.stringify(error));
        }
    };

    const startSms = async () => {
        const isAvailable = await SMS.isAvailableAsync();
        if (isAvailable) {
            // new Promise((resolve) => setTimeout(resolve, 2000)).then(async () => {
            //     const result = SMS.sendSMSAsync(['01089876481'], '인증번호는 123456 입니다');
            //     // console.log('------sendSMSAsync-------');
            //     // console.log(result);
            // });

            try {
                const registerd = await SmsRetriever.startSmsRetriever();
                console.log(registerd);
                if (registerd) {
                    SmsRetriever.addSmsListener((event) => {
                        const message = event.message;
                        console.log(message);
                        const otp = extractOtpFromMessage(message);
                        console.log(otp);
                        SmsRetriever.removeSmsListener();
                    });
                }
            } catch (error) {
                console.log(error);
            }

            const result = SMS.sendSMSAsync(['01089876481'], '인증번호는 123456 입니다');
            // Cleanup listener on unmount
            // return () => {
            //     SmsRetriever.removeSmsListener();
            // };
        }
    };

    useEffect(() => {
        startSmsListener(true);
        return () => {
            SmsRetriever.removeSmsListener();
        };
    }, []);

    const startSmsListener = async (send) => {
        try {
            const registered = await SmsRetriever.startSmsRetriever();
            console.log(registered);
            if (registered) {
                if (!send) {
                    const { result } = await SMS.sendSMSAsync(['01089876481'], '인증번호는 123456입니다');
                    console.log(result);
                }

                SmsRetriever.addSmsListener((event) => {
                    const message = event.message;
                    // Extract OTP from message using regex
                    const otpRegex = /(\d{4,6})/;
                    const otpMatch = message.match(otpRegex);
                    if (otpMatch) {
                        console.log(otpMatch[0]);
                    }
                    SmsRetriever.removeSmsListener();
                });
            }
        } catch (error) {
            console.error('Error starting SMS Retriever', error);
        }
    };

    const extractOtpFromMessage = (message) => {
        // Assuming the OTP is a 6-digit number in the message
        const otpMatch = message.match(/\d{6}/);
        return otpMatch ? otpMatch[0] : null;
    };

    const checkOpen = async () => {
        const app_link = 'hunetmlc1621://?cSeq=1621&userId=kt_test1001';

        const supported = await Linking.canOpenURL(app_link);

        console.log(supported);
        if (supported) {
            await Linking.openURL(app_link);
        }
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
