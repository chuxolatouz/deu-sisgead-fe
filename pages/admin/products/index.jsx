import {useEffect, useState } from "react";
import { Box, Card, Stack, Table, TableContainer } from "@mui/material";
import TableBody from "@mui/material/TableBody";
import TableHeader from "components/data-table/TableHeader";
import TablePagination from "components/data-table/TablePagination";
import VendorDashboardLayout from "components/layouts/vendor-dashboard";
import { H3 } from "components/Typography";
import Scrollbar from "components/Scrollbar";
import { ProductRow } from "pages-sections/admin";
import { useApi } from 'contexts/AxiosContext';
import { useSnackbar } from "notistack";

// TABLE HEADING DATA LIST
const tableHeading = [
  {
    id: "nombre",
    label: "Nombre",
    align: "left",
  },
  {
    id: "fecha_inicio",
    label: "Fecha Inicio",
    align: "left",
  },
  {
    id: "fecha_fin",
    label: "Fecha Fin",
    align: "left",
  },
  {
    id: "balance",
    label: "Balance",
    align: "left",
  },
  {
    id: "status",
    label: "Estado",
    align: "left",
  },
  {
    id: "action",
    label: "Acción",
    align: "center",
  },
];

// =============================================================================
ProductList.getLayout = function getLayout(page) {
  return <VendorDashboardLayout>{page}</VendorDashboardLayout>;
};
// =============================================================================

// =============================================================================

export default function ProductList() {
  const [projects, setProjects] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState({
    skip: 0,
    page: 0,
    limit: 10
  });
  const { enqueueSnackbar } = useSnackbar();

  const { api } = useApi();
  
  const fetchProducts = () => api.get(
    `/mostrar_proyectos?page=${pagination.page}&limit=${pagination.limit}`,
  ).then((respon) => {
    setTotalCount(respon.data.count || 0);
    setProjects(respon.data.request_list || []);
  }).catch((error) => {
    if (error.response) {
      enqueueSnackbar(error.response.data.message, { variant: 'error'})
    } else {
      enqueueSnackbar(error.message, { variant: 'error'})
    }
  });

  useEffect(() => {
    fetchProducts()
  }, [pagination])

  const handleChangePage = (_, page) => {
    // MUI Pagination es 1-indexed, convertir a 0-indexed para el backend
    const pageIndex = page - 1;
    setPagination((prevPagination) => ({
      ...prevPagination,
      skip: pageIndex * prevPagination.limit,
      page: pageIndex
    }));
  };

  return (
    <Box py={4}>
      <H3 mb={2}>Lista de Proyectos</H3>
      <Card>
        <Scrollbar autoHide={false}>
          <TableContainer
            sx={{
              minWidth: 900,
            }}
          >
            <Table>
              <TableHeader
                hideSelectBtn
                heading={tableHeading}
                rowCount={projects.length}                
              />

              <TableBody>
                {projects.map((product, index) => (
                  <ProductRow product={product} key={index} fetchProducts={fetchProducts}/>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <Stack alignItems="center" my={4}>
          <TablePagination
              onChange={handleChangePage}
              page={pagination.page + 1}  // MUI Pagination es 1-indexed
              count={Math.ceil(totalCount / pagination.limit) || 1}  // Total de páginas, no items
            />
        </Stack>
      </Card>
    </Box>
  );
}
