class ApiFecth {
    async postForm(url, body) {
        const response = await fetch(`${process.env.EXPO_PUBLIC_SERVER_URL}/${url}`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`오류가 발생했습니다. ${response.status}`);
        }

        return await response.json();
    }

    async post(url, body) {
        const response = await fetch(`${process.env.EXPO_PUBLIC_SERVER_URL}/${url}`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`오류가 발생했습니다. ${response.status}`);
        }

        return await response.json();
    }

    async get(url) {
        const response = await fetch(`${process.env.EXPO_PUBLIC_SERVER_URL}/${url}`, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`오류가 발생했습니다. ${response.status}`);
        }

        return await response.json();
    }
}

export default new ApiFecth();
