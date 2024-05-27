import { StyleSheet } from 'react-native';

export const commonStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    hidden: {
        opacity: 0,
    },
    geniusLogo: {
        width: 200,
        height: 200,
    },
});

const inputWidth = 260;

export const commonInputStyles = StyleSheet.create({
    inputText: {
        borderWidth: 0,
        paddingHorizontal: 15,
        paddingVertical: 5,
        height: 36,
        lineHeight: 22,
        width: inputWidth,
        margin: `auto`,
        borderRadius: 4,
        backgroundColor: `#E8F0FE`,
        fontSize: 13,
    },
    inputNumber: {
        borderWidth: 0,
        paddingHorizontal: 15,
        paddingVertical: 0,
        height: 36,
        lineHeight: 22,
        width: inputWidth,
        margin: `auto`,
        borderRadius: 4,
        backgroundColor: `#E8F0FE`,
        fontSize: 13,
        textAlign: `center`,
        textAlignVertical: `center`,
    },
    buttonRed: {
        alignItems: `center`,
        justifyContent: `center`,
        borderWidth: 0,
        paddingHorizontal: 15,
        paddingVertical: 5,
        height: 40,
        lineHeight: 38,
        width: inputWidth,
        margin: `auto`,
        borderRadius: 6,
        backgroundColor: `#FE2E36`,
    },
    buttonGray: {
        alignItems: `center`,
        justifyContent: `center`,
        borderWidth: 0,
        paddingHorizontal: 15,
        paddingVertical: 5,
        height: 40,
        lineHeight: 38,
        width: inputWidth,
        margin: `auto`,
        borderRadius: 6,
        backgroundColor: `#5A5A5A`,
    },
    buttonWhite: {
        alignItems: `center`,
        justifyContent: `center`,
        borderWidth: 1,
        borderColor: `#ddd`,
        paddingHorizontal: 15,
        paddingVertical: 5,
        height: 40,
        lineHeight: 38,
        width: inputWidth,
        margin: `auto`,
        borderRadius: 6,
    },
    button: {
        alignItems: `center`,
        justifyContent: `center`,
        borderWidth: 1,
        borderColor: `#ddd`,
        paddingHorizontal: 12,
        paddingVertical: 5,
        height: 35,
        lineHeight: 30,
        width: inputWidth,
        margin: `auto`,
        borderRadius: 6,
    },
    cancel: {
        width: 17,
        height: 17,
    },
});

export const commonTextStyles = StyleSheet.create({
    fonts: {
        fontFamily: 'NotoSans',
        lineHeight: 23,
    },
    white: {
        color: `#fff`,
        fontSize: 15,
    },
    warning: {
        color: `#FF4F55`,
    },
    success: {
        color: `#00A896`,
    },
    center: {
        textAlign: `center`,
    },
    bold: {
        fontWeight: `600`,
    },
    gray: {
        color: `#666666`,
    },
});
