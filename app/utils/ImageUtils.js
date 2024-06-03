import { commonStyles } from 'assets/styles';
import { View } from 'react-native';

import Genius from 'assets/images/genius-logo.svg';

/** genius logo image */
export const GeniusLogo = ({ style }) => {
    return (
        <View style={[commonStyles.geniusLogo, style]}>
            <Genius />
        </View>
    );
};
