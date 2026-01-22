import { Box } from "@mui/material";
import * as yup from "yup";
import { useRouter } from "next/router";
import { H3 } from "components/Typography";
import { useSnackbar } from "notistack";
import { ProductForm } from "pages-sections/admin";
import VendorDashboardLayout from "components/layouts/vendor-dashboard";
import { useApi } from "contexts/AxiosContext";


// =============================================================================
CreateProduct.getLayout = function getLayout(page) {
  return <VendorDashboardLayout>{page}</VendorDashboardLayout>;
};
// =============================================================================

export default function CreateProduct() {
  const INITIAL_VALUES = {
    nombre: "",
    categoria: "",
    descripcion: "",
    fecha_inicio: "",
    objetivo_general: "",
    objetivos_especificos: [],
    fecha_fin: "",
  };
  const validationSchema = yup.object().shape({
  nombre: yup.string().required("obligatorio"),
  categoria: yup.string().required("obligatorio"),
  descripcion: yup.string().required("obligatorio"),
  fecha_inicio: yup.string().required("obligatorio"),
  fecha_fin: yup.string().required("obligatorio"),
  objetivo_general: yup.string(),
  objetivos_especificos: yup.array().of(yup.string()),
  })
  
  const { api } = useApi();
  const { enqueueSnackbar } = useSnackbar();
  const router= useRouter();
  

  const handleFormSubmit = (values) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/fe8cf17c-23a3-4a4e-96f1-bc6047dc12b8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create.jsx:42',message:'Frontend sending proyecto data',data:{values:values,categoria:values.categoria,categoriaType:typeof values.categoria},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    api.post('/crear_proyecto', values)
      .then((response) => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/fe8cf17c-23a3-4a4e-96f1-bc6047dc12b8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create.jsx:45',message:'Backend response received',data:{response:response.data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        router.push("/admin/products/");
      })
      .catch((error) => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/fe8cf17c-23a3-4a4e-96f1-bc6047dc12b8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create.jsx:48',message:'Error creating proyecto',data:{error:error.response?.data,status:error.response?.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        if (error.response) {
            enqueueSnackbar(error.response.data.message, { variant: 'error'})
        } else {
            enqueueSnackbar(error.message, { variant: 'error'})
        }
    })

  };
  return (
    <Box py={4}>
      <H3 mb={2}>Crear un nuevo Proyecto</H3>

      <ProductForm
        initialValues={INITIAL_VALUES}
        validationSchema={validationSchema}
        handleFormSubmit={handleFormSubmit}
      />
    </Box>
  );
}
