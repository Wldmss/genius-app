import { StyleSheet } from 'react-native';

export const commonStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    hidden: {
        opacity: 0,
    },
});

export const commonInputStyles = StyleSheet.create({
    inputText: {
        borderWidth: 0,
        paddingHorizontal: 15,
        paddingVertical: 5,
        height: 36,
        lineHeight: 22,
        width: 250,
        margin: `auto`,
        borderRadius: 4,
        backgroundColor: `#E8F0FE`,
        fontSize: 12,
    },
    inputNumber: {
        borderWidth: 0,
        paddingHorizontal: 15,
        paddingVertical: 5,
        height: 36,
        lineHeight: 22,
        width: 250,
        margin: `auto`,
        borderRadius: 4,
        backgroundColor: `#E8F0FE`,
        fontSize: 12,
        textAlign: `center`,
        letterSpacing: 10,
    },
    buttonRed: {
        alignItems: `center`,
        justifyContent: `center`,
        borderWidth: 0,
        paddingHorizontal: 15,
        paddingVertical: 5,
        height: 40,
        lineHeight: 38,
        width: 250,
        margin: `auto`,
        borderRadius: 6,
        backgroundColor: `#FE2E36`,
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
        width: 250,
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
        width: 250,
        margin: `auto`,
        borderRadius: 6,
    },
    cancel: {
        width: 20,
        height: 20,
    },
});

export const commonTextStyles = StyleSheet.create({
    white: {
        color: `#fff`,
        fontSize: 15,
    },
    warning: {
        color: `#bb2124`,
    },
    success: {
        color: `#22bb33`,
    },
    center: {
        textAlign: `center`,
    },
});
