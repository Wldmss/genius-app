import { Modal, StyleSheet, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useSelector } from 'react-redux';

/** 로딩 화면 */
const Loading = ({ show }) => {
    const loading = show ? show : useSelector((state) => state.commonReducer.loading);

    return loading ? (
        <Modal visible={loading} transparent={true} animationType="fade">
            <View style={styles.modalContainer}>
                <ActivityIndicator size="large" color={process.env.EXPO_PUBLIC_PUSH_COLOR} />
            </View>
        </Modal>
    ) : (
        <View></View>
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
        // backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
});

export default Loading;
