import Constants from 'expo-constants';

const CommonEnv = {
    VERSION: '1.0.0',
    SERVER_URL: 'http://localhost:8081',
    API_URL: '/api/v1',
    PROJECT_ID: 'bd698549-609f-476e-9339-4d0566f95b31',
    FCM_API_KEY: 'AIzaSyDL2sx9hEtcpxPZifI4ep1Yz-YUyRXDTz4',
    FCM_PROJECT_ID: 'genius-mobile-35601',
    FCM_SENDER_ID: '785867783883',
    FCM_APP_ID: '1:785867783883:android:8b149f122a8eabff0be54e',
};

const ENV = {
    local: {
        PROFILE: 'local',
    },
    development: {
        PROFILE: 'development',
    },
    production: {
        PROFILE: 'production',
    },
};

const getEnvVars = (env = Constants) => {
    if (__DEV__) {
        return Object.assign(CommonEnv, ENV.local);
    } else {
        return Object.assign(CommonEnv, ENV[env]);
    }
};

export default getEnvVars;
