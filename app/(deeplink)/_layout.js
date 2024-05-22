import { Slot } from 'expo-router';
import { ImageBackground, StyleSheet, View } from 'react-native';

const genius_background = require('assets/images/login-bg.png');

const Layout = () => {
    return (
        <View style={styles.container} id="content">
            <ImageBackground source={genius_background} style={styles.background}>
                <Slot />
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
        justifyContent: `center`,
        alignItems: `center`,
    },
});

export default Layout;
