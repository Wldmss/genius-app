import { useEffect } from 'react';
import store from 'store/store';
import { useLocalSearchParams } from 'expo-router';
import { dispatchOne } from 'utils/DispatchUtils';
import { Alert } from 'react-native';

/** 링크 접속 */
export default function Link() {
    const { link, query, url } = useLocalSearchParams();

    // 링크 관리
    useEffect(() => {
        /** TODO 이곳으로 들어오는 링크는 웹 페이지 링크로 QR을 생성하고, 해당 웹 페이지에서 모바일 링크로 window.location.href="ktgenius://genius" 넘겨줘야 한다.
         * android :: ktgenius://genius?파라미터
         * ios :: com.kt.ktgetnius://genius?*/

        console.log(query);
        if (link == 'genius') {
            store.dispatch(dispatchOne('SET_LINK', true));

            const params = {
                query: query,
            };

            store.dispatch(dispatchOne('SET_PARAMS', params));
        }

        if (link == 'push') {
            Alert.alert(`push!!!\n${url}`);
            store.dispatch(dispatchOne('SET_LINK', true));
            store.dispatch(dispatchOne('SET_WEBLINK', url || '/main/portalMain.do'));
        }
    }, [link]);
}
