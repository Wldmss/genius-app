import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

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
