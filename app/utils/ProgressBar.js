import { StyleSheet, Text, View } from 'react-native';

const ProgressBar = ({ percent }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.progressBarText}>업데이트 중...</Text>
            <View style={styles.progressBar}>
                <View style={styles.progressBarFill} width={percent * 100 + '%'} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: `absolute`,
        width: 250,
        bottom: 50,
    },
    progressBar: {
        height: 5,
        backgroundColor: '#ddd',
        borderRadius: 5,
    },
    progressBarFill: {
        backgroundColor: '#007bff',
        borderRadius: 5,
    },
    progressBarText: {
        textAlign: 'center',
        paddingVertical: 5,
    },
});

export default ProgressBar;
