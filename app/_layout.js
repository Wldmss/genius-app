import { Provider } from 'react-redux';
import { StyleSheet, SafeAreaView } from 'react-native';
import store from 'store/store';
import Contents from 'components/Contents';
import Constants from 'expo-constants';
import PopModal from 'modal/PopModal';
import Loading from 'components/Loading';
import { useNotification } from 'utils/Push';

/** layout (main) */
const App = () => {
    useNotification();
    console.log('profile :: ', process.env.EXPO_PUBLIC_PROFILE);

    return (
        <Provider store={store}>
            <SafeAreaView style={styles.container}>
                <Contents />
                <PopModal />
                <Loading />
            </SafeAreaView>
        </Provider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Constants.statusBarHeight,
    },
});

export default App;
