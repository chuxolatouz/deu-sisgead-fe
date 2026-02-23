import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useApi } from 'contexts/AxiosContext';
import { formatMonto, formatSafeDate } from 'lib';

const TYPE_LABELS = {
  true: 'Titular',
  false: 'Detalle',
};

const flattenTree = (nodes, depth = 0) => {
  const sorted = [...(nodes || [])].sort((a, b) => String(a.code || '').localeCompare(String(b.code || '')));
  const rows = [];
  sorted.forEach((node) => {
    rows.push({ ...node, __depth: depth });
    if (Array.isArray(node.children) && node.children.length > 0) {
      rows.push(...flattenTree(node.children, depth + 1));
    }
  });
  return rows;
};

const normalizeProjectId = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value.$oid) return value.$oid;
  return '';
};

export default function ProductAccounts({ projectId }) {
  const normalizedProjectId = normalizeProjectId(projectId);
  const [year, setYear] = useState(2025);
  const [showZeroAssigned, setShowZeroAssigned] = useState(false);
  const [tree, setTree] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { api } = useApi();
  const { enqueueSnackbar } = useSnackbar();

  const rows = useMemo(() => flattenTree(tree), [tree]);

  useEffect(() => {
    if (!normalizedProjectId) return;

    setLoading(true);
    setError('');

    const params = new URLSearchParams({
      year: String(year),
      assignedOnly: 'true',
      includeZero: showZeroAssigned ? 'true' : 'false',
    });

    api
      .get(`/api/projects/${normalizedProjectId}/accounts?${params.toString()}`)
      .then((response) => {
        setTree(response.data?.tree || []);
        setMeta(response.data?.meta || null);
      })
      .catch((err) => {
        const message = err?.response?.data?.message || err?.message || 'Error al cargar cuentas contables del proyecto';
        setError(message);
        enqueueSnackbar(message, { variant: 'error' });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [api, enqueueSnackbar, normalizedProjectId, showZeroAssigned, year]);

  return (
    <Box>
      <Stack spacing={2} mb={2}>
        <Alert severity="info" variant="outlined">
          Este detalle refleja saldo contable por cuenta del proyecto y puede diferir del saldo operativo mostrado en Detalles.
        </Alert>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }}>
          <TextField
            label="Año"
            type="number"
            size="small"
            value={year}
            onChange={(event) => setYear(Number(event.target.value || 2025))}
            sx={{ width: 120 }}
            inputProps={{ min: 2000, max: 2100 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={showZeroAssigned}
                onChange={(event) => setShowZeroAssigned(event.target.checked)}
                color="primary"
              />
            }
            label="Mostrar cuentas en 0 (asignadas)"
          />
        </Stack>

        {meta && (
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <Typography variant="body2" color="text.secondary">
              Cuentas asignadas: <strong>{meta.totalAssigned || 0}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cuentas visibles: <strong>{meta.totalVisible || 0}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Saldo visible: <strong>{formatMonto(meta.totalBalanceVisible || 0)}</strong>
            </Typography>
          </Stack>
        )}
      </Stack>

      {loading ? (
        <Paper sx={{ p: 2 }}>
          <Typography color="text.secondary">Cargando cuentas contables...</Typography>
        </Paper>
      ) : error ? (
        <Paper sx={{ p: 2 }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      ) : rows.length === 0 ? (
        <Paper sx={{ p: 2 }}>
          <Typography color="text.secondary">No hay cuentas contables asignadas para mostrar.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Código</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Grupo</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell align="right">Saldo</TableCell>
                <TableCell align="right">Movimientos</TableCell>
                <TableCell>Último movimiento</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={`${row.code}-${row.__depth}`}>
                  <TableCell>{row.code}</TableCell>
                  <TableCell>
                    <Box sx={{ pl: row.__depth * 2 }}>
                      {row.description}
                    </Box>
                  </TableCell>
                  <TableCell>{row.group || '-'}</TableCell>
                  <TableCell>{TYPE_LABELS[String(Boolean(row.is_header))] || 'Detalle'}</TableCell>
                  <TableCell align="right">{formatMonto(row.balance || 0)}</TableCell>
                  <TableCell align="right">{row.movementsCount || 0}</TableCell>
                  <TableCell>{row.lastMovementAt ? formatSafeDate(row.lastMovementAt) : '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
