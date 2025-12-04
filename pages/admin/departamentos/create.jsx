import { Box } from "@mui/material";
import * as yup from "yup";
import { useRouter } from "next/router";
import { H3 } from "components/Typography";
import { useSnackbar } from "notistack";
import DepartamentoForm from "pages-sections/admin/departamentos/DepartamentoForm";
import VendorDashboardLayout from "components/layouts/vendor-dashboard";
import { useApi } from "contexts/AxiosContext";

// =============================================================================
CreateDepartamento.getLayout = function getLayout(page) {
  return <VendorDashboardLayout>{page}</VendorDashboardLayout>;
};
// =============================================================================

export default function CreateDepartamento() {
  const INITIAL_VALUES = {
    nombre: "",
    descripcion: "",
    codigo: "",
    activo: true,
  };

  const validationSchema = yup.object().shape({
    nombre: yup.string().required("El nombre es obligatorio"),
    codigo: yup.string().required("El código es obligatorio"),
    descripcion: yup.string(),
    activo: yup.boolean(),
  });

  const { api } = useApi();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const handleFormSubmit = (values) => {
    api.post('/departamentos', values)
      .then((response) => {
        enqueueSnackbar('Departamento creado exitosamente', { variant: 'success' });
        router.push("/admin/departamentos");
      })
      .catch((error) => {
        if (error.response) {
          enqueueSnackbar(error.response.data.message || 'Error al crear departamento', { variant: 'error' });
        } else {
          enqueueSnackbar(error.message, { variant: 'error' });
        }
      });
  };

  return (
    <Box py={4}>
      <H3 mb={2}>Crear un nuevo Departamento</H3>
      <DepartamentoForm
        initialValues={INITIAL_VALUES}
        validationSchema={validationSchema}
        handleFormSubmit={handleFormSubmit}
      />
    </Box>
  );
}

