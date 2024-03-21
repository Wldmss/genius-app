import { View, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { GeniusLogo } from 'utils/ImageUtils';

/** splash screen */
const Splash = () => {
    return (
        <View style={styles.container}>
            <GeniusLogo />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Constants.statusBarHeight,
        justifyContent: `center`,
        alignItems: `center`,
    },
});

export default Splash;
