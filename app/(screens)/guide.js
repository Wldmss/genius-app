import { useEffect, useState } from 'react';
import { ImageBackground, Pressable, StyleSheet, View } from 'react-native';
import { commonInputStyles, commonTextStyles } from 'assets/styles';
import PagerView from 'react-native-pager-view';
import * as StorageUtils from 'utils/StorageUtils';
import { dispatchOne } from 'utils/DispatchUtils';
import { FontText } from 'utils/TextUtils';

const guide_1 = require('assets/images/guide-1.png');
const guide_2 = require('assets/images/guide-2.png');
const guide_3 = require('assets/images/guide-3.png');
const guide_4 = require('assets/images/guide-4.png');

const Guide = () => {
    const guideArr = [
        {
            source: guide_1,
            key: '0',
        },
        {
            source: guide_2,
            key: '1',
        },
        {
            source: guide_3,
            key: '2',
        },
        {
            source: guide_4,
            key: '3',
        },
    ];

    const [currentPage, setCurrentPage] = useState(0);

    const onPageSelected = ({ nativeEvent }) => {
        const { position } = nativeEvent;
        setCurrentPage(position);
    };

    const handleSkip = async () => {
        await StorageUtils.setDeviceData('hasVisit', 'true');
        store.dispatch(dispatchOne('SET_TAB', 'main'));
    };

    useEffect(() => {
        setCurrentPage(0);
    }, []);

    return (
        <View style={styles.container}>
            <PagerView style={styles.container} initialPage={0} onPageSelected={onPageSelected}>
                {guideArr.map((guide) => (
                    <ImageBackground source={guide.source} style={styles.page} key={guide.key}>
                        <View style={styles.bottomBox}>
                            <View style={styles.pageBox}>
                                {guideArr.map((icon) => (
                                    <View key={`page${icon.key}`} style={[styles.icon, icon.key == currentPage ? styles.selected : '']}></View>
                                ))}
                            </View>
                            <Pressable style={commonInputStyles.buttonGray} onPress={handleSkip}>
                                <FontText style={commonTextStyles.white}>건너뛰기</FontText>
                            </Pressable>
                        </View>
                    </ImageBackground>
                ))}
            </PagerView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    page: {
        flex: 1,
        justifyContent: `flex-end`,
        alignItems: `center`,
    },
    bottomBox: {
        justifyContent: `center`,
        alignItems: `center`,
        marginBottom: 40,
        gap: 10,
    },
    pageBox: {
        flexDirection: `row`,
        gap: 5,
    },
    icon: {
        borderRadius: 50,
        width: 10,
        height: 10,
        backgroundColor: `#ffffff`,
    },
    selected: {
        backgroundColor: `red`,
    },
});

export default Guide;
