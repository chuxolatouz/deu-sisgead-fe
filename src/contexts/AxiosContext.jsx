import React, { createContext, useContext, useMemo } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export const AxiosContext = createContext();

export function AxiosProvider({ children }) {
  const BASE_URL = (process.env.NEXT_PUBLIC_APP_BACKEND || "").trim();
  const router = useRouter();

  const user = useMemo(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }, []);

  const token = user?.token || localStorage.getItem('token');

  const api = useMemo(() => {

    const requestHeaders = {
      'Content-Type': 'application/json;charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    };

    // Add Authorization header if we have a token
    if (token && token !== '') {
      requestHeaders.Authorization = `Bearer ${token}`;
    }

    const axiosInstance = axios.create({
      // Si no hay env explícita, usa rutas relativas al host actual (evita hardcode localhost/127).
      baseURL: BASE_URL || undefined,
      headers: requestHeaders,
      transformRequest: [(data, headers) => {
        if (data instanceof FormData) {
          // Set Content-Type to multipart/form-data

          // eslint-disable-next-line no-param-reassign
          headers['Content-Type'] = 'multipart/form-data';
          return data;
        }
        return JSON.stringify(data);
      }],
    });

    // Request interceptor para agregar el header X-Department-Context
    axiosInstance.interceptors.request.use(
      (config) => {
        // Solo agregar el header si el usuario es super_admin
        if (user?.role === 'super_admin') {
          const departmentContext = localStorage.getItem('departmentContext');
          if (departmentContext) {
            try {
              const parsed = JSON.parse(departmentContext);
              if (parsed.departamentoId) {
                config.headers['X-Department-Context'] = parsed.departamentoId;
              }
            } catch (error) {
              console.error('Error al parsear departmentContext:', error);
            }
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    axiosInstance.interceptors.response.use(
      response => response,
      error => {
        if (error.response && error.response.status === 403) {
          // Eliminar el token y redireccionar a la página de inicio de sesión
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('departmentContext');
          router.push('/login');
        }
        return Promise.reject(error);
      }
    );

    return axiosInstance;
  }, [BASE_URL, token]);

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <AxiosContext.Provider value={{ api, user }}>
      {children}
    </AxiosContext.Provider>
  );
}

export function useApi() {
  return useContext(AxiosContext);
}
