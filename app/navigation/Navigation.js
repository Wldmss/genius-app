import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Alert, BackHandler, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

const Navigation = () => {
    const commonOptions = { headerShown: false };
    const tab = useSelector((state) => state.loginReducer.tab);

    // 앱 종료
    const closeGenius = () => {
        BackHandler.exitApp();
    };

    useEffect(() => {
        // Handle back event
        const backHandler = () => {
            if (tab != 'WEB') {
                Alert.alert(
                    '앱 종료',
                    'GENIUS를 종료하시겠습니까?',
                    [
                        { text: '아니요', onPress: () => null, style: 'cancel' },
                        { text: '예', onPress: () => closeGenius() },
                    ],
                    { cancelable: false }
                );
            }
            return true;
        };
        // Subscribe to back state event
        BackHandler.addEventListener('hardwareBackPress', backHandler);

        // Unsubscribe
        return () => BackHandler.removeEventListener('hardwareBackPress', backHandler);
    }, [tab]);

    return (
        <Stack screenOptions={commonOptions}>
            <Stack.Screen name="(login)" options={commonOptions} />
            <Stack.Screen name="(screens)" options={commonOptions} />
        </Stack>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 20,
    },
});

export default Navigation;
