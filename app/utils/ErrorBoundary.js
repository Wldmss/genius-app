import ErrorPage from '(utils)/error';

/** 오류 */
export function ErrorBoundary({ error, retry }) {
    console.log(error);
    return <ErrorPage />;
}
