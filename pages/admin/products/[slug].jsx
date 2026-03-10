import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { Box } from "@mui/material";
import { H3 } from "components/Typography";
import { ProductDetails } from "pages-sections/admin";
import VendorDashboardLayout from "components/layouts/vendor-dashboard";
import { useApi } from "contexts/AxiosContext";
import { useSnackbar } from "notistack";

EditProduct.getLayout = function getLayout(page) {
  return <VendorDashboardLayout>{page}</VendorDashboardLayout>;
};

export default function EditProduct() {
  const router = useRouter();
  const [product, setProduct] = useState({});
  const { api } = useApi();
  const { enqueueSnackbar } = useSnackbar();
  const currentYear = new Date().getFullYear();

  const slug = router.query.slug ?? router.query.id; // fallback por si usas otro nombre

  const fetchProject = useCallback(() => {
    if (!slug) return;
    api.get(`/proyecto/${slug}?year=${currentYear}`)
      .then((response) => {
        setProduct(response.data || {});
      })
      .catch((error) => {
        const message = error?.response?.data?.message || error?.message || "Error al cargar el proyecto";
        enqueueSnackbar(message, { variant: "error" });
      });
  }, [api, currentYear, enqueueSnackbar, slug]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  return (
    <Box py={4}>
      <H3 mb={2}>{product.nombre}</H3>
      <ProductDetails product={product} onRefresh={fetchProject} />
    </Box>
  );
}
