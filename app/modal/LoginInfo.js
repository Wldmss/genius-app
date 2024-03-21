import React from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { commonInputStyles, commonTextStyles } from 'assets/styles';
import store from '../store/store';
import { FontText } from 'utils/TextUtils';

/** LDAP 문의 및 연락처 팝업 */
const LoginInfo = () => {
    const setModalClose = () => {
        store.dispatch({ type: 'CLOSE_MODAL' });
    };

    const linking = (number) => {
        Linking.openURL(`tel:${number}`);
    };

    return (
        <View style={styles.container}>
            <View style={styles.textContainer}>
                <FontText style={styles.boldText}>{`로그인 문의`}</FontText>
                <FontText style={styles.text}>{`- 아이디를 모르는 경우, 조직의 인사담당자에게 문의 하시기 바랍니다.`}</FontText>
                <FontText style={styles.text}>{`- 비밀번호를 분실한 경우, idms.kt.com 에서 비밀번호 변경 또는 초기화 하시기 바랍니다.`}</FontText>
                <FontText style={styles.text}>
                    {`* 사외망 등의 사유로 idms.kt.com 접속이 불가할 경우 조직의 인사담당자 또는 아래 연락처로 문의 하시기 바랍니다.`}
                </FontText>

                <View style={[styles.numberInfo, styles.marginText]}>
                    <FontText style={styles.text}>{`※ `}</FontText>
                    <FontText style={[styles.text, styles.underline]} onPress={() => linking(`1588-3391`)}>{`1588-3391`}</FontText>
                    <FontText style={styles.text}>{` -> 1번(KOS무선)`}</FontText>
                </View>
            </View>
            <View style={styles.Line}></View>
            <View style={styles.textContainer}>
                <View style={styles.numberInfo}>
                    <FontText style={styles.text}>{`시스템 문의 : `}</FontText>
                    <FontText style={[styles.text, styles.underline]} onPress={() => linking(`1588-3391`)}>{`1588-3391`}</FontText>
                    <FontText style={styles.text}>{` (1 > 1)`}</FontText>
                </View>
                <View style={styles.numberInfo}>
                    <FontText style={styles.text}>{`이러닝 문의 : `}</FontText>
                    <FontText style={[styles.text, styles.underline]} onPress={() => linking(`1577-0263`)}>{`1577-0263`}</FontText>
                </View>
                <FontText style={styles.text}>{`KT AIVLE스쿨 문의처 : 담당 에이블 매니저`}</FontText>
            </View>
            <Pressable style={commonInputStyles.buttonRed} onPress={setModalClose}>
                <FontText style={commonTextStyles.white}>확인</FontText>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 15,
    },
    boldText: {
        fontSize: 12,
        fontWeight: `bold`,
        color: `#666`,
    },
    numberInfo: {
        flexDirection: `row`,
    },
    text: {
        fontSize: 11,
        color: `#666`,
    },
    underline: {
        textDecorationLine: `underline`,
    },
    marginText: {
        marginTop: 20,
    },
    textContainer: {
        gap: 5,
    },
    Line: {
        borderWidth: 0.5,
        borderColor: `#666`,
        width: `100%`,
    },
});

export default LoginInfo;
