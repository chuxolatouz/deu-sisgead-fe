/**
 * API Service para gestión de Cuentas Contables
 * Backend API: http://localhost:5000/accounts
 */

const API_BASE = process.env.NEXT_PUBLIC_APP_BACKEND || 'http://localhost:5000/';

// Helper para obtener el token de autenticación
const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

const accountsService = {
  /**
   * Listar cuentas con filtros opcionales
   * @param {Object} params - Parámetros de búsqueda
   * @param {string} params.code - Filtrar por código
   * @param {string} params.name - Filtrar por nombre
   * @param {boolean} params.active - Filtrar por estado
   * @param {number} params.page - Número de página
   * @param {number} params.limit - Registros por página
   */
  getAccounts: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(
        Object.entries(params).filter(([_, value]) => value !== undefined && value !== '')
      ).toString();
      
      const url = `${API_BASE}accounts${queryString ? `?${queryString}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Error al obtener cuentas');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en getAccounts:', error);
      throw error;
    }
  },

  /**
   * Obtener cuenta por ID
   * @param {string} id - ID de la cuenta
   */
  getAccountById: async (id) => {
    try {
      const response = await fetch(`${API_BASE}accounts/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Cuenta no encontrada');
        }
        throw new Error('Error al obtener la cuenta');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en getAccountById:', error);
      throw error;
    }
  },

  /**
   * Obtener cuenta por código
   * @param {string} code - Código de la cuenta
   */
  getAccountByCode: async (code) => {
    try {
      const response = await fetch(`${API_BASE}accounts/code/${encodeURIComponent(code)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Cuenta no encontrada');
        }
        throw new Error('Error al obtener la cuenta');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en getAccountByCode:', error);
      throw error;
    }
  },

  /**
   * Crear nueva cuenta
   * @param {Object} data - Datos de la cuenta
   * @param {string} data.code - Código único
   * @param {string} data.name - Nombre
   * @param {string} data.description - Descripción (opcional)
   * @param {boolean} data.active - Estado (opcional)
   */
  createAccount: async (data) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await fetch(`${API_BASE}accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear cuenta');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en createAccount:', error);
      throw error;
    }
  },

  /**
   * Actualizar cuenta existente
   * @param {string} id - ID de la cuenta
   * @param {Object} data - Datos a actualizar
   */
  updateAccount: async (id, data) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await fetch(`${API_BASE}accounts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar cuenta');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en updateAccount:', error);
      throw error;
    }
  },

  /**
   * Desactivar cuenta (soft delete)
   * @param {string} id - ID de la cuenta
   */
  deactivateAccount: async (id) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await fetch(`${API_BASE}accounts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al desactivar cuenta');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en deactivateAccount:', error);
      throw error;
    }
  },

  /**
   * Reactivar cuenta
   * @param {string} id - ID de la cuenta
   */
  activateAccount: async (id) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await fetch(`${API_BASE}accounts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ active: true })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al activar cuenta');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en activateAccount:', error);
      throw error;
    }
  }
};

export default accountsService;


