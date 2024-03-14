import { StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import * as Clipboard from 'expo-clipboard';

export default function Test() {
    const test = useSelector((state) => state.commonReducer.test);

    const copy = async () => {
        await Clipboard.setStringAsync(test);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text} onPress={copy}>
                {test}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: `center`,
        alignItems: `center`,
    },
    text: {
        flex: 1,
    },
});
