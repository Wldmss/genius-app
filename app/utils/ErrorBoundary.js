import ErrorPage from '(utils)/error';

/** 오류 */
export function ErrorBoundary({ error, retry }) {
    return <ErrorPage />;
}
