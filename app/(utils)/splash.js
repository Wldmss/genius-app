import { View, StyleSheet, Text } from 'react-native';
import Constants from 'expo-constants';
import { GeniusLogo } from 'utils/ImageUtils';
import ProgressBar from 'utils/ProgressBar';

/** splash screen */
const Splash = ({ isUpdate, updateProgress, version }) => {
    return (
        <View style={styles.container}>
            <View style={styles.center}>
                <GeniusLogo style={styles.logoBox} />
                {isUpdate && <ProgressBar percent={updateProgress} version={version} />}
                <Text style={styles.versionText}>{version ? `v.${version}` : ''}</Text>
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
        justifyContent: `space-between`,
        alignItems: `center`,
    },
    logoBox: {
        flex: 1,
    },
    versionText: {
        textAlign: 'center',
        paddingVertical: 5,
    },
});

export default Splash;
