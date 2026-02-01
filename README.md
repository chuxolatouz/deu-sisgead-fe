# DEU Sistema Administrativo - Frontend

Aplicación web frontend desarrollada con Next.js y React para el sistema de gestión administrativa de proyectos, presupuestos, usuarios y departamentos.

## 📋 Tabla de Contenidos

- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Build](#build)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Tecnologías](#tecnologías)
- [Características Principales](#características-principales)

## 🔧 Requisitos Previos

- Node.js 18.x o superior
- Yarn 1.22.x (recomendado) o npm

## 📦 Instalación

1. Clonar el repositorio (si aplica)

2. Instalar dependencias:
   ```bash
   yarn install
   # o
   npm install
   ```

   **Importante:** No eliminar el archivo `yarn.lock` si usas Yarn.

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# URL del backend API
NEXT_PUBLIC_APP_BACKEND=http://localhost:5000/
```

Si no se configura, el sistema usará `http://localhost:5000/` por defecto.

## 🚀 Ejecución

### Modo Desarrollo

```bash
yarn dev
# o
npm run dev
```

La aplicación estará disponible en `http://localhost:3000` y detectará automáticamente los cambios en los archivos.

### Modo Producción

```bash
yarn build
yarn start
# o
npm run build
npm start
```

## 🏗️ Build

Para crear una build de producción:

```bash
yarn build
# o
npm run build
```

Para exportar como sitio estático:

```bash
yarn export
# o
npm run export
```

## 📁 Estructura del Proyecto

```
deu-sisgead-fe/
├── pages/                      # Páginas de Next.js (routing automático)
│   ├── _app.jsx               # Configuración global de la app
│   ├── _document.jsx          # Personalización del HTML
│   ├── login.jsx              # Página de login
│   ├── admin/                  # Páginas de administración
│   │   ├── products/          # Gestión de proyectos
│   │   │   ├── index.jsx      # Lista de proyectos
│   │   │   ├── create.jsx     # Crear proyecto
│   │   │   ├── [slug].jsx     # Detalles del proyecto
│   │   │   └── edit/[slug].jsx # Editar proyecto
│   │   ├── customers/         # Gestión de usuarios
│   │   ├── departamentos/     # Gestión de departamentos
│   │   ├── categories/        # Gestión de categorías
│   │   ├── request/           # Gestión de solicitudes
│   │   └── dashboard/         # Dashboard administrativo
│   └── ...
├── src/
│   ├── components/            # Componentes reutilizables
│   │   ├── data-table/        # Componentes de tablas
│   │   │   └── TablePagination.jsx
│   │   ├── layouts/           # Layouts de página
│   │   │   └── vendor-dashboard/
│   │   └── ...
│   ├── pages-sections/        # Secciones de páginas específicas
│   │   └── admin/
│   │       ├── products/      # Componentes de proyectos
│   │       │   ├── ProductForm.jsx
│   │       │   ├── ProductDetails.jsx
│   │       │   ├── ProductRow.jsx
│   │       │   ├── ProductReport.jsx
│   │       │   ├── ProductMovements.jsx
│   │       │   ├── ProductLogs.jsx
│   │       │   └── ProductBudget.jsx
│   │       ├── customers/     # Componentes de usuarios
│   │       ├── departamentos/ # Componentes de departamentos
│   │       └── ...
│   ├── contexts/              # Contextos de React
│   │   └── AxiosContext.jsx   # Configuración de Axios y autenticación
│   ├── utils/                 # Utilidades
│   │   ├── __api__/           # Funciones de API mock (para desarrollo)
│   │   └── emailService.js    # Servicio de envío de emails
│   ├── hooks/                 # Custom hooks
│   │   ├── useMuiTable.js
│   │   ├── useScroller.js
│   │   └── useSettings.js
│   ├── theme/                 # Configuración de temas
│   └── models/                # Modelos de datos
├── public/                    # Archivos estáticos
│   └── assets/               # Imágenes, iconos, etc.
├── package.json
└── README.md                  # Este archivo
```

## 🛠️ Tecnologías

### Core
- **Next.js 13.4.7** - Framework React con SSR
- **React 18.2.0** - Biblioteca UI
- **Material-UI (MUI) 5.11.16** - Componentes UI
- **Axios 1.3.5** - Cliente HTTP

### Formularios y Validación
- **Formik 2.2.9** - Manejo de formularios
- **Yup 1.0.2** - Validación de esquemas

### Gráficos y Visualización
- **Recharts 2.15.3** - Gráficos y visualizaciones
- **ApexCharts 3.37.3** - Gráficos adicionales

### Utilidades
- **date-fns 2.29.3** - Manipulación de fechas
- **lodash 4.17.21** - Utilidades JavaScript
- **notistack 3.0.1** - Notificaciones toast
- **currency.js 2.0.4** - Formateo de moneda

### Desarrollo
- **ESLint** - Linter
- **Prettier** - Formateador de código
- **TypeScript 5.0.3** - Tipado estático (parcial)

## ✨ Características Principales

### Autenticación
- Login con JWT
- Gestión de sesiones con localStorage
- Protección de rutas basada en roles

### Gestión de Proyectos
- Crear, editar, eliminar proyectos
- Asignación de balance
- Gestión de miembros del proyecto
- Seguimiento de presupuestos
- Generación de reportes y gráficos
- Logs de actividad

### Gestión de Usuarios
- CRUD completo de usuarios
- Asignación de roles (usuario, admin_departamento, super_admin)
- Gestión de departamentos

### Gestión de Presupuestos
- Crear y gestionar presupuestos
- Subida de archivos
- Estados de presupuestos (new, in_progress, finished)
- Aprobación y rechazo

### Sistema de Notificaciones
- Envío de emails con templates HTML
- Notificaciones de login
- Emails de bienvenida
- Servicio reutilizable de emails

### Reportes y Estadísticas
- Reportes de proyectos con gráficos
- Evolución del saldo (gráficos de línea)
- Egresos por tipo (gráficos de pie)
- Dashboard con métricas generales

### Paginación Unificada
- Todos los componentes de lista usan el mismo patrón
- Paginación consistente en toda la aplicación
- Componente `TablePagination` reutilizable

## 📱 Páginas Principales

### Administración
- `/admin/products` - Lista de proyectos
- `/admin/products/create` - Crear proyecto
- `/admin/products/[slug]` - Detalles del proyecto
- `/admin/customers` - Gestión de usuarios
- `/admin/departamentos` - Gestión de departamentos
- `/admin/categories` - Gestión de categorías
- `/admin/request` - Gestión de solicitudes de reglas
- `/admin/dashboard` - Dashboard principal

### Autenticación
- `/login` - Inicio de sesión
- `/signup` - Registro (si está habilitado)

## 🔌 Integración con Backend

El frontend se comunica con el backend a través de:
- **Context API**: `AxiosContext` proporciona una instancia configurada de Axios
- **Base URL**: Configurada mediante `NEXT_PUBLIC_APP_BACKEND`
- **Autenticación**: Tokens JWT enviados en el header `Authorization: Bearer <token>`

## 📝 Scripts Disponibles

```bash
# Desarrollo
yarn dev              # Iniciar servidor de desarrollo

# Build
yarn build            # Crear build de producción
yarn export          # Exportar como sitio estático
yarn start           # Iniciar servidor de producción

# Calidad de código
yarn lint            # Ejecutar ESLint
yarn fix:prettier    # Formatear código con Prettier
```

## 🎨 Estilos y Temas

- El proyecto utiliza Material-UI (MUI) para los componentes
- Los temas se configuran en `src/theme/`
- Soporte para RTL (Right-to-Left) mediante `stylis-plugin-rtl`

## 📦 Gestión de Estado

- **Context API**: Para estado global (autenticación, configuración)
- **Local Storage**: Para persistencia de tokens y datos de usuario
- **Estado Local**: React hooks (`useState`, `useEffect`) para estado de componentes

## 🔄 Flujo de Datos

1. Usuario interactúa con la UI
2. Componente llama a función del servicio/API
3. AxiosContext envía request al backend con autenticación
4. Backend procesa y responde
5. Componente actualiza estado y re-renderiza

## 📧 Sistema de Emails

El frontend incluye un servicio reutilizable (`src/utils/emailService.js`) que proporciona:
- `sendEmailWithTemplate()` - Enviar email con template HTML
- `sendEmailWithBody()` - Enviar email con contenido directo
- `sendLoginNotification()` - Notificación de login
- `sendWelcomeEmail()` - Email de bienvenida

## 🐛 Debugging

- Los logs de desarrollo se muestran en la consola del navegador
- Next.js incluye hot-reload para desarrollo rápido
- Errores se muestran mediante notificaciones toast (notistack)

## 📄 Licencia

Este proyecto es privado y de uso interno.
