import { commonInputStyles } from 'assets/styles';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { FontText } from 'utils/TextUtils';

const error_img = require('assets/images/error.png');

const ErrorPage = ({ goBack }) => {
    const isDev = useSelector((state) => state.commonReducer.isDev);

    const retry = () => {
        if (goBack) {
            goBack();
        } else {
            store.dispatch({ type: 'INIT_APP' });
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Image source={error_img} style={styles.logo} resizeMode="contain" />
                <FontText style={styles.textBox}>정보를 불러 올 수 없습니다</FontText>
            </View>
            <Pressable style={[commonInputStyles.buttonWhite, styles.btnBox]} onPress={retry}>
                <FontText style={styles.textBox}>뒤로가기</FontText>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: `space-between`,
        alignItems: `center`,
        gap: 10,
        padding: 20,
        backgroundColor: `#fff`,
    },
    content: {
        flex: 1,
        justifyContent: `center`,
        alignItems: `center`,
        gap: 40,
    },
    btnBox: {
        alignItems: `center`,
        justifyContent: `center`,
        borderWidth: 1,
        borderColor: `#ddd`,
        paddingHorizontal: 20,
        paddingVertical: 10,
        height: 60,
        lineHeight: 58,
        width: `100%`,
        margin: `auto`,
        borderRadius: 6,
    },
    textBox: {
        fontWeight: `600`,
        fontSize: 18,
    },
});

export default ErrorPage;
