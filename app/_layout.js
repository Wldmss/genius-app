import { Provider } from 'react-redux';
import { StyleSheet, SafeAreaView } from 'react-native';
import PopModal from 'modal/PopModal';
import Contents from 'components/Contents';
import store from 'store/store';
import Constants from 'expo-constants';
import Loading from 'components/Loading';
// import Push from 'utils/Push';

const App = () => {
    return (
        <Provider store={store}>
            <SafeAreaView style={styles.container}>
                <Contents />
                <PopModal />
                <Loading />
                {/* <Push /> */}
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
