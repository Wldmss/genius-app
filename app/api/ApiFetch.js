const { EXPO_PUBLIC_SERVER_URL } = process.env;

class ApiFecth {
    async postForm(url, body) {
        const response = await fetch(`${EXPO_PUBLIC_SERVER_URL}/${url}`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify(body),
        });

        return await response.json();
    }

    async post(url, body) {
        const response = await fetch(`${EXPO_PUBLIC_SERVER_URL}/${url}`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        return await response.json();
    }
}

export default new ApiFecth();
