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
        const departamentos = Array.isArray(response.data) 
          ? response.data 
          : (response.data.departamentos || response.data.request_list || []);
        
        setData(departamentos);
        setTotalCount(response.data.count || departamentos.length || 0);
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
    // MUI Pagination usa páginas desde 1, pero nuestra API usa desde 0
    const pageIndex = page - 1;
    setPagination((prevPagination) => ({
      ...prevPagination,
      skip: pageIndex * prevPagination.limit,
      page: pageIndex
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
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>
                      No hay departamentos para mostrar
                    </td>
                  </tr>
                ) : (
                  data.map((departamento) => (
                    <DepartamentoRow 
                      departamento={departamento} 
                      key={departamento._id?.$oid || departamento._id} 
                      fetchDepartamentos={fetchDepartamentos} 
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <Stack alignItems="center" my={4}>
          <TablePagination
            onChange={handleChangePage}
            page={pagination.page + 1}
            count={Math.ceil(totalCount / pagination.limit) || 1}
          />
        </Stack>
      </Card>
    </Box>
  );
}

