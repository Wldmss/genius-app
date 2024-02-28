import { useEffect } from 'react';
import { Alert, StyleSheet, SafeAreaView, Text, StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import store from 'store/store';
import * as Updates from 'expo-updates';
import PopModal from 'modal/PopModal';
import Navigation from 'navigation/Navigation';
// import Push from 'utils/Push';

export default function RootLayout() {
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
        if (process.env.APP_ENV == 'production') onFetchUpdateAsync();
    }, []);

    return (
        <Provider store={store}>
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="default" />
                <Navigation />
                <PopModal />
                {/* <Push /> */}
            </SafeAreaView>
        </Provider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
