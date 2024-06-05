import { useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { dispatchMultiple, dispatchOne } from 'utils/DispatchUtils';

import { Alert } from 'react-native';

/** 링크 접속 */
export default function Link() {
    console.log('------------------link--------------------');
    const params = useLocalSearchParams();

    // 링크 관리
    useEffect(() => {
        console.log(params);
        const link = params.link;

        /** TODO 이곳으로 들어오는 링크는 웹 페이지 링크로 QR을 생성하고, 해당 웹 페이지에서 모바일 링크로 window.location.href="ktgenius://genius" 넘겨줘야 한다.
         * android :: ktgenius://genius?파라미터
         * ios :: com.kt.ktgetnius://genius?*/

        // store.dispatch(dispatchOne('SET_PARAMS', params));
        // store.dispatch(dispatchOne('SET_LINK', true));

        if (link) {
            store.dispatch(
                dispatchMultiple({
                    SET_PARAMS: params,
                    SET_LINK: true,
                    SET_TAB: 'main',
                })
            );
        }

        // if (link == 'checkIn') {
        //     store.dispatch(dispatchOne('SET_PARAMS', params));
        // }

        // if (link == 'push') {
        //     store.dispatch(dispatchOne('SET_PARAMS', params));
        //     // console.log(`push!!!\n${params.url}`);
        //     // // Alert.alert(`push!!!\n${url}`);
        //     // store.dispatch(dispatchOne('SET_WEBLINK', params.url || '/main/portalMain.do'));
        // }
    }, [params]);
}
