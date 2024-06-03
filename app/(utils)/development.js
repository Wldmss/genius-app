import { StyleSheet, View } from 'react-native';
import { FontDefault } from 'utils/TextUtils';
import Constants from 'expo-constants';

const Development = ({ isDev }) => {
    return (
        isDev && (
            <View style={styles.container} pointerEvents="none">
                <FontDefault style={styles.text}>개발자 모드</FontDefault>
            </View>
        )
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: Constants.statusBarHeight,
        alignItems: `center`,
        position: `absolute`,
        width: `100%`,
        zIndex: 1,
    },
    text: {
        verticalAlign: `middle`,
        fontSize: 50,
        opacity: 0.05,
    },
});

export default Development;
