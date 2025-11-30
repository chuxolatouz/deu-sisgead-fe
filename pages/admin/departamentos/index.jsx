import { useEffect, useState } from 'react';
import { Box, Card, Stack, Table, TableContainer, Button } from "@mui/material";
import TableBody from "@mui/material/TableBody";
import { H3 } from "components/Typography";
import Scrollbar from "components/Scrollbar";
import TableHeader from "components/data-table/TableHeader";
import TablePagination from "components/data-table/TablePagination";
import VendorDashboardLayout from "components/layouts/vendor-dashboard";
import { useRouter } from "next/router";
import DepartamentoRow from "pages-sections/admin/departamentos/DepartamentoRow";
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
    id: "descripcion",
    label: "Descripción",
    align: "left",
  },
  {
    id: "activo",
    label: "Estado",
    align: "center",
  },
  {
    id: "fecha_creacion",
    label: "Fecha Creación",
    align: "left",
  },
  {
    id: "action",
    label: "Acción",
    align: "center",
  },
];

// =============================================================================
DepartamentosList.getLayout = function getLayout(page) {
  return <VendorDashboardLayout>{page}</VendorDashboardLayout>;
};
// =============================================================================

export default function DepartamentosList() {
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
  
  const fetchDepartamentos = () => {
    api.get(`/departamentos?page=${pagination.page}&limit=${pagination.limit}`)
      .then((response) => {
        setTotalCount(response.data.count || response.data.departamentos?.length || 0);
        setData(response.data.departamentos || response.data.request_list || []);
      })
      .catch((error) => {
        if (error.response) {
          enqueueSnackbar(error.response.data.message || 'Error al cargar departamentos', { variant: 'error' });
        } else {
          enqueueSnackbar(error.message, { variant: 'error' });
        }
      });
  };

  useEffect(() => {
    fetchDepartamentos();
  }, [pagination]);

  const handleChangePage = (_, page) => {
    setPagination((prevPagination) => ({
      ...prevPagination,
      skip: page * prevPagination.limit,
      page: page
    }));
  };

  const handleChangeRowsPerPage = (event) => {
    const newLimit = Number.parseInt(event.target.value, 10);
    setPagination((prevPagination) => ({
      ...prevPagination,
      skip: 0,
      page: 0,
      limit: newLimit
    }));
  };

  return (
    <Box py={4}>
      <H3 mb={2}>Departamentos</H3>
      <Button 
        variant="contained" 
        color="primary"  
        onClick={() => router.push('/admin/departamentos/create')}
        sx={{ mb: 2 }}
      >
        Agregar Departamento
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
                {data.map((departamento) => (
                  <DepartamentoRow 
                    departamento={departamento} 
                    key={departamento._id?.$oid || departamento._id} 
                    fetchDepartamentos={fetchDepartamentos} 
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <Stack alignItems="center" my={4}>
          <TablePagination
            onChange={handleChangePage}
            page={pagination.page}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPage={pagination.limit}
            count={totalCount || 0}
          />
        </Stack>
      </Card>
    </Box>
  );
}

