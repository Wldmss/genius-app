import { Image, Modal, StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';

const load_img = require('assets/genius_logo.png');

// 로딩 화면
const Loading = () => {
    const loading = useSelector((state) => state.commonReducer.loading);

    return (
        <Modal visible={loading} transparent={true} animationType="fade">
            <View style={styles.modalContainer}>
                <Image source={load_img} resizeMode="contain" />
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
