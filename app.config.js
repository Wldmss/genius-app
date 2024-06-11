module.exports = ({ config }) => {
    const profile = (process.env.EAS_BUILD_PROFILE || process.env.EXPO_PUBLIC_PROFILE || 'production').trim();

    const appType = () => {
        switch (profile) {
            case 'development':
                return ' (개발)';
            case 'test':
                return ' (지은)';
            case 'staging':
                return ' (테스트)';
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
            profile: profile,
            isTest: profile != 'production',
            androidVersion: config.android.versionCode,
            iosVersion: config.ios.buildNumber,
        },
    };
};
