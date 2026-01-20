import { useState, useEffect } from 'react';
import { Box, Card, Table, TableContainer, TableBody, Stack, Button } from "@mui/material";
import { useRouter } from "next/router";
import TableHeader from "components/data-table/TableHeader";
import TablePagination from "components/data-table/TablePagination";
import Scrollbar from "components/Scrollbar";
import { H3, Paragraph } from "components/Typography";
import { CustomerRow } from "pages-sections/admin";
import { useApi } from 'contexts/AxiosContext';
import { useSnackbar } from 'notistack';

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

const DepartmentUsers = ({ departamentoId }) => {
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState({
    skip: 0,
    page: 0,
    limit: 10
  });
  const router = useRouter();
  const { api } = useApi();
  const { enqueueSnackbar } = useSnackbar();

  const fetchUsers = () => {
    api.get(`/departamentos/${departamentoId}/usuarios?page=${pagination.page}&limit=${pagination.limit}`)
      .then((response) => {
        const usuarios = Array.isArray(response.data) 
          ? response.data 
          : (response.data.usuarios || response.data.request_list || []);
        
        setUsers(usuarios);
        setTotalCount(response.data.count || usuarios.length || 0);
      })
      .catch((error) => {
        if (error.response) {
          enqueueSnackbar(error.response.data.message || 'Error al cargar usuarios', { variant: 'error' });
        } else {
          enqueueSnackbar(error.message, { variant: 'error' });
        }
      });
  };

  useEffect(() => {
    if (departamentoId) {
      fetchUsers();
    }
  }, [departamentoId, pagination]);

  const handleChangePage = (_, page) => {
    const pageIndex = page - 1;
    setPagination((prevPagination) => ({
      ...prevPagination,
      skip: pageIndex * prevPagination.limit,
      page: pageIndex
    }));
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <H3>Usuarios del Departamento</H3>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => router.push('/admin/customers/create')}
        >
          Agregar Usuario
        </Button>
      </Box>

      <Card>
        <Scrollbar>
          <TableContainer sx={{ minWidth: 900 }}>
            <Table>
              <TableHeader
                hideSelectBtn
                heading={tableHeading}
              />
              <TableBody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '20px' }}>
                      <Paragraph color="grey.600">
                        No hay usuarios asignados a este departamento
                      </Paragraph>
                    </td>
                  </tr>
                ) : (
                  users.map((customer) => (
                    <CustomerRow 
                      customer={customer} 
                      key={customer._id?.$oid || customer._id} 
                      fetchUsers={fetchUsers} 
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        {users.length > 0 && (
          <Stack alignItems="center" my={4}>
            <TablePagination
              onChange={handleChangePage}
              page={pagination.page + 1}
              count={Math.ceil(totalCount / pagination.limit) || 1}
            />
          </Stack>
        )}
      </Card>
    </Box>
  );
};

export default DepartmentUsers;

