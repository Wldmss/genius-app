import React from 'react';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';

/** 사용 x */
export const handleDownloadRequest = async (url, ref) => {
    console.log(url);
    console.log(FileSystem.documentDirectory);

    // 예제로 파일 다운로드 URL을 확인
    if (url.includes('/download-file')) {
        try {
            const downloadResult = await FileSystem.downloadAsync(url, FileSystem.documentDirectory + 'example.pdf');

            if (downloadResult.status === 200) {
                Alert.alert('Download Complete!', `File saved at: ${downloadResult.uri}`);
            } else {
                Alert.alert('Download Failed!', 'Unable to download the file.');
            }
        } catch (error) {
            console.error('Error downloading file:', error);
            Alert.alert('Download Failed!', 'An error occurred while downloading the file.');
        }

        // 다운로드 링크를 WebView에서 열지 않도록 방지
        ref.current.stopLoading();
    }
};
