import { useState, useEffect } from 'react';
import { Box, Card, Table, TableContainer, TableBody, Stack, Button } from "@mui/material";
import { useRouter } from "next/router";
import TableHeader from "components/data-table/TableHeader";
import TablePagination from "components/data-table/TablePagination";
import Scrollbar from "components/Scrollbar";
import { H3, Paragraph } from "components/Typography";
import { ProductRow } from "pages-sections/admin";
import { useApi } from 'contexts/AxiosContext';
import { useSnackbar } from 'notistack';

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

const DepartmentProjects = ({ departamentoId }) => {
  const [projects, setProjects] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState({
    skip: 0,
    page: 0,
    limit: 10
  });
  const router = useRouter();
  const { api } = useApi();
  const { enqueueSnackbar } = useSnackbar();

  const fetchProjects = () => {
    api.get(`/departamentos/${departamentoId}/proyectos?page=${pagination.page}&limit=${pagination.limit}`)
      .then((response) => {
        const proyectos = Array.isArray(response.data) 
          ? response.data 
          : (response.data.proyectos || response.data.request_list || []);
        
        setProjects(proyectos);
        setTotalCount(response.data.count || proyectos.length || 0);
      })
      .catch((error) => {
        if (error.response) {
          enqueueSnackbar(error.response.data.message || 'Error al cargar proyectos', { variant: 'error' });
        } else {
          enqueueSnackbar(error.message, { variant: 'error' });
        }
      });
  };

  useEffect(() => {
    if (departamentoId) {
      fetchProjects();
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
        <H3>Proyectos del Departamento</H3>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => router.push('/admin/products/create')}
        >
          Crear Nuevo Proyecto
        </Button>
      </Box>

      <Card>
        <Scrollbar autoHide={false}>
          <TableContainer sx={{ minWidth: 900 }}>
            <Table>
              <TableHeader
                hideSelectBtn
                heading={tableHeading}
                rowCount={projects.length}
              />
              <TableBody>
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                      <Paragraph color="grey.600">
                        No hay proyectos asociados a este departamento
                      </Paragraph>
                    </td>
                  </tr>
                ) : (
                  projects.map((product, index) => (
                    <ProductRow 
                      product={product} 
                      key={index} 
                      fetchProducts={fetchProjects}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        {projects.length > 0 && (
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

export default DepartmentProjects;

