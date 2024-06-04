import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';

/** 사용 x */
export const handleDownloadRequest = async (url) => {
    const [progress, setProgress] = useState(0);

    const fileArr = url.split('/');
    const fileName = fileArr[fileArr.length - 1];
    const downloadPath = FileSystem.documentDirectory + '/Download/';

    const downloadCallback = (downloadProgress) => {
        const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        console.log(progress);
        setProgress(progress);
    };

    const downloadResumable = FileSystem.createDownloadResumable(url, downloadPath + fileName, {}, downloadCallback);

    await downloadResumable.downloadAsync().then((result) => {
        console.log(result);

        if (result.status === 200) {
            console.log('Download Complete!', `File saved at: ${result.uri}`);
        } else {
            console.log('Download Failed!', 'Unable to download the file.');
        }
    });

    // 다운로드 링크를 WebView에서 열지 않도록 방지
    // ref.current.stopLoading();
};

export const downloadFile = () => {
    const url = 'https://85a4-117-111-17-91.ngrok-free.app/file/download/test.txt';
    handleDownloadRequest(url);
};
