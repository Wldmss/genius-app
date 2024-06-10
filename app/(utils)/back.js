import { Pressable, StyleSheet, View } from 'react-native';
import { FontText } from 'utils/TextUtils';

import BackIcon from 'assets/icons/icon-back.svg';
import { useSelector } from 'react-redux';

import Constants from 'expo-constants';
import { webLoginChangeAlert } from 'utils/AlertUtils';

/** 뒤로 가기 헤더 */
const BackHeader = () => {
    const tab = useSelector((state) => state.loginReducer.tab);
    const webPinFlag = useSelector((state) => state.loginReducer.webPinFlag);
    const webBioFlag = useSelector((state) => state.loginReducer.webBioFlag);

    const goBack = () => {
        webLoginChangeAlert(webPinFlag);
    };

    return (
        ((tab == 'pin' && webPinFlag) || (tab == 'bio' && webBioFlag)) && (
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
        // backgroundColor: `#ffffff`,
        // borderBottomColor: `#ffffff`,
        // borderBottomWidth: 2,
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
