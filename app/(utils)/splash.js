import { View, StyleSheet, Text } from 'react-native';
import Constants from 'expo-constants';
import ProgressBar from 'utils/ProgressBar';
import { useSelector } from 'react-redux';
import { GeniusLottie } from 'utils/Lottie';

/** splash screen */
const Splash = ({ isUpdate, version }) => {
    const splash = useSelector((state) => state.commonReducer.splash);

    return (
        splash && (
            <View style={styles.container}>
                <View style={styles.center}>
                    <GeniusLottie />
                    {isUpdate && <ProgressBar />}
                    <Text style={styles.versionText}>{version ? `v.${version}` : ''}</Text>
                </View>
            </View>
        )
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: Constants.statusBarHeight,
        justifyContent: `center`,
        alignItems: `center`,
        position: `absolute`,
        width: `100%`,
        height: `100%`,
        zIndex: 1,
        backgroundColor: `white`,
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
        marginBottom: 10,
        color: `#8a8a8a`,
    },
});

export default Splash;
