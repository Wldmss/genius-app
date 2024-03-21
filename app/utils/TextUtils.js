/** 폰트 적용 */
import { StyleSheet, Text, TextInput } from 'react-native';

export const FontText = ({ children, style, ...props }) => {
    return (
        <Text style={StyleSheet.compose(styles.fonts, style)} {...props}>
            {children}
        </Text>
    );
};

export const FontTextG = ({ children, style, ...props }) => {
    return (
        <Text style={StyleSheet.compose([styles.fonts, styles.gray], style)} {...props}>
            {children}
        </Text>
    );
};

export const FontTextInput = ({ style, ...props }) => {
    return <TextInput style={StyleSheet.compose(styles.fonts, style)} {...props} />;
};

const styles = StyleSheet.create({
    fonts: {
        fontFamily: 'NotoSans',
        lineHeight: 23,
    },
    gray: {
        color: `#4C4C4E`,
    },
});
