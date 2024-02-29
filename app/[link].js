import { useEffect } from 'react';
import store from 'store/store';
import { useLocalSearchParams } from 'expo-router';
import { dispatchOne } from 'utils/DispatchUtils';

export default function Link() {
    const { link } = useLocalSearchParams();

    // 링크 관리
    useEffect(() => {
        if (link == 'genius') {
            store.dispatch(dispatchOne('SET_LINK', true));
        }
    }, [link]);
}
