---
name: DEU SISGEAD Frontend Context
description: Comprehensive context about the Next.js frontend architecture, patterns, and conventions
---

# DEU SISGEAD Frontend Context

This skill provides comprehensive context about the Next.js frontend for the DEU Sistema Administrativo project.

## 🏗️ Architecture Overview

### Technology Stack
- **Framework**: Next.js 13.4.7 with React 18.2.0
- **UI Library**: Material-UI (MUI) 5.11.16
- **Forms**: Formik 2.2.9 + Yup 1.0.2
- **HTTP Client**: Axios 1.3.5
- **Charts**: Recharts 2.15.3 + ApexCharts 3.37.3
- **Notifications**: Notistack 3.0.1
- **Date Handling**: date-fns 2.29.3
- **Currency**: currency.js 2.0.4
- **Styling**: Emotion + MUI theming system
- **i18n**: next-i18next 13.2.2

### Project Structure

```
deu-sisgead-fe/
├── pages/                      # Next.js pages (file-based routing)
│   ├── _app.jsx               # App wrapper with providers
│   ├── _document.jsx          # HTML document customization
│   ├── login.jsx              # Login page
│   └── admin/                 # Admin section
│       ├── products/          # Projects (called "products" in code)
│       │   ├── index.jsx      # List view
│       │   ├── create.jsx     # Create form
│       │   ├── [slug].jsx     # Details view
│       │   └── edit/[slug].jsx # Edit form
│       ├── customers/         # Users management
│       ├── departamentos/     # Departments
│       ├── categories/        # Categories
│       ├── request/           # Rule requests
│       └── dashboard/         # Dashboard
├── src/
│   ├── components/            # Reusable components
│   │   ├── data-table/        # TablePagination
│   │   ├── layouts/           # Page layouts
│   │   │   └── vendor-dashboard/  # Main admin layout
│   │   ├── RouteGuard.jsx     # Auth protection
│   │   └── SnackbarProvider.jsx
│   ├── pages-sections/        # Page-specific components
│   │   └── admin/
│   │       ├── products/      # Project components
│   │       │   ├── ProductForm.jsx
│   │       │   ├── ProductDetails.jsx
│   │       │   ├── ProductRow.jsx
│   │       │   ├── ProductReport.jsx
│   │       │   ├── ProductMovements.jsx
│   │       │   ├── ProductLogs.jsx
│   │       │   └── ProductBudget.jsx
│   │       ├── customers/     # User components
│   │       ├── departamentos/ # Department components
│   │       └── ...
│   ├── contexts/              # React Context providers
│   │   ├── AxiosContext.jsx   # API client + auth
│   │   ├── AppContext.jsx     # App state
│   │   ├── DepartmentContext.jsx  # Department filtering
│   │   └── SettingContext.jsx # UI settings
│   ├── utils/                 # Utilities
│   │   ├── emailService.js    # Email notifications
│   │   └── __api__/           # Mock API (dev)
│   ├── hooks/                 # Custom React hooks
│   ├── theme/                 # MUI theme config
│   └── models/                # Data models
└── public/                    # Static assets
```

## 🔑 Key Patterns & Conventions

### 1. Context Providers Hierarchy

The app wraps components in multiple context providers (see `pages/_app.jsx`):

```jsx
<SettingsProvider>
  <AppProvider>
    <RouteGuard>
      <AxiosProvider>
        <DepartmentProvider>
          <MuiTheme>
            <SnackbarProvider>
              <RTL>{page}</RTL>
            </SnackbarProvider>
          </MuiTheme>
        </DepartmentProvider>
      </AxiosProvider>
    </RouteGuard>
  </AppProvider>
</SettingsProvider>
```

### 2. Authentication & API Access

**AxiosContext Pattern:**
```jsx
import { useApi } from 'contexts/AxiosContext';

function MyComponent() {
  const { api, user } = useApi();
  
  // Make authenticated requests
  const fetchData = async () => {
    const response = await api.get('/projects/mostrar_proyectos');
    // api automatically includes Authorization header
  };
}
```

**Key features:**
- Automatically adds `Authorization: Bearer <token>` header
- Stores user data in localStorage
- Redirects to `/login` on 401/403 responses
- Supports FormData for file uploads
- Adds `X-Department-Context` header for super_admin users

### 3. Route Protection

**RouteGuard Component:**
- Checks for token in localStorage
- Redirects to `/login` if not authenticated
- Public routes: `/login`, `/signup`
- All `/admin/*` routes are protected

### 4. Page Layout Pattern

