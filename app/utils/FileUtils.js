import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import RNFetchBlob from 'rn-fetch-blob';
import * as RNFS from 'react-native-fs';
import { dispatchOne } from './DispatchUtils';
import { startActivityAsync } from 'expo-intent-launcher';
import { shareAsync } from 'expo-sharing';
import { okAlert } from './AlertUtils';

export const fileStore = (_store) => {
    store = _store;
};

/** 파일 util */
export const handleDownloadRequest = async (url, fileName) => {
    console.log(url);
    console.log(fileName);

    if (!fileName) {
        const fileArr = url.split('/');
        fileName = fileArr[fileArr.length - 1];
    }

    const downloadPath = `${FileSystem.documentDirectory}${fileName}`;

    const downloadCallback = (downloadProgress) => {
        const percentage = (downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite) * 90;
        // (${Math.round(percentage)}%)
        store.dispatch(dispatchOne('SET_SNACK', { message: `다운로드 중...`, hold: true }));
    };

    try {
        store.dispatch(dispatchOne('SET_SNACK', { message: '다운로드를 시작합니다.', hold: true }));

        const fileExists = await FileSystem.getInfoAsync(downloadPath);

        if (fileExists.exists) {
            await FileSystem.deleteAsync(downloadPath);
        }

        const downloadResumable = FileSystem.createDownloadResumable(url, downloadPath, {}, downloadCallback);

        await downloadResumable
            .downloadAsync()
            .then((result) => {
                if (result.status == 200) {
                    const contentType = result.headers['Content-Type'] || result.headers['content-type'];
                    const mimeType = contentType != null ? contentType.split(';')[0] : null;

                    downloadToDevice(result.uri, mimeType, fileName);
                    console.log('Download Complete!', `File saved at: ${result.uri}`);
                } else {
                    store.dispatch(dispatchOne('SET_SNACK', { message: '다운로드에 실패하였습니다.', hold: false }));
                    console.error('Failed to download file:', result.status);
                }
            })
            .catch((err) => {
                store.dispatch(dispatchOne('SET_SNACK', { message: '다운로드에 실패하였습니다.', hold: false }));
            });
    } catch (error) {
        store.dispatch(dispatchOne('SET_SNACK', { message: '다운로드에 실패하였습니다.', hold: false }));
        console.error('Error downloading file:', error);
    }
};

// 단말에 파일 저장
export const downloadToDevice = async (uri, mimeType, fileName) => {
    try {
        const result = await FileSystem.getInfoAsync(uri);

        if (result.exists) {
            const DownloadDir = RNFS.DownloadDirectoryPath; // android 저장경로
            const DocumentDir = RNFS.DocumentDirectoryPath; // ios 저장경로
            const isZipFile = uri.match(/\.zip$/i);

            const dir = Platform.OS == 'android' ? DownloadDir : DocumentDir;

            const uniqueFileName = await getUniqueFileName(dir, fileName);
            const filePath = `${dir}/${uniqueFileName}`;

            try {
                const fileExists = await RNFS.exists(filePath);

                if (fileExists) {
                    await RNFS.unlink(filePath);
                }

                const tempFilePath = `${filePath}.tmp`;

                await RNFS.copyFile(uri, tempFilePath);

                await RNFS.moveFile(tempFilePath, filePath);
            } catch (err) {
                console.log(err);
            }

            try {
                if (Platform.OS == 'android' && isZipFile) {
                    await FileSystem.getContentUriAsync(uri).then(async (cUri) => {
                        let launcherParams = {
                            data: cUri,
                            flags: 1,
                        };

                        if (isZipFile) {
                            launcherParams['type'] = 'application/zip';
                        }

                        finishDownload();
                        await startActivityAsync('android.intent.action.VIEW', launcherParams);
                    });
                } else {
                    finishDownload();
                    if (mimeType) {
                        await shareAsync(uri, {
                            UTI: mimeType,
                            mimeType: mimeType,
                        });
                    }
                }
            } finally {
                finishDownload();
            }
        }
    } catch (error) {
        store.dispatch(dispatchOne('SET_SNACK', { message: '다운로드에 실패하였습니다.', hold: false }));
        okAlert(JSON.stringify(error));
        console.error(error);
    }
};

