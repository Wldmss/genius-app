import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { FontText } from 'utils/TextUtils';

import BackIcon from 'assets/icons/icon-back.svg';
import { useSelector } from 'react-redux';

import Constants from 'expo-constants';
import { dispatchMultiple } from 'utils/DispatchUtils';

/** 뒤로 가기 헤더 */
const BackHeader = () => {
    const webPinFlag = useSelector((state) => state.loginReducer.webPinFlag);

    const goBack = () => {
        if (webPinFlag) {
            Alert.alert(process.env.EXPO_PUBLIC_NAME, `PIN 변경을 취소하시겠습니까?`, [
                {
                    text: '아니요',
                    onPress: () => null,
                    style: 'cancel',
                },
                {
                    text: '예',
                    onPress: () => {
                        store.dispatch(dispatchMultiple({ SET_WEBPIN: false, SET_TAB: 'web' }));
                    },
                },
            ]);
        }
    };

    return (
        webPinFlag && (
            <View style={styles.container}>
                <Pressable style={styles.headerItem} onPress={goBack}>
                    <BackIcon />
                    <FontText style={styles.headerText}>뒤로가기</FontText>
                </Pressable>
            </View>
        )
    );
};

const styles = StyleSheet.create({
    container: {
        top: Constants.statusBarHeight,
        position: `absolute`,
        width: `100%`,
        zIndex: 1,
        height: 60,
        paddingHorizontal: 15,
        justifyContent: `center`,
        borderBottomColor: `#ffffff`,
        borderBottomWidth: 2,
    },
    headerItem: {
        gap: 10,
        flexDirection: `row`,
    },
    headerText: {
        fontSize: 18,
        textAlignVertical: `center`,
    },
});

export default BackHeader;
