/**
 * Servicio de utilidad para enviar correos electrónicos
 * Proporciona funciones reutilizables para enviar notificaciones por email
 */

/**
 * Envía un email usando un template HTML
 * @param {Object} api - Instancia de axios configurada
 * @param {Object} options - Opciones del email
 * @param {string} options.recipient - Email del destinatario
 * @param {string} options.subject - Asunto del email
 * @param {string} options.template - Nombre del template (ej: "notificaciones.html")
 * @param {Object} options.variables - Variables para el template
 * @param {Function} options.onSuccess - Callback opcional para éxito
 * @param {Function} options.onError - Callback opcional para errores
 * @param {boolean} options.silent - Si es true, no muestra notificaciones de error
 * @returns {Promise} Promise que se resuelve cuando el email se envía
 */
export const sendEmailWithTemplate = async (api, {
  recipient,
  subject,
  template,
  variables = {},
  onSuccess,
  onError,
  silent = false
}) => {
  try {
    const response = await api.post('/send-notification', {
      recipient,
      subject,
      template,
      variables
    });
    
    if (onSuccess) {
      onSuccess(response.data);
    }
    
    return response.data;
  } catch (error) {
    if (onError) {
      onError(error);
    } else if (!silent) {
      // Solo lanzar error si no es silencioso y no hay callback de error
      throw error;
    }
    return null;
  }
};

/**
 * Envía un email con contenido directo (sin template)
 * @param {Object} api - Instancia de axios configurada
 * @param {Object} options - Opciones del email
 * @param {string} options.recipient - Email del destinatario
 * @param {string} options.subject - Asunto del email
 * @param {string} options.body - Contenido del email (texto o HTML)
 * @param {boolean} options.isHtml - Indica si el body es HTML (default: true)
 * @param {Function} options.onSuccess - Callback opcional para éxito
 * @param {Function} options.onError - Callback opcional para errores
 * @param {boolean} options.silent - Si es true, no muestra notificaciones de error
 * @returns {Promise} Promise que se resuelve cuando el email se envía
 */
export const sendEmailWithBody = async (api, {
  recipient,
  subject,
  body,
  isHtml = true,
  onSuccess,
  onError,
  silent = false
}) => {
  try {
    const response = await api.post('/send-notification', {
      recipient,
      subject,
      body,
      is_html: isHtml
    });
    
    if (onSuccess) {
      onSuccess(response.data);
    }
    
    return response.data;
  } catch (error) {
    if (onError) {
      onError(error);
    } else if (!silent) {
      throw error;
    }
    return null;
  }
};

/**
 * Envía un email de notificación de login exitoso
 * @param {Object} api - Instancia de axios configurada
 * @param {Object} user - Información del usuario
 * @param {string} user.email - Email del usuario
 * @param {string} user.nombre - Nombre del usuario
 * @param {boolean} silent - Si es true, no muestra errores
 */
export const sendLoginNotification = async (api, user, silent = true) => {
  if (!user?.email) {
    return;
  }

  return sendEmailWithTemplate(api, {
    recipient: user.email,
    subject: 'Inicio de sesión exitoso',
    template: 'notificaciones.html',
    variables: {
      nombre: user.nombre || 'Usuario',
      mensaje: 'Has iniciado sesión exitosamente en la plataforma ENII.',
      fecha: new Date().toLocaleDateString('es-ES'),
      plataforma: 'ENII'
    },
    silent
  });
};

/**
 * Envía un email de bienvenida para nuevos usuarios
 * @param {Object} api - Instancia de axios configurada
 * @param {Object} user - Información del usuario
 * @param {string} user.email - Email del usuario
 * @param {string} user.nombre - Nombre del usuario
 * @param {Function} onError - Callback opcional para errores
 */
export const sendWelcomeEmail = async (api, user, onError) => {
  if (!user?.email) {
    return;
  }

  return sendEmailWithTemplate(api, {
    recipient: user.email,
    subject: 'Bienvenido a ENII',
    template: 'notificaciones.html',
    variables: {
      nombre: user.nombre || 'Usuario',
      mensaje: '¡Bienvenido a la plataforma ENII! Tu cuenta ha sido creada exitosamente.',
      fecha: new Date().toLocaleDateString('es-ES'),
      plataforma: 'ENII'
    },
    onError
  });
};
