import { useEffect } from 'react';
import store from 'store/store';
import { useLocalSearchParams } from 'expo-router';
import { dispatchOne } from 'utils/DispatchUtils';

export default function Link() {
    const { link, query } = useLocalSearchParams();

    // 링크 관리
    useEffect(() => {
        /** TODO 이곳으로 들어오는 링크는 웹 페이지 링크로 QR을 생성하고, 해당 웹 페이지에서 모바일 링크로 window.location.href="genius://genius" 넘겨줘야 한다.
         * android :: genius://genius?파라미터
         * ios :: ...*/

        console.log(query);
        if (link == 'genius') {
            store.dispatch(dispatchOne('SET_LINK', true));

            const params = {
                query: query,
            };

            store.dispatch(dispatchOne('SET_PARAMS', params));
        }
    }, [link]);
}
