import { View, StyleSheet, Pressable } from 'react-native';
import Constants from 'expo-constants';
import { GeniusLogo } from 'utils/ImageUtils';
import { commonInputStyles } from 'assets/styles';
import { FontText } from 'utils/TextUtils';
import ProgressBar from 'utils/ProgressBar';

/** splash screen */
const Splash = ({ isUpdate, updateProgress, onFetchUpdateAsync, version }) => {
    return (
        <View style={styles.container}>
            <View style={styles.center}>
                <GeniusLogo />
                {isUpdate && <ProgressBar percent={updateProgress} version={version} />}
            </View>
            <View style={styles.test}>
                <Pressable style={commonInputStyles.buttonWhite} onPress={() => onFetchUpdateAsync(false)}>
                    <FontText>업데이트 체크</FontText>
                </Pressable>
                <Pressable style={commonInputStyles.buttonWhite} onPress={() => onFetchUpdateAsync(true)}>
                    <FontText>업데이트3</FontText>
                </Pressable>
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
