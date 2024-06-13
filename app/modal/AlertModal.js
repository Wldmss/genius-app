import { Modal, StyleSheet, Text, View } from 'react-native';

/** alert 창 */
const AlertModal = () => {
    return (
        <Modal visible={true} transparent={true} animationType="fade">
            <View style={styles.modalContainer}>
                <View style={styles.alertBox}>
                    <Text style={styles.title}>타이틀</Text>
                    <Text style={styles.content}>알림</Text>
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
    title: {
        fontSize: 15,
    },
    content: {},
});

export default AlertModal;
