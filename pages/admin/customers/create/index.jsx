import { Box } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import * as yup from "yup";
import { useRouter } from "next/router";
import { H3 } from "components/Typography";
import { useSnackbar } from "notistack";
import { CustomerForm } from "pages-sections/admin";
import VendorDashboardLayout from "components/layouts/vendor-dashboard";
import { useApi } from "contexts/AxiosContext";
import { sendWelcomeEmail } from "utils/emailService";


// =============================================================================
CreateProduct.getLayout = function getLayout(page) {
  return <VendorDashboardLayout>{page}</VendorDashboardLayout>;
};
// =============================================================================

export default function CreateProduct() {
  const { api, user } = useApi();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  const actorRole = user?.role || "";
  const actorDepartmentId = user?.departmentId || user?.departamento_id || "";
  const canManageUsers = actorRole === "super_admin" || actorRole === "admin_departamento";
  const canSelectAnyRole = actorRole === "super_admin";

  useEffect(() => {
    if (!user) return;

    if (!canManageUsers) {
      enqueueSnackbar("No autorizado para crear usuarios", { variant: "error" });
      router.push("/admin/products");
      return;
    }

    const loadDepartments = async () => {
      setLoadingDepartments(true);
      try {
        if (canSelectAnyRole) {
          const response = await api.get("/departamentos?limit=200");
          const list = Array.isArray(response.data)
            ? response.data
            : (response.data.request_list || response.data.departamentos || []);
          setDepartments(list);
          return;
        }

        if (actorDepartmentId) {
          const response = await api.get(`/departamentos/${actorDepartmentId}`);
          setDepartments([response.data]);
        }
      } catch (error) {
        if (error.response) {
          enqueueSnackbar(error.response.data.message || "Error al cargar departamentos", { variant: "error" });
        } else {
          enqueueSnackbar(error.message || "Error al cargar departamentos", { variant: "error" });
        }
      } finally {
        setLoadingDepartments(false);
      }
    };

    loadDepartments();
  }, [actorDepartmentId, canManageUsers, canSelectAnyRole, api, enqueueSnackbar, router, user]);

  const INITIAL_VALUES = useMemo(() => ({
    nombre: "",
    email: "",
    password: "",
    rol: canSelectAnyRole ? "usuario" : "usuario",
    departmentId: canSelectAnyRole ? "" : actorDepartmentId,
  }), [actorDepartmentId, canSelectAnyRole]);

  const validationSchema = yup.object().shape({
    nombre: yup.string().required("required"),
    email: yup.string().email().required("required"),
    password: yup.string().required("required"),
    rol: yup.string().oneOf(["usuario", "admin_departamento", "super_admin"]).required("required"),
    departmentId: yup.string().when("rol", {
      is: (rol) => rol !== "super_admin",
      then: (schema) => schema.required("required"),
      otherwise: (schema) => schema.notRequired(),
    }),
  });
  

  const handleFormSubmit = (values) => {
    if (!canManageUsers) {
      enqueueSnackbar("No autorizado para crear usuarios", { variant: "error" });
      return;
    }

    const roleToCreate = canSelectAnyRole ? values.rol : "usuario";
    const payload = {
      nombre: values.nombre,
      email: values.email,
      password: values.password,
      rol: roleToCreate,
    };

    if (roleToCreate !== "super_admin") {
      payload.departmentId = canSelectAnyRole ? values.departmentId : actorDepartmentId;
      if (!payload.departmentId) {
        enqueueSnackbar("El departamento es requerido para este rol", { variant: "error" });
        return;
      }
    }

    api.post('/registrar', payload)
      .then((response) => {
        // Enviar email de bienvenida al nuevo usuario
        if (response.data && values.email) {
          sendWelcomeEmail(api, {
            email: values.email,
            nombre: values.nombre
          }, (error) => {
            // Error silencioso, no afecta la creación del usuario
            console.warn('No se pudo enviar email de bienvenida:', error);
          });
        }
        
        enqueueSnackbar('Usuario creado exitosamente', { variant: 'success' });
        router.push("/admin/customers/");
      })
      .catch((error) => {
        if (error.response) {
          enqueueSnackbar(error.response.data.message, { variant: 'error' });
        } else {
          enqueueSnackbar(error.message, { variant: 'error' });
        }
      });
  };
  return (
    <Box py={4}>
      <H3 mb={2}>Crear un nuevo usuario</H3>

      <CustomerForm
        initialValues={INITIAL_VALUES}
        validationSchema={validationSchema}
        handleFormSubmit={handleFormSubmit}
        departments={departments}
        loadingDepartments={loadingDepartments}
        currentUserRole={actorRole}
        isDepartmentLocked={!canSelectAnyRole}
      />
    </Box>
  );
}
