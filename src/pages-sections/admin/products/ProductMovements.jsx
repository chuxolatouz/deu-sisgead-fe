import { useEffect, useState } from 'react';
import {
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Stack,
  Box,
  Paper
} from '@mui/material';
import TablePagination from 'components/data-table/TablePagination';
import AddBalance from './actions/add/AddBalance';
import DescargarMovimientos from './actions/download/DownloadMovements';
import { useApi } from 'contexts/AxiosContext';
import { useSnackbar } from 'notistack';

function Movimientos({ id }) {
  const [pagination, setPagination] = useState(1);
  const [actions, setActions] = useState([]);
  const [count, setCount] = useState(0);
  const { api } = useApi();
  const { enqueueSnackbar } = useSnackbar();

  const handlePagination = (_, value) => {
    setPagination(value);
  };
  const fixMonto = (monto) => {
    if (Number.parseFloat(monto) > 0) {
      return <span style={{ color: '#11cb5f', fontStyle: 'bold' }}>{monto}</span>;
    }
    return <span style={{ color: '#d32f2f', fontStyle: 'bold' }}>{monto}</span>;
  };

  const fetchBalance = () => api
  .get(`/proyecto/${id}/acciones?page=${pagination - 1}&limit=10`)
  .then((response) => {
    setActions(response.data.request_list || []);
    setCount(response.data.count || 1);
  })
  .catch((error) => {
    if (error.response) {
        enqueueSnackbar(error.response.data.message, { variant: 'error'})
    } else {
        enqueueSnackbar(error.message, { variant: 'error'})
    }
})

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    fetchBalance();
  }, [pagination]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <AddBalance id={id} fetchBalance={fetchBalance} />
        <DescargarMovimientos id={id} />
      </Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell>-</TableCell>
              <TableCell>Persona</TableCell>
              <TableCell>Monto</TableCell>
              <TableCell>Saldo</TableCell>
            </TableRow>
          </TableHead>
          {actions.length ? (
            <TableBody>
              { actions.map((action) => (
                <TableRow
                  key={action._id.$oid}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 }, height: '50px' }}
                >
                  <TableCell component="th" scope="row">
                    {action.type}
                  </TableCell>
                  <TableCell>{action.user}</TableCell>
                  <TableCell>{fixMonto(action.amount)}</TableCell>
                  <TableCell>{action.total_amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          ) : (
            <TableBody>
              <TableRow>
                <TableCell> No hay movimientos</TableCell>
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

export default Movimientos;
