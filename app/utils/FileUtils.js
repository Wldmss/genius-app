import { Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import RNFetchBlob from 'rn-fetch-blob';
import * as RNFS from 'react-native-fs';
import { dispatchOne } from './DispatchUtils';
import { startActivityAsync } from 'expo-intent-launcher';
import { isAvailableAsync, shareAsync } from 'expo-sharing';

export const fileStore = (_store) => {
    store = _store;
};

/** 파일 util */

export const downloadAttachment = async (url, fileName) => {
    console.log(url);
    console.log(fileName);

    // 파일명 check
    if (!fileName) {
        const fileArr = url.split('/');
        fileName = fileArr.length > 0 ? fileArr[fileArr.length - 1] : null;

        if (fileName == null) {
            Alert.alert('올바르지 않은 경로입니다.\n다시 시도해주세요.');
            return;
        }
    }

    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

    try {
        store.dispatch(dispatchOne('SET_SNACK', { message: '다운로드를 시작합니다.', hold: true }));

        const dir = FileSystem.documentDirectory;
        let downloadPath = `${dir}/${fileName}`;

        if (Platform.OS == 'android') {
            // 앱 내 저장소에 저장됨
            const fileExists = await FileSystem.getInfoAsync(downloadPath);
            if (fileExists.exists) {
                await FileSystem.deleteAsync(downloadPath);
            }
        } else {
            // ios 파일이 덮어진다
            const uniqueFileName = await getUniqueFileName(dir, fileName);
            downloadPath = `${dir}/${uniqueFileName}`;
        }

        store.dispatch(dispatchOne('SET_SNACK', { message: `다운로드 중...`, hold: true }));

        // 파일 다운로드
        const response = await fetch(url, {
            headers: {
                'User-Agent': userAgent,
            },
        });

        if (!response.ok) {
            failDownload();
            return;
        }

        const blob = await response.blob();

        const reader = new FileReader();

        reader.onloadend = async () => {
            const base64data = reader.result.split(',')[1];
            await FileSystem.writeAsStringAsync(downloadPath, base64data, {
                encoding: FileSystem.EncodingType.Base64,
            });

            console.log('File downloaded to:', downloadPath);

            if (Platform.OS == 'android') {
                downloadAndroid(downloadPath, fileName);
            } else {
                const contentType = response.headers.get('Content-Type') || response.headers.get('content-type') || blob.type;
                const mimeType = contentType != null ? contentType.split(';')[0] : null;

                openIos(downloadPath, mimeType);
            }
        };

        reader.onprogress = (event) => {
            if (event.lengthComputable) {
                const percent = Math.round((event.loaded / event.total) * 100);
                console.log(percent);
                store.dispatch(dispatchOne('SET_SNACK', { message: `다운로드 중... (${percent}%)`, hold: true }));
            } else {
                store.dispatch(dispatchOne('SET_SNACK', { message: `다운로드 중...`, hold: true }));
            }
        };

        reader.onerror = function () {
            failDownload();
        };

        reader.readAsDataURL(blob);
    } catch (error) {
        failDownload();
        console.error('Download failed:', error);
    }
};

// android 파일 저장 : 단말 저장은 따로 해줘야 함
const downloadAndroid = async (uri, fileName) => {
    try {
        const result = await FileSystem.getInfoAsync(uri);

        if (result.exists) {
            const isZipFile = uri.match(/\.zip$/i);

            const dir = RNFS.DownloadDirectoryPath; // android 저장경로
            const uniqueFileName = await getUniqueFileName(dir, fileName);
            const filePath = `${dir}/${uniqueFileName}`;

            try {
                // 단말에 파일 저장
                const fileExists = await RNFS.exists(filePath);

                if (fileExists) {
                    await RNFS.unlink(filePath);
                }

                const tempFilePath = `${filePath}.tmp`;

                await RNFS.copyFile(uri, tempFilePath);

                await RNFS.moveFile(tempFilePath, filePath);
            } catch (error) {
                console.log(error);
            }

            finishDownload();

            // 파일 열기
            new Promise((resolve) => setTimeout(resolve, 500)).then(async () => {
                await FileSystem.getContentUriAsync(uri).then(async (cUri) => {
                    let launcherParams = {
                        data: cUri,
                        flags: 1,
                    };

                    if (isZipFile) {
                        launcherParams['type'] = 'application/zip';
                    }

                    await startActivityAsync('android.intent.action.VIEW', launcherParams);
                });
            });
        } else {
            failDownload();
        }
    } catch (error) {
        failDownload();
        console.error(error);
    }
};

// ios 파일 열기 : ios 는 expo-file-system 만으로도 단말에 저장됨
const openIos = async (uri, mimeType) => {
    finishDownload();

    try {
        // 파일 열기
        RNFetchBlob.ios.openDocument(uri);
    } catch (err) {
        // 파일 share
        if (mimeType && (await isAvailableAsync())) {
            await shareAsync(uri, {
                UTI: mimeType,
                mimeType: mimeType,
            });
        }
    }
};

// 다운로드 완료
const finishDownload = () => {
    store.dispatch(dispatchOne('SET_SNACK', { message: `다운로드가 완료되었습니다.`, hold: false, time: 2000 })); // \n${filePath}
};

// 다운로드 실패
const failDownload = () => {
    store.dispatch(dispatchOne('SET_SNACK', { message: '다운로드에 실패하였습니다.', hold: false }));
};

// 파일 다운로드 (expo-file-system) (사용 x, android 에서 chunked 이슈)
export const handleDownloadRequest = async (url, fileName) => {
    console.log(url);
    console.log(fileName);

    // 파일명 check
    if (!fileName) {
        const fileArr = url.split('/');
        fileName = fileArr.length > 0 ? fileArr[fileArr.length - 1] : null;

        if (fileName == null) {
            Alert.alert('올바르지 않은 경로입니다.\n다시 시도해주세요.');
            return;
        }
    }

    // 다운로드 progress
    const downloadCallback = (downloadProgress) => {
        console.log(downloadProgress);
        const percentage = Math.max(downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite, 0) * 90;
        // store.dispatch(dispatchOne('SET_SNACK', { message: `다운로드 중... (${Math.round(percentage)}%)`, hold: true }));
        store.dispatch(dispatchOne('SET_SNACK', { message: `다운로드 중...`, hold: true }));
    };

    try {
        store.dispatch(dispatchOne('SET_SNACK', { message: '다운로드를 시작합니다.', hold: true }));

        const dir = FileSystem.documentDirectory;
        let downloadPath = `${dir}/${fileName}`;

        if (Platform.OS == 'android') {
            // 앱 내 저장소에 저장됨
            const fileExists = await FileSystem.getInfoAsync(downloadPath);
            if (fileExists.exists) {
                await FileSystem.deleteAsync(downloadPath);
            }
        } else {
            // ios 파일이 덮어진다
            const uniqueFileName = await getUniqueFileName(dir, fileName);
            downloadPath = `${dir}/${uniqueFileName}`;
        }

        const downloadResumable = FileSystem.createDownloadResumable(url, downloadPath, {}, downloadCallback);

        // 파일 다운로드
        await downloadResumable
            .downloadAsync()
            .then((result) => {
                if (result.status == 200) {
                    if (Platform.OS == 'android') {
                        downloadAndroid(result.uri, fileName);
                    } else {
                        const contentType = result.headers['Content-Type'] || result.headers['content-type'];
                        const mimeType = contentType != null ? contentType.split(';')[0] : null;

                        openIos(result.uri, mimeType);
                    }

                    console.log('Download Complete!', `File saved at: ${result.uri}`);
                } else {
                    failDownload();
                    console.error('Failed to download file:', result.status);
                }
            })
            .catch((err) => {
                failDownload();
                console.log(err);
            });
    } catch (error) {
        failDownload();
        console.error('Error downloading file:', error);
    }
};

// ios, android 다운로드 분기 처리 (사용 x)
export const downloadFileMulti = (url, fileName) => {
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
            background: false,
            cacheable: false,
            connectionTimeout: 60 * 1000,
            readTimeout: 120 * 1000,
            // discretionary: true,
            // progressDivider: 1,
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
        counter++;
    }

    return uniqueName;
};

const checkUnique = async (filePath) => {
    console.log(filePath);
    const rnExists = await RNFS.exists(filePath);
    const exists = await FileSystem.getInfoAsync(filePath);
    return rnExists || exists.exists;
};
