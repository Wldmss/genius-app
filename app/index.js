import { useEffect } from 'react';
import { Alert } from 'react-native';
import * as Updates from 'expo-updates';
import { Redirect } from 'expo-router';

/** index */
const Page = () => {
    // 앱 업데이트 체크
    async function onFetchUpdateAsync() {
        try {
            const update = await Updates.checkForUpdateAsync();

            if (update.isAvailable) {
                Alert.alert('업데이트합니다.');
                await Updates.fetchUpdateAsync();
                await Updates.reloadAsync();
            }
        } catch (error) {
            alert(`Error fetching latest Expo update: ${error}`);
        }
    }

    useEffect(() => {
        if (process.env.EXPO_PUBLIC_PROFILE == 'production') onFetchUpdateAsync();
    }, []);
};

export default Page;
