import axios from 'axios';
import Constants from 'expo-constants';

const debuggerHost = Constants.expoConfig?.hostUri;
const localhost = debuggerHost?.split(':')[0];

const api = axios.create({
    baseURL: `http://${localhost}:8000`,
});

export default api;