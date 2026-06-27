import axios from 'axios';

const adminApi = axios.create({
    baseURL: 'http://localhost:8000/api/admin/',
});

adminApi.interceptors.request.use((config) => {
    const credentials = localStorage.getItem('adminCredentials');
    if (credentials) {
        const { username, password } = JSON.parse(credentials);
        config.auth = {
            username: username,
            password: password
        };
    }
    return config;
});

export default adminApi;
