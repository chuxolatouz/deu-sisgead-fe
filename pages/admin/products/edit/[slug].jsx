import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Box } from "@mui/material";
import * as yup from "yup";
import { H3 } from "components/Typography";
import { ProductForm } from "pages-sections/admin";
import VendorDashboardLayout from "components/layouts/vendor-dashboard";
import { useApi } from "contexts/AxiosContext";
import { useSnackbar } from "notistack";
import { parseISO } from "date-fns";
import { ro } from "date-fns/locale";

// =============================================================================
EditProduct.getLayout = function getLayout(page) {
  return <VendorDashboardLayout>{page}</VendorDashboardLayout>;
};
// =============================================================================

const INITIAL_VALUES = {
    nombre: "",
    categoria: "",
    descripcion: "",
    fecha_inicio: "",
    fecha_fin: "",
    objetivo_general: "",
    objetivos_especificos: [],
  };
  const validationSchema = yup.object().shape({
  nombre: yup.string().required("required"),
  categoria: yup.string().required("required"),
    descripcion: yup.string().required("required"),
    fecha_inicio: yup.string().required("required"),
    fecha_fin: yup.string().required("required"),
  });
export default function EditProduct() {
  const { query, push } = useRouter();
  const { slug } = query;
  const [product, setProduct] = useState(INITIAL_VALUES);
  const { enqueueSnackbar } = useSnackbar();
  const { api } = useApi();

  useEffect(() => {    
    if(slug) {
      api.get(
        `/proyecto/${slug}`,
        ).then((response) => {
          console.log(response.data)
            const parsedProduct = {
                nombre: response.data.nombre,
                categoria: response.data.categoria,
                descripcion: response.data.descripcion,
                fecha_inicio: parseISO(response.data.fecha_inicio),
                fecha_fin: parseISO(response.data.fecha_fin),
                objetivo_general: response.data.objetivo_general,
                objetivos_especificos: response.data.objetivos_especificos || [],
              };
              setProduct(parsedProduct);
        })
        .catch((error) => {
            if (error.response) {
                enqueueSnackbar(error.response.data.message, { variant: 'error'})
            } else {
                enqueueSnackbar(error.message, { variant: 'error'})
            }
        })
    }
  }, [slug]);

  const handleFormSubmit = (values) => {
    const payload = {
      nombre: values.nombre,
      categoria: values.categoria,
      descripcion: values.descripcion,
      fechaInicio: values.fecha_inicio,
      fechaFin: values.fecha_fin,
      objetivoGeneral: values.objetivo_general,
      objetivosEspecificos: values.objetivos_especificos,
    };

    if(slug) {
        api.put(
          `/actualizar_proyecto/${slug}`, payload
          ).then((response) => {
            enqueueSnackbar(response.data.message, { variant: 'success'})
            push("/admin/products/");
          })
          .catch((error) => {
              if (error.response) {
                  enqueueSnackbar(error.response.data.message, { variant: 'error'})
              } else {
                  enqueueSnackbar(error.message, { variant: 'error'})
              }
          })
      }
  }

  return (
    <Box py={4}>
      <H3 mb={2}>{product?.nombre}</H3>
        <ProductForm
          reinitialize
          shrink
          initialValues={product}
          validationSchema={validationSchema}
          handleFormSubmit={handleFormSubmit}
        />

      
    </Box>
  );
}
