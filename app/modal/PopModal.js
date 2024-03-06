import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import store from '../store/store';
import { commonInputStyles, commonStyles } from 'assets/styles';

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
                            <Text>{title}</Text>
                            <Pressable style={[commonInputStyles.cancel, hideClose ? commonStyles.hidden : '']} onPress={setModalClose}>
                                <Text style={styles.cancelText}>X</Text>
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
        width: 285,
    },
    headContent: {
        display: `flex`,
        justifyContent: `space-between`,
        flexDirection: `row`,
    },
    cancelText: {
        fontSize: 18,
        alignItems: `center`,
        justifyContent: `center`,
    },
});

export default PopModal;
