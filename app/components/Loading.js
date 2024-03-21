import { Modal, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { GeniusLogo } from 'utils/ImageUtils';

/** 로딩 화면 */
const Loading = () => {
    const loading = useSelector((state) => state.commonReducer.loading);

    return (
        <Modal visible={loading} transparent={true} animationType="fade">
            <View style={styles.modalContainer}>
                <GeniusLogo />
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
        backgroundColor: 'rgba(0, 0, 0, 0.1)', // 배경에 투명도를 줍니다.
    },
});

export default Loading;
