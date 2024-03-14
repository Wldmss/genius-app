const { EXPO_PUBLIC_PROFILE, EXPO_PUBLIC_VERSION } = process.env;

module.exports = ({ config }) => {
    return {
        ...config,
        name: `GENIUS${EXPO_PUBLIC_PROFILE == 'preview' ? ' (local)' : EXPO_PUBLIC_PROFILE == 'development' ? ' (test)' : ''}`,
        version: EXPO_PUBLIC_VERSION || '1.0.0',
    };
};