**Admin pages use VendorDashboardLayout:**
```jsx
import VendorDashboardLayout from 'components/layouts/vendor-dashboard';

function MyPage() {
  return <div>Content</div>;
}

MyPage.getLayout = function getLayout(page) {
  return <VendorDashboardLayout>{page}</VendorDashboardLayout>;
};

export default MyPage;
```

### 5. Form Handling with Formik + Yup

**Standard pattern:**
```jsx
import { Formik } from 'formik';
import * as yup from 'yup';

const validationSchema = yup.object({
  nombre: yup.string().required('Nombre es requerido'),
  email: yup.string().email('Email inválido').required('Email es requerido'),
});

function MyForm() {
  return (
    <Formik
      initialValues={{ nombre: '', email: '' }}
      validationSchema={validationSchema}
      onSubmit={async (values) => {
        await api.post('/endpoint', values);
      }}
    >
      {({ values, errors, touched, handleChange, handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          {/* Form fields */}
        </form>
      )}
    </Formik>
  );
}
```

### 6. Pagination Pattern

**Unified pagination across all list views:**
```jsx
import TablePagination from 'components/data-table/TablePagination';

function MyList() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage]);

  const fetchData = async () => {
    const response = await api.get(
      `/endpoint?page=${page}&limit=${rowsPerPage}`
    );
    setData(response.data.data);
    setTotal(response.data.total);
  };

  return (
    <>
      {/* Render data */}
      <TablePagination
        count={total}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />
    </>
  );
}
```

**Important:** Backend uses 0-indexed pages.

### 7. Notifications with Notistack

```jsx
import { useSnackbar } from 'notistack';

function MyComponent() {
  const { enqueueSnackbar } = useSnackbar();

  const showNotification = () => {
    enqueueSnackbar('Operación exitosa', { variant: 'success' });
    // Variants: success, error, warning, info
  };
}
```

### 8. Currency Formatting

**Venezuelan Bolívares (Bs.) format:**
```jsx
// Standard format: "Bs. 1.000,00"
const formatCurrency = (amount) => {
  return `Bs. ${parseFloat(amount).toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};
```

**Important:** Backend may send currency as strings with comma decimals. Always parse carefully.

### 9. Date Formatting

```jsx
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Format date
const formattedDate = format(new Date(dateString), 'dd/MM/yyyy', { locale: es });

// Format datetime
const formattedDateTime = format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
```

### 10. File Upload Pattern

```jsx
const handleFileUpload = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('nombre', 'Document name');
  
  // AxiosContext automatically sets Content-Type to multipart/form-data
  const response = await api.post('/documents/documento_crear', formData);
};
```

## 📊 Data Flow Patterns

### 1. List → Details → Edit Flow

**Projects example:**
- `/admin/products` - List view (ProductRow components)
- `/admin/products/[slug]` - Details view (ProductDetails)
- `/admin/products/edit/[slug]` - Edit form (ProductForm)

### 2. Modal Forms

**Common pattern for create/edit modals:**
```jsx
const [open, setOpen] = useState(false);
const [selectedItem, setSelectedItem] = useState(null);

const handleOpen = (item = null) => {
  setSelectedItem(item);
  setOpen(true);
};

const handleClose = () => {
  setOpen(false);
  setSelectedItem(null);
};

const handleSubmit = async (values) => {
  if (selectedItem) {
    // Edit
    await api.put(`/endpoint/${selectedItem._id}`, values);
  } else {
    // Create
    await api.post('/endpoint', values);
  }
  handleClose();
  fetchData(); // Refresh list
};
```

### 3. Real-time Updates

**After mutations, refresh data:**
```jsx
const handleDelete = async (id) => {
  await api.post('/endpoint/eliminar', { id });
  enqueueSnackbar('Eliminado exitosamente', { variant: 'success' });
  fetchData(); // Refresh list
};
```

## 🎨 UI/UX Patterns

### 1. MUI Components

**Common components:**
- `Box` - Layout container with sx prop
- `Card`, `CardContent` - Content containers
- `Grid` - Responsive grid layout
- `TextField` - Form inputs
- `Button` - Actions
- `IconButton` - Icon-only buttons
- `Dialog` - Modals
- `Table`, `TableRow`, `TableCell` - Tables
- `Chip` - Status badges

### 2. Status Badges

```jsx
const getStatusColor = (status) => {
  switch (status) {
    case 'new': return 'info';
    case 'in_progress': return 'warning';
    case 'finished': return 'success';
    default: return 'default';
  }
};

<Chip label={status} color={getStatusColor(status)} size="small" />
```

### 3. Responsive Design

**Use MUI Grid system:**
```jsx
<Grid container spacing={3}>
  <Grid item xs={12} md={6}>
    {/* Full width on mobile, half on desktop */}
  </Grid>
  <Grid item xs={12} md={6}>
    {/* Full width on mobile, half on desktop */}
  </Grid>
