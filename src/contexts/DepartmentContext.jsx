import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useApi } from './AxiosContext';

export const DepartmentContext = createContext();

export function DepartmentProvider({ children }) {
  const [departamentoContexto, setDepartamentoContexto] = useState(null);
  const [departamentoData, setDepartamentoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { api, user } = useApi();

  // Verificar el contexto con el backend
  const verificarContexto = useCallback(async (departamentoId = null) => {
    if (user?.role !== 'super_admin') return;

    setLoading(true);
    try {
      const headers = {};
      if (departamentoId) {
        headers['X-Department-Context'] = departamentoId;
      }

      const response = await api.get('/contexto_departamento', { headers });
      const data = response.data;

      if (data.usando_contexto && data.departamento) {
        setDepartamentoContexto(data.departamento_id);
        setDepartamentoData(data.departamento);
        // Guardar en localStorage
        localStorage.setItem('departmentContext', JSON.stringify({
          departamentoId: data.departamento_id,
          departamentoData: data.departamento
        }));
      } else {
        // No hay contexto activo
        setDepartamentoContexto(null);
        setDepartamentoData(null);
        localStorage.removeItem('departmentContext');
      }
    } catch (error) {
      console.error('Error al verificar contexto:', error);
      // Si hay error, limpiar el contexto
      setDepartamentoContexto(null);
      setDepartamentoData(null);
      localStorage.removeItem('departmentContext');
    } finally {
      setLoading(false);
    }
  }, [api, user]);

  // Cargar el contexto desde localStorage al iniciar
  useEffect(() => {
    if (typeof window !== 'undefined' && user?.role === 'super_admin' && api) {
      const savedContext = localStorage.getItem('departmentContext');
      if (savedContext) {
        try {
          const parsed = JSON.parse(savedContext);
          setDepartamentoContexto(parsed.departamentoId);
          setDepartamentoData(parsed.departamentoData);
          // Verificar que el contexto sigue siendo válido
          verificarContexto(parsed.departamentoId);
        } catch (error) {
          console.error('Error al cargar contexto de departamento:', error);
          localStorage.removeItem('departmentContext');
        }
      } else {
        // Verificar si hay un contexto activo en el backend
        verificarContexto(null);
      }
    }
  }, [user, api, verificarContexto]);

  // Ingresar a un departamento
  const ingresarADepartamento = useCallback(async (departamentoId, departamentoInfo = null) => {
    if (user?.role !== 'super_admin') return;

    setLoading(true);
    try {
      const response = await api.get('/contexto_departamento', {
        headers: {
          'X-Department-Context': departamentoId
        }
      });

      const data = response.data;
      if (data.usando_contexto && data.departamento) {
        setDepartamentoContexto(data.departamento_id);
        setDepartamentoData(data.departamento);
        // Guardar en localStorage
        localStorage.setItem('departmentContext', JSON.stringify({
          departamentoId: data.departamento_id,
          departamentoData: data.departamento
        }));
        return true;
      } else {
        throw new Error('No se pudo establecer el contexto del departamento');
      }
    } catch (error) {
      console.error('Error al ingresar al departamento:', error);
      setDepartamentoContexto(null);
      setDepartamentoData(null);
      localStorage.removeItem('departmentContext');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [api, user]);

  // Salir del contexto
  const salirDelContexto = useCallback(() => {
    setDepartamentoContexto(null);
    setDepartamentoData(null);
    localStorage.removeItem('departmentContext');
  }, []);

  const value = {
    departamentoContexto,
    departamentoData,
    loading,
    ingresarADepartamento,
    salirDelContexto,
    verificarContexto,
    usandoContexto: departamentoContexto !== null
  };

  return (
    <DepartmentContext.Provider value={value}>
      {children}
    </DepartmentContext.Provider>
  );
}

export function useDepartment() {
  const context = useContext(DepartmentContext);
  if (!context) {
    throw new Error('useDepartment debe usarse dentro de DepartmentProvider');
  }
  return context;
}
