import axios from 'axios';

const api = axios.create({
    baseURL: 'https://api.themoviedb.org/3',
    params: {
        api_key: '3cb4c4c50bc0082deec6207848aa1adb',
        language: 'pt-BR'
    }
});

export default api;