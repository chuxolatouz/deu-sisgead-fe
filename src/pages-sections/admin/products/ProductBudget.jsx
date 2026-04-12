import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Box,
  Paper,
  Stack,
} from '@mui/material';
import TablePagination from 'components/data-table/TablePagination';
import { useApi } from 'contexts/AxiosContext';
import { useSnackbar } from 'notistack';
import ActivityStatus from './activity/ActivityStatus';
import ActivityActions from './activity/ActivityActions';
import AddActivity from './actions/add/AddActivity';

function Documentos({ project, onActivitiesChange }) {
  const [count, setCount] = useState(0);
  const [documentos, setDocumentos] = useState([]);
  const [pagination, setPagination] = useState(1);
  const { api } = useApi();
  const { enqueueSnackbar } = useSnackbar();
  const fundingYear = Number(project?.fundingYear || new Date().getFullYear());

  const handlePagination = (_, value) => {
    setPagination(value);
  };

  const fetchActivities = useCallback(() => {
    api
      .get(`/proyecto/${project._id}/documentos?page=${pagination - 1}&limit=10`)
      .then((response) => {
        const nextRows = response.data.request_list || [];
        setDocumentos(nextRows);
        setCount(response.data.count || 1);
        onActivitiesChange?.(nextRows);
      }).catch((error) => {
        if (error.response) {
          enqueueSnackbar(error.response.data.message, { variant: 'error' })
        } else {
          enqueueSnackbar(error.message, { variant: 'error' })
        }
      })
  }, [api, project._id, pagination, enqueueSnackbar, onActivitiesChange]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    fetchActivities();
  }, [pagination]);

  return (
    <Box>
      <AddActivity project={project} onCreated={fetchActivities} />
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell>Descripción</TableCell>
              <TableCell>Archivos</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          {documentos.length ? (
            <TableBody>
              {documentos.map((action) => (
                <TableRow
                  key={`${action._id.$oid}-row`}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 }, height: '50px' }}
                >
                  <TableCell key={`${action._id.$oid}-descripcion`} component="th" scope="row">
                    {action.descripcion}
                  </TableCell>
                  <TableCell key={`${action._id.$oid}-archivos-length`}>{action.archivos?.length}</TableCell>
                  <TableCell key={`${action._id.$oid}-status`}>
                    <ActivityStatus
                      budget={action}
                      onComplete={fetchActivities}
                      year={fundingYear}
                    />
                  </TableCell>
                  <TableCell key={`${action._id.$oid}-archivos-dialog`}>
                    <ActivityActions budget={action} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          ) : (
            <TableBody>
              <TableRow>
                <TableCell>No hay actividades registradas</TableCell>
              </TableRow>
            </TableBody>
          )}
        </Table>
      </TableContainer>
      <Stack alignItems="center" my={4}>
        <TablePagination
          onChange={handlePagination}
          page={pagination}
          count={count || 1}
        />
      </Stack>
    </Box>
  );
}

export default Documentos;
