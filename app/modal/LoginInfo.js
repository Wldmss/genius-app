import React from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { commonInputStyles, commonTextStyles } from 'assets/styles';
import store from '../store/store';
import { FontDefault } from 'utils/TextUtils';

/** LDAP 문의 및 연락처 팝업 */
const LoginInfo = () => {
    const setModalClose = () => {
        store.dispatch({ type: 'CLOSE_MODAL' });
    };

    const linking = (number) => {
        Linking.openURL(`tel:${number}`);
    };

    const wordBreak = (text) => {
        return text.replace(/ /g, '\u00A0');
    };

    return (
        <View style={styles.container}>
            <View style={styles.textContainer}>
                <FontDefault style={styles.boldText}>{`로그인 문의`}</FontDefault>
                <FontDefault style={styles.text}>{wordBreak(`- 아이디를 모르는 경우, 조직의 인사담당자에게 문의 하시기 바랍니다.`)}</FontDefault>
                <FontDefault style={styles.text}>
                    {wordBreak(`- 비밀번호를 분실한 경우, idms.kt.com 에서 비밀번호 변경 또는 초기화 하시기 바랍니다.`)}
                </FontDefault>
                <FontDefault style={styles.text}>
                    {wordBreak(`* 사외망 등의 사유로 idms.kt.com 접속이 불가할 경우 조직의 인사담당자 또는 아래 연락처로 문의 하시기 바랍니다.`)}
                </FontDefault>

                <View style={[styles.numberInfo, styles.marginText]}>
                    <FontDefault style={styles.text}>{`※ `}</FontDefault>
                    <FontDefault style={[styles.text, styles.underline]} onPress={() => linking(`1588-3391`)}>{`1588-3391`}</FontDefault>
                    <FontDefault style={styles.text}>{` -> 1번(KOS무선)`}</FontDefault>
                </View>
            </View>
            <View style={styles.Line}></View>
            <View style={styles.textContainer}>
                <View style={styles.numberInfo}>
                    <FontDefault style={styles.text}>{`시스템 문의 : `}</FontDefault>
                    <FontDefault style={[styles.text, styles.underline]} onPress={() => linking(`1588-3391`)}>{`1588-3391`}</FontDefault>
                    <FontDefault style={styles.text}>{` (1 > 1)`}</FontDefault>
                </View>
                <View style={styles.numberInfo}>
                    <FontDefault style={styles.text}>{`이러닝 문의 : `}</FontDefault>
                    <FontDefault style={[styles.text, styles.underline]} onPress={() => linking(`1577-0263`)}>{`1577-0263`}</FontDefault>
                </View>
                <FontDefault style={styles.text}>{`KT AIVLE스쿨 문의처 : 담당 에이블 매니저`}</FontDefault>
            </View>
            <Pressable style={[commonInputStyles.buttonRed, styles.button]} onPress={setModalClose}>
                <FontDefault style={commonTextStyles.white}>확인</FontDefault>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 7,
    },
    boldText: {
        fontSize: 12,
        fontWeight: 600,
        color: `#666`,
    },
    numberInfo: {
        flexDirection: `row`,
    },
    text: {
        fontSize: 11,
        color: `#666`,
        lineHeight: 18,
    },
    underline: {
        textDecorationLine: `underline`,
    },
    marginText: {
        marginTop: 20,
    },
    textContainer: {
        // gap: 5,
    },
    Line: {
        borderWidth: 0.5,
        borderColor: `#666`,
        width: `100%`,
    },
    button: {
        width: `100%`,
        marginTop: 10,
    },
});

export default LoginInfo;
