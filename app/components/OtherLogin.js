import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import store from 'store/store';
import { dispatchOne } from 'utils/DispatchUtils';
import { useSelector } from 'react-redux';
import { FontTextG } from 'utils/TextUtils';

import BioIcon from 'assets/icons/icon-bio.svg';
import PinIcon from 'assets/icons/icon-pin.svg';
import IdIcon from 'assets/icons/icon-id.svg';

/** 다른 방법으로 로그인 (공통) */
const OtherLogin = () => {
    const pin = useSelector((state) => state.loginReducer.pin);
    const bio = useSelector((state) => state.loginReducer.bio);
    const bioSupported = useSelector((state) => state.loginReducer.bioSupported);
    const bioRecords = useSelector((state) => state.loginReducer.bioRecords);
    const tab = useSelector((state) => state.loginReducer.tab);
    const loginKey = useSelector((state) => state.loginReducer.loginKey);
    const webPinFlag = useSelector((state) => state.loginReducer.webPinFlag);

    const [type, setType] = useState({ pin: false, ldap: false, bio: false, bioRegister: false, changePin: false });

    const otherLogin = (id, modFlag) => {
        if (id != 'ldap') {
            let data = id == 'pin' ? pin : bio;
            store.dispatch(dispatchOne(`SET_${id.toUpperCase()}`, { ...data, modFlag: modFlag }));
        }

        store.dispatch(dispatchOne('SET_TAB', id));
    };

    useEffect(() => {
        setType({
            ...type,
            pin: (tab != 'pin' && loginKey) || (tab == 'pin' && pin?.isRegistered && pin?.modFlag),
            ldap: false, // tab != 'ldap' && pin?.isRegistered, // 다른 사번으로 로그인 차단 요청
            bio: bioSupported && bioRecords && tab != 'bio' && loginKey && bio?.isRegistered && pin?.isRegistered,
            bioRegister: bioSupported && bioRecords && tab != 'bio' && loginKey && !bio?.isRegistered && pin?.isRegistered,
            changePin: false, // tab == 'pin' && loginKey && !pin?.modFlag,  // 웹에서만 PIN 변경
        });
    }, [tab, pin, bio]);

    return (
        (type.pin || type.ldap || type.bio || type.bioRegister || type.changePin) &&
        !webPinFlag && (
            // <View style={styles.container}>
            <View style={styles.otherContainer}>
                <FontTextG style={styles.otherTitle}>다른 방법으로 로그인</FontTextG>
                <View style={styles.otherLoginBox}>
                    {type.pin && (
                        <Pressable style={styles.otherBox} onPress={() => otherLogin('pin')}>
                            <View style={styles.iconBox}>
                                <PinIcon />
                            </View>
                            <FontTextG style={styles.otherText}>PIN</FontTextG>
                        </Pressable>
                    )}
                    {type.ldap && (
                        <Pressable style={styles.otherBox} onPress={() => otherLogin('ldap')}>
                            <View style={styles.iconBox}>
                                <IdIcon />
                            </View>
                            <FontTextG style={styles.otherText}>아이디/비밀번호</FontTextG>
                        </Pressable>
                    )}
                    {type.bio && (
                        <Pressable style={styles.otherBox} onPress={() => otherLogin('bio')}>
                            <View style={styles.iconBox}>
                                <BioIcon />
                            </View>
                            <FontTextG style={styles.otherText}>생체 인증</FontTextG>
                        </Pressable>
                    )}
                    {type.bioRegister && (
                        <Pressable style={styles.otherBox} onPress={() => otherLogin('bio', true)}>
                            <View style={styles.iconBox}>
                                <BioIcon />
                            </View>
                            <FontTextG style={styles.otherText}>생체 인증 등록</FontTextG>
                        </Pressable>
                    )}
                    {type.changePin && (
                        <Pressable style={styles.otherBox} onPress={() => otherLogin('pin', true)}>
                            <View style={styles.iconBox}>
                                <PinIcon />
                            </View>
                            <FontTextG style={styles.otherText}>PIN 변경</FontTextG>
                        </Pressable>
                    )}
                </View>
            </View>
        )
    );
};

const styles = StyleSheet.create({
    container: {},
    otherContainer: {
        gap: 10,
        marginTop: 10,
        alignItems: `center`,
    },
    otherLoginBox: {
        gap: 10,
        flexDirection: `row`,
    },
    otherTitle: {
        fontSize: 12,
    },
    otherText: {
        fontSize: 11,
    },
    none: {
        display: `none`,
    },
    otherBox: {
        alignItems: `center`,
        width: 83,
        gap: 5,
    },
    iconBox: {
        borderWidth: 1,
        borderColor: `#E6E7E8`,
        borderRadius: 50,
        backgroundColor: `#FFFFFF`,
        justifyContent: `center`,
        alignItems: `center`,
        width: 48,
        height: 48,
    },
});

export default OtherLogin;
