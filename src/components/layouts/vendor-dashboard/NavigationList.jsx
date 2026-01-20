import duotone from "components/icons/duotone";

// Function to get navigations based on user role
export const getNavigations = () => {
  const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const user = userStr ? JSON.parse(userStr) : null;
  const role = user?.role || '';
  
  // Check if there's an active department context
  const departmentContext = typeof window !== 'undefined' ? localStorage.getItem('departmentContext') : null;
  const usandoContexto = departmentContext !== null;

  const baseNavigations = [
    {
      type: "label",
      label: "Admin",
    },
    {
      name: "Dashboard",
      icon: duotone.Dashboard,
      path: "/admin/dashboard",
    },
    {
      name: "Portafolio",
      icon: duotone.Products,
      children: [
        {
          name: "Lista de Proyectos",
          path: "/admin/products",
        },
        {
          name: "Crear Proyecto",
          path: "/admin/products/create",
        },
      ],
    },
    {
      name: "Reglas Fijas",
      icon: duotone.AccountSetting,
      children: [
        {
          name: "Crear Solicitud",
          path: "/admin/request/create"
        },
        {
          name: "Lista de Solicitudes",
          path: "/admin/request",
        },
      ]
    },
    {
      name: "Usuarios",
      icon: duotone.Customers,
      path: "/admin/customers",
    },
  ];

  // Add Departamentos section only for super_admin when NOT in department context
  // When in department context, hide this section since they're viewing as that department
  if (role === 'super_admin' && !usandoContexto) {
    baseNavigations.push({
      name: "Departamentos",
      icon: duotone.AdminEcommerce,
      children: [
        {
          name: "Lista de Departamentos",
          path: "/admin/departamentos",
        },
        {
          name: "Crear Departamento",
          path: "/admin/departamentos/create",
        },
      ],
    });
  }

  // Add Logout at the end
  baseNavigations.push({
    name: "Logout",
    icon: duotone.Session,
    type: "action",
  });

  return baseNavigations;
};

// Keep the export for backwards compatibility
export const navigations = getNavigations();
