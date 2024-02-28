import React, { useEffect, useState } from 'react';
import { commonInputStyles } from 'assets/styles';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import store from 'store/store';
import { dispatchOne } from 'utils/DispatchUtils';
import { useSelector } from 'react-redux';
import * as NavigateUtils from 'utils/NavigateUtils';

/** 다른 방법으로 로그인 (공통) */
const OtherLogin = () => {
    const pin = useSelector((state) => state.loginReducer.pin);
    const bio = useSelector((state) => state.loginReducer.bio);
    const tab = useSelector((state) => state.loginReducer.tab);
    const users = useSelector((state) => state.loginReducer.users);

    const [open, setOpen] = useState(false);
    const [type, setType] = useState({ pin: false, ldap: false, bio: false, bioRegister: false, changePin: false });

    const otherLogin = (id, modFlag) => {
        if (modFlag) {
            let data = id == 'pin' ? pin : bio;
            store.dispatch(dispatchOne(`SET_${id.toUpperCase()}`, { ...data, modFlag: true }));
        }

        store.dispatch(NavigateUtils.routeDispatch(id));
    };

    const handleOpen = () => {
        setOpen(!open);
    };

    useEffect(() => {
        setType({
            ...type,
            pin: tab != 'pin' && users,
            ldap: tab != 'ldap' && pin?.isRegistered, //&& !pin?.modFlag && !bio?.modFlag
            bio: tab != 'bio' && users && bio?.isRegistered && pin?.isRegistered,
            bioRegister: tab != 'bio' && users && !bio?.isRegistered && pin?.isRegistered,
            changePin: tab == 'pin' && users && !pin?.modFlag,
        });

        setOpen(false);
    }, []);

    return (
        <View style={styles.container}>
            {(type.pin || type.ldap || type.bio || type.bioRegister || type.changePin) && (
                <Text style={styles.otherText} onPress={handleOpen}>{`다른 방법으로 로그인 ${open ? '∧' : '∨'}`}</Text>
            )}
            <View style={[styles.otherLoginBox, !open ? styles.none : '']}>
                {type.pin && (
                    <Pressable style={commonInputStyles.button} onPress={() => otherLogin('pin')}>
                        <Text>PIN</Text>
                    </Pressable>
                )}
                {type.ldap && (
                    <Pressable style={commonInputStyles.button} onPress={() => otherLogin('ldap')}>
                        <Text>아이디/비밀번호</Text>
                    </Pressable>
                )}
                {type.bio && (
                    <Pressable style={commonInputStyles.button} onPress={() => otherLogin('bio')}>
                        <Text>생체 인증</Text>
                    </Pressable>
                )}
                {type.bioRegister && (
                    <Pressable style={commonInputStyles.button} onPress={() => otherLogin('bio', true)}>
                        <Text>생체 인증 등록</Text>
                    </Pressable>
                )}
                {type.changePin && (
                    <Pressable style={commonInputStyles.button} onPress={() => otherLogin('pin', true)}>
                        <Text>PIN 변경</Text>
                    </Pressable>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 5,
    },
    otherLoginBox: {
        gap: 5,
    },
    otherText: {
        color: `#454545`,
        width: 250,
    },
    none: {
        display: `none`,
    },
});

export default OtherLogin;
