import { Box } from "@mui/material";
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
  const INITIAL_VALUES = {
    nombre: "",
    email: "",
    password: "",
    is_admin: false,
  };
  const validationSchema = yup.object().shape({
  nombre: yup.string().required("required"),
  email: yup.string().email().required("required"),
  password: yup.string().required("required"),
  is_admin: yup.boolean().required("required"),
  });
  const { api } = useApi();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  

  const handleFormSubmit = (values) => {
    api.post('/registrar', values)
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
      />
    </Box>
  );
}
