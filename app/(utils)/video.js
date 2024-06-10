import { VideoView, useVideoPlayer } from 'expo-video';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

const Video = ({ src }) => {
    const ref = useRef(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const player = useVideoPlayer(src, (player) => {
        player.loop = true;
        player.play();
    });

    useEffect(() => {
        player.play();
        setIsPlaying(true);
    }, [src]);

    useEffect(() => {
        const subscription = player.addListener('playingChange', (isPlaying) => {
            setIsPlaying(isPlaying);
        });

        return () => {
            subscription.remove();
        };
    }, [player]);

    return (
        <View style={styles.contentContainer}>
            <VideoView ref={ref} style={styles.video} player={player} allowsFullscreen allowsPictureInPicture />
        </View>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        // padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        // paddingHorizontal: 50,
    },
    video: {
        width: 350,
        height: 275,
    },
    controlsContainer: {
        padding: 10,
    },
});

export default Video;
