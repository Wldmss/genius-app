import { commonStyles } from 'assets/styles';
import { StyleSheet, View } from 'react-native';

import Genius from 'assets/images/genius-logo.svg';
import LottieView from 'lottie-react-native';
import { useEffect, useRef } from 'react';

/** genius logo image */
export const GeniusLogo = ({ style }) => {
    return (
        <View style={[commonStyles.geniusLogo, style]}>
            <Genius />
        </View>
    );
};

/** lottie animation */
export const GeniusLottie = () => {
    const animation = useRef(null);

    useEffect(() => {
        animation.current?.reset();
        animation.current?.play();
    }, []);

    return <LottieView loop={false} ref={animation} style={styles.lottie} source={require('assets/images/lottie.json')} />;
};

const styles = StyleSheet.create({
    lottie: {
        flex: 1,
        width: 350,
    },
});
