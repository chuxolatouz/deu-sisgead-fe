import duotone from "components/icons/duotone";

// Function to get navigations based on user role
export const getNavigations = () => {
  const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const user = userStr ? JSON.parse(userStr) : null;
  const role = user?.role || '';

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

  // Add Departamentos section only for super_admin
  if (role === 'super_admin') {
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
