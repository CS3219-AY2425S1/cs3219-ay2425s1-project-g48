import axios, { AxiosInstance } from "axios";
import React from "react";

export const initApi = (
  setAuth: React.Dispatch<React.SetStateAction<boolean>>
): AxiosInstance => {
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

export const authApi = (
  setAuth: React.Dispatch<React.SetStateAction<boolean>>
): AxiosInstance => {
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

export const questionApi = (
  setAuth: React.Dispatch<React.SetStateAction<boolean>>
): AxiosInstance => {
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