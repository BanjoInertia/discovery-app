import axios from 'axios';
import Constants from 'expo-constants';

const PRODUCTION_URL = 'https://cineexplorer-api-c18n.onrender.com';

const debuggerHost = Constants.expoConfig?.hostUri;
const localhost = debuggerHost?.split(':')[0];

const api = axios.create({
    baseURL: __DEV__ ? `http://${localhost}:8000` : PRODUCTION_URL,
});

export default api;