import axios, { AxiosInstance } from "axios";

export const initApi = (): AxiosInstance => {
  // initialise axios with setAuth in middleware
  const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/v1`,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // set api middleware
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        config.headers.token = token;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );


  return api;
};

export const authApi = (): AxiosInstance => {
  // initialise axios with setAuth in middleware
  const api = axios.create({
    baseURL: import.meta.env.VITE_AUTH_API_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // set api middleware
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        config.headers.token = token;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );


  return api;
};

export const questionApi = (): AxiosInstance => {
  // initialise axios with setAuth in middleware
  const api = axios.create({
    baseURL: import.meta.env.VITE_QUES_API_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // set api middleware
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        config.headers.token = token;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );


  return api;
};