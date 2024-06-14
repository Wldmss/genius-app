import { useEffect } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { okAlert } from 'utils/AlertUtils';
import { dispatchOne } from 'utils/DispatchUtils';

/** alert 창 (사용x 만들다 맘) */
const AlertModal = () => {
    const alertData = useSelector((state) => state.modalReducer.alert);

    const close = () => {
        store.dispatch(dispatchOne('SET_ALERT', null));
    };

    useEffect(() => {
        store.dispatch(
            dispatchOne('SET_ALERT', {
                title: null,
                message: '인증번호가 전송되었습니다.\n인증번호를 3분 이내에 입력해주세요.그렇지 않으면 너는 로그인을 할 수가 없단다',
            })
        );
    }, []);

    return (
        <Modal visible={alertData != null} transparent={true} animationType="fade">
            <View style={styles.modalContainer}>
                <View style={styles.alertBox}>
                    <View style={styles.contentBox}>
                        <Text style={styles.title}>{alertData ? alertData.title || process.env.EXPO_PUBLIC_NAME : ''}</Text>
                        <Text style={styles.content}>{alertData ? alertData.message : ''}</Text>
                    </View>
                    <View style={styles.buttonBox}>
                        <Pressable onPress={close}>
                            <Text>확인</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertBox: {
        backgroundColor: `#ffffff`,
        borderWidth: 1,
        width: 270,
        padding: 20,
        flexDirection: `column`,
        gap: 10,
    },
    contentBox: {
        gap: 10,
    },
    title: {
        fontSize: 15,
    },
    content: {},
    buttonBox: {
        justifyContent: `flex-end`,
        gap: 10,
    },
});

export default AlertModal;
