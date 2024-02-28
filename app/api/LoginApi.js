import ApiService from './ApiService';

// LDAP login
export const ldapLogin = (username, password) => {
    const key = 'genius';
    // const encryptUsername = AES.encrypt(String(username), key).toString(enc.Utf8);
    // const encryptPassword = AES.encrypt(String(password), key).toString(enc.Utf8);

    return ApiService.post('login', { username: username, password: password }, {})
        .then((response) => {
            return { status: true, data: response.data };
        })
        .catch((err) => {
            return { status: true };
        });
};
