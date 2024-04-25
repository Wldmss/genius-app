module.exports = ({ config }) => {
    const appType = () => {
        switch (process.env.EAS_BUILD_PROFILE) {
            case 'preview':
                return ' (local)';
            case 'development':
                return ' (dev)';
            case 'staging':
                return ' (test)';
            default:
                return '';
        }
    };

    return {
        ...config,
        name: `${process.env.EXPO_PUBLIC_NAME}${appType()}`,
        android: {
            ...config.android,
            googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
        },
        ios: {
            ...config.ios,
            googleServicesFile: process.env.GOOGLE_SERVICES_IOS,
        },
        extra: {
            ...config.extra,
            profile: process.env.EAS_BUILD_PROFILE || process.env.EXPO_PUBLIC_PROFILE,
        },
    };
};
