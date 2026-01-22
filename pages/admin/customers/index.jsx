import { useEffect, useState } from 'react';
import { Box, Card, Stack, Table, TableContainer, Button } from "@mui/material";
import TableBody from "@mui/material/TableBody";
import { H3 } from "components/Typography";
import Scrollbar from "components/Scrollbar";
import TableHeader from "components/data-table/TableHeader";
import TablePagination from "components/data-table/TablePagination";
import VendorDashboardLayout from "components/layouts/vendor-dashboard";
import { useRouter } from "next/router";
import { CustomerRow } from "pages-sections/admin";
import { useApi } from 'contexts/AxiosContext';
import { useSnackbar } from 'notistack';

// table column list
const tableHeading = [
  {
    id: "nombre",
    label: "Nombre",
    align: "left",
  },
  {
    id: "email",
    label: "Email",
    align: "left",
  },
  {
    id: "action",
    label: "Acción",
    align: "center",
  },
];

// =============================================================================
CustomerList.getLayout = function getLayout(page) {
  return <VendorDashboardLayout>{page}</VendorDashboardLayout>;
};
// =============================================================================

// =============================================================================

export default function CustomerList() {
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState({
    skip: 0,
    page: 0,
    limit: 10
  });
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const { api } = useApi();
  const fetchUsers = () => api.get(
    `/mostrar_usuarios?page=${pagination.page}&limit=${pagination.limit}`,
  ).then((respon) => {
    setTotalCount(respon.data.count || 0);
    setData(respon.data.request_list || []);
  }).catch((error) => {
    if (error.response) {
      enqueueSnackbar(error.response.data.message, { variant: 'error'});
    } else {
      enqueueSnackbar(error.message, { variant: 'error'});
    }
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: pagination es la única dependencia necesaria
  useEffect(() => {
    fetchUsers();
  }, [pagination]);

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
      <H3 mb={2}>Usuarios</H3>
      <Button variant="outlined" color="success"  onClick={() => router.push('/admin/customers/create')}>
        Agregar Usuario
      </Button>
      <Card>
        <Scrollbar>
          <TableContainer
            sx={{
              minWidth: 900,
            }}
          >
            <Table>
              <TableHeader
                hideSelectBtn
                heading={tableHeading}
              />

              <TableBody>
                { data.map((customer) => (
                  <CustomerRow customer={customer} key={customer._id.$oid} fetchUsers={fetchUsers} />
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
