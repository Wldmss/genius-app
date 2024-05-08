import { View, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { GeniusLogo } from 'utils/ImageUtils';
import ProgressBar from 'utils/ProgressBar';

/** splash screen */
const Splash = ({ isUpdate, updateProgress, version }) => {
    return (
        <View style={styles.container}>
            <View style={styles.center}>
                <GeniusLogo />
                {isUpdate && <ProgressBar percent={updateProgress} version={version} />}
            </View>
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
    center: {
        flex: 1,
        width: `100%`,
        alignItems: `center`,
    },
});

export default Splash;
