import { Modal, StyleSheet, Text, View } from 'react-native';
import { dispatchOne } from 'utils/DispatchUtils';

/** alert 창 */
const AlertModal = () => {
    const alertData = useSelector((state) => state.modalReducer.alert);

    const close = () => {
        store.dispatch(dispatchOne('SET_ALERT', null));
    };

    return (
        <Modal visible={alertData != null} transparent={true} animationType="fade">
            <View style={styles.modalContainer}>
                <View style={styles.alertBox}>
                    <Text style={styles.title}>{alertData ? alertData.title || process.env.EXPO_PUBLIC_NAME : ''}</Text>
                    <Text style={styles.content}>{alertData ? alertData.message : ''}</Text>
                </View>
                <View style={styles.buttonBox}></View>
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
