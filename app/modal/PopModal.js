import React from 'react';
import { Image, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import store from '../store/store';
import { commonInputStyles, commonStyles } from 'assets/styles';
import { FontText } from 'utils/TextUtils';

const close_btn = require('assets/images/close.png');

/** 팝업 모달 (공통) */
const PopModal = () => {
    const open = useSelector((state) => state.modalReducer.open);
    const element = useSelector((state) => state.modalReducer.element);
    const title = useSelector((state) => state.modalReducer.title);
    const hideClose = useSelector((state) => state.modalReducer.hideClose);

    const setModalClose = () => {
        store.dispatch({ type: 'CLOSE_MODAL' });
    };

    return (
        open && (
            <Modal visible={open} onRequestClose={setModalClose} transparent={true} animationType="fade">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.headContent}>
                            <FontText style={styles.title}>{title}</FontText>
                            <Pressable style={[hideClose ? commonStyles.hidden : '']} onPress={setModalClose}>
                                <Image source={close_btn} style={commonInputStyles.cancel} resizeMode="contain" />
                            </Pressable>
                        </View>
                        {element}
                    </View>
                </View>
            </Modal>
        )
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // 배경에 투명도를 줍니다.
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        elevation: 5, // 안드로이드에서 그림자를 만듭니다.
        gap: 10,
        width: 320,
    },
    headContent: {
        display: `flex`,
        justifyContent: `space-between`,
        flexDirection: `row`,
    },
    title: {
        fontSize: 15,
    },
});

export default PopModal;