// 다운로드 완료
const finishDownload = () => {
    store.dispatch(dispatchOne('SET_SNACK', { message: `다운로드가 완료되었습니다.`, hold: false, time: 2000 })); // \n${filePath}
};

// ios, android 다운로드 분기 처리 (사용 x)
export const downloadFile = (url, fileName) => {
    if (Platform.OS == 'ios') {
        downloadBlobFile(url, fileName);
    } else {
        downloadFs(url, fileName);
    }
};

// rn-fetch-blob :: android 14 이상 RECEIVER_EXPORTED or RECEIVER_NOT_EXPORTED 설정 해줘야 함 (사용 x)
export const downloadBlobFile = (url, fileName) => {
    if (!fileName) {
        const fileArr = url.split('/');
        fileName = fileArr[fileArr.length - 1];
    }

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

    store.dispatch(dispatchOne('SET_SNACK', { message: '다운로드를 시작합니다.', hold: true }));
    RNFetchBlob.config(configfb)
        .fetch('GET', url, {})
        .progress((res) => {
            store.dispatch(dispatchOne('SET_SNACK', { message: `다운로드 중...`, hold: true }));
        })
        .then((res) => {
            if (Platform.OS === 'ios') {
                RNFetchBlob.fs.writeFile(configfb.path, res.data, 'base64');
                RNFetchBlob.ios.previewDocument(configfb.path);
            }

            if (Platform.OS === 'android') {
                console.log('file downloaded');
            }

            store.dispatch(dispatchOne('SET_SNACK', { message: `다운로드가 완료되었습니다.`, hold: false, time: 5000 }));
        });
};

// react-native-fs (사용 x)
export const downloadFs = async (url, fileName) => {
    console.log(url);
    console.log(fileName);

    if (!fileName) {
        const fileArr = url.split('/');
        fileName = fileArr[fileArr.length - 1];
    }

    const DownloadDir = RNFS.DownloadDirectoryPath; // android 저장경로
    const DocumentDir = RNFS.DocumentDirectoryPath; // ios 저장경로

    const dir = Platform.OS == 'android' ? DownloadDir : DocumentDir;
    const uniqueFileName = await getUniqueFileName(dir, fileName);
    const filePath = `${dir}/${uniqueFileName}`;

    try {
        store.dispatch(dispatchOne('SET_SNACK', { message: '다운로드를 시작합니다.', hold: true }));

        const downloadResult = await RNFS.downloadFile({
            fromUrl: url,
            toFile: filePath,
            background: true,
            discretionary: true,
            progressDivider: 1,
            progress: (res) => {
                const percentage = (res.bytesWritten / res.contentLength) * 100;
                store.dispatch(dispatchOne('SET_SNACK', { message: `다운로드 중... (${Math.round(percentage)}%)`, hold: true }));
            },
        }).promise;

        if (downloadResult.statusCode === 200) {
            store.dispatch(dispatchOne('SET_SNACK', { message: `다운로드가 완료되었습니다.\n${filePath}`, hold: false, time: 5000 }));
            if (Platform.OS === 'ios') {
                RNFS.readFile(filePath, 'base64').then((contents) => {
                    console.log('File contents (base64):', contents);
                });
            } else {
                // openFile(filePath);
            }
        } else {
            store.dispatch(dispatchOne('SET_SNACK', { message: '다운로드에 실패하였습니다.', hold: false }));
            console.error('Failed to download file:', downloadResult.statusCode);
        }
    } catch (error) {
        store.dispatch(dispatchOne('SET_SNACK', { message: '다운로드에 실패하였습니다.', hold: false }));
        console.error('Error downloading file:', error);
    }
};

// 파일명 중복 처리
const getUniqueFileName = async (dir, fileName) => {
    let name = fileName;
    let extension = '';
    const dotIndex = fileName.lastIndexOf('.');

    if (dotIndex !== -1) {
        name = fileName.substring(0, dotIndex);
        extension = fileName.substring(dotIndex);
    }

    let uniqueName = fileName;
    let counter = 1;

    while (await RNFS.exists(`${dir}/${uniqueName}`)) {
        uniqueName = `${name}(${counter})${extension}`;
        counter += 1;
    }

    return uniqueName;
};
