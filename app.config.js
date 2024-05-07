module.exports = ({ config }) => {
    const appType = () => {
        switch (process.env.EAS_BUILD_PROFILE) {
            case 'preview':
                return ' (local)';
            case 'development':
                return ' (개발)';
            case 'staging':
                return ' (테스트)';
            case 'staging-android':
                return ' (테스트)';
            case 'staging-ios':
                return ' (테스트)';
            default:
                return '';
        }
    };

    const channel = () => {
        switch (process.env.EAS_BUILD_PROFILE) {
            case 'staging-android':
                return 'staging';
            case 'staging-ios':
                return 'staging';
            case 'production-android':
                return 'production';
            case 'production-ios':
                return 'production';
            default:
                return process.env.EAS_BUILD_PROFILE;
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
        updates: {
            ...config.updates,
            releaseChannel: channel(),
        },
    };
};