</Grid>
```

### 4. Charts

**Recharts for line/bar charts:**
```jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

<LineChart data={chartData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="fecha" />
  <YAxis />
  <Tooltip />
  <Line type="monotone" dataKey="balance" stroke="#8884d8" />
</LineChart>
```

**ApexCharts for pie charts:**
```jsx
import Chart from 'react-apexcharts';

<Chart
  type="pie"
  series={[44, 55, 13]}
  options={{
    labels: ['Category A', 'Category B', 'Category C']
  }}
/>
```

## 🔐 User Roles & Permissions

**Role-based rendering:**
```jsx
const { user } = useApi();

// Check role
if (user?.role === 'super_admin') {
  // Show admin-only features
}

// Roles:
// - usuario: Regular user
// - admin_departamento: Department admin
// - super_admin: System administrator
```

## 🌐 Environment Variables

**Required:**
- `NEXT_PUBLIC_APP_BACKEND` - Backend API URL (default: http://localhost:5000/)

**Access in code:**
```jsx
const backendUrl = process.env.NEXT_PUBLIC_APP_BACKEND;
```

## 📝 Naming Conventions

**Important terminology:**
- **Products** = Projects (legacy naming in code)
- **Customers** = Users (legacy naming in code)
- **Documents** = Budgets/Presupuestos
- **Slug** = Project ID (used in URLs)

## 🎯 Common Tasks

### Adding a New Page
1. Create file in `pages/admin/[name]/index.jsx`
2. Add layout: `Page.getLayout = (page) => <VendorDashboardLayout>{page}</VendorDashboardLayout>`
3. Create components in `src/pages-sections/admin/[name]/`
4. Add navigation link in layout sidebar

### Adding a New Form
1. Create component in `src/pages-sections/admin/[section]/[Name]Form.jsx`
2. Use Formik + Yup for validation
3. Use MUI components for UI
4. Handle submit with AxiosContext api
5. Show notifications with useSnackbar

### Adding a New API Call
1. Use `const { api } = useApi()`
2. Make request: `await api.get/post/put/delete('/endpoint')`
3. Handle errors with try/catch
4. Show notifications for success/error

### Working with Tables
1. Use `TablePagination` component
2. Implement pagination state (page, rowsPerPage)
3. Fetch data with page/limit params
4. Display total count from backend response

## ⚠️ Important Notes

- **Currency**: Always use "Bs." prefix, format as "Bs. 1.000,00"
- **Dates**: Use date-fns with Spanish locale
- **Pagination**: 0-indexed (page=0 is first page)
- **File uploads**: Use FormData, AxiosContext handles headers
- **Authentication**: Token stored in localStorage, auto-added to requests
- **Errors**: Always show user-friendly notifications
- **Department Context**: Super admins can filter by department via `X-Department-Context` header

## 🚀 Running the Application

**Development:**
```bash
yarn dev          # Start dev server on http://localhost:3000
```

**Production:**
```bash
yarn build        # Build for production
yarn start        # Start production server
```

**Code Quality:**
```bash
yarn lint         # Run ESLint
yarn fix:prettier # Format code
```

## 🧩 Key Components Reference

### TablePagination
Location: `src/components/data-table/TablePagination.jsx`
- Unified pagination component
- Props: count, page, rowsPerPage, onPageChange, onRowsPerPageChange

### VendorDashboardLayout
Location: `src/components/layouts/vendor-dashboard/`
- Main admin layout with sidebar
- Navigation menu
- User profile dropdown

### RouteGuard
Location: `src/components/RouteGuard.jsx`
- Protects routes requiring authentication
- Redirects to /login if not authenticated

### AxiosContext
Location: `src/contexts/AxiosContext.jsx`
- Provides authenticated API client
- Manages user session
- Auto-redirects on auth errors

## 📦 State Management

**Local Storage:**
- `token` - JWT authentication token
- `user` - User object (name, email, role, department)
- `departmentContext` - Selected department for super_admin filtering

**Context API:**
- `AxiosContext` - API client + user data
- `AppContext` - App-level state
- `DepartmentContext` - Department filtering
- `SettingContext` - UI settings (theme, RTL, etc.)

## 🔄 Data Synchronization

**After mutations, always refresh:**
```jsx
const handleCreate = async (values) => {
  await api.post('/endpoint', values);
  enqueueSnackbar('Creado exitosamente', { variant: 'success' });
  fetchData(); // ← Important: refresh list
};
```

**For modals:**
```jsx
const handleClose = () => {
  setOpen(false);
  fetchData(); // Refresh on close
};
```
