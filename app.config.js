module.exports = ({ config }) => {
    return {
        ...config,
        name: `${process.env.EXPO_PUBLIC_NAME}${process.env.EXPO_PUBLIC_PROFILE == 'preview' ? ' (local)' : process.env.EXPO_PUBLIC_PROFILE == 'development' ? ' (test)' : ''}`,
        version: process.env.EXPO_PUBLIC_VERSION || '1.0.0',
    };
};
