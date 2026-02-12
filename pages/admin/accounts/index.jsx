import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Stack,
  Table,
  TableContainer,
  TableBody,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem
} from '@mui/material';
import { H3 } from 'components/Typography';
import Scrollbar from 'components/Scrollbar';
import TableHeader from 'components/data-table/TableHeader';
import TablePagination from 'components/data-table/TablePagination';
import VendorDashboardLayout from 'components/layouts/vendor-dashboard';
import { useApi } from 'contexts/AxiosContext';
import { useSnackbar } from 'notistack';
import AccountRow from 'pages-sections/admin/accounts/AccountRow';

const tableHeading = [
  { id: 'code', label: 'Código', align: 'left' },
  { id: 'description', label: 'Descripción', align: 'left' },
  { id: 'group', label: 'Grupo', align: 'center' },
  { id: 'is_header', label: 'Tipo', align: 'center' },
  { id: 'level', label: 'Nivel', align: 'center' },
  { id: 'parent_code', label: 'Código Padre', align: 'left' },
  { id: 'balance', label: 'Saldo', align: 'left' },
  { id: 'action', label: 'Acción', align: 'center' }
];

const GROUPS = ['', 'PASIVO', 'INGRESO', 'EGRESO'];

AccountsPage.getLayout = function getLayout(page) {
  return <VendorDashboardLayout>{page}</VendorDashboardLayout>;
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState({ page: 0, limit: 20 });
  const [filters, setFilters] = useState({ year: 2025, q: '', group: '' });
  const [scope, setScope] = useState({ scopeType: 'department', scopeId: '' });
  const [openCreate, setOpenCreate] = useState(false);
  const [openTransfer, setOpenTransfer] = useState(false);
  const [createForm, setCreateForm] = useState({
    code: '',
    description: '',
    group: 'EGRESO',
    level: 1,
    parent_code: '',
    is_header: false,
    year: 2025
  });
  const [transferForm, setTransferForm] = useState({
    year: 2025,
    scopeType: 'department',
    scopeId: '',
    fromAccountCode: '',
    toAccountCode: '',
    amount: '',
    description: ''
  });

  const { api, user } = useApi();
  const { enqueueSnackbar } = useSnackbar();

  const fetchAccounts = () => {
    const params = new URLSearchParams({
      year: String(filters.year),
      page: String(pagination.page),
      limit: String(pagination.limit)
    });

    if (filters.q.trim()) params.append('q', filters.q.trim());
    if (filters.group) params.append('group', filters.group);
    if (scope.scopeType) params.append('scopeType', scope.scopeType);
    if (scope.scopeId.trim()) params.append('scopeId', scope.scopeId.trim());

    api.get(`/api/admin/accounts?${params.toString()}`)
      .then((response) => {
        setAccounts(response.data.request_list || []);
        setTotalCount(response.data.count || 0);
      })
      .catch((error) => {
        if (error.response) {
          enqueueSnackbar(error.response.data.message || 'Error al cargar cuentas', { variant: 'error' });
        } else {
          enqueueSnackbar(error.message, { variant: 'error' });
        }
      });
  };

  useEffect(() => {
    if (user?.role === 'super_admin') {
      fetchAccounts();
    }
  }, [pagination.page, pagination.limit, filters.year, filters.group, scope.scopeType, scope.scopeId]);

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 0 }));
    fetchAccounts();
  };

  const handleChangePage = (_, page) => {
    setPagination((prev) => ({ ...prev, page: page - 1 }));
  };

  const handleCreate = () => {
    if (!createForm.code || !createForm.description) {
      enqueueSnackbar('Código y descripción son obligatorios', { variant: 'error' });
      return;
    }

    const payload = {
      ...createForm,
      code: String(createForm.code).trim(),
      description: String(createForm.description).trim(),
      parent_code: String(createForm.parent_code || '').trim() || null,
      level: Number(createForm.level),
      year: Number(createForm.year)
    };

    api.post('/api/admin/accounts', payload)
      .then(() => {
        enqueueSnackbar('Cuenta creada', { variant: 'success' });
        setOpenCreate(false);
        setCreateForm({
          code: '',
          description: '',
          group: 'EGRESO',
          level: 1,
          parent_code: '',
          is_header: false,
          year: filters.year
        });
        fetchAccounts();
      })
      .catch((error) => {
        if (error.response) {
          enqueueSnackbar(error.response.data.message || 'Error al crear cuenta', { variant: 'error' });
        } else {
          enqueueSnackbar(error.message, { variant: 'error' });
        }
      });
  };

  const handleTransfer = () => {
    if (!transferForm.scopeId.trim()) {
      enqueueSnackbar('scopeId es obligatorio para transferir', { variant: 'error' });
      return;
    }
    if (!transferForm.fromAccountCode || !transferForm.toAccountCode || !transferForm.amount) {
      enqueueSnackbar('Completa cuenta origen, destino y monto', { variant: 'error' });
      return;
    }

    const payload = {
      year: Number(transferForm.year),
      scopeType: transferForm.scopeType,
      scopeId: transferForm.scopeId.trim(),
      fromAccountCode: transferForm.fromAccountCode.trim(),
      toAccountCode: transferForm.toAccountCode.trim(),
      amount: Number(transferForm.amount),
      description: transferForm.description || ''
    };

    api.post('/api/admin/accounts/transfer', payload)
      .then(() => {
        enqueueSnackbar('Transferencia registrada', { variant: 'success' });
        setOpenTransfer(false);
        setTransferForm((prev) => ({
          ...prev,
          fromAccountCode: '',
          toAccountCode: '',
          amount: '',
          description: ''
        }));
        fetchAccounts();
      })
      .catch((error) => {
        if (error.response) {
          enqueueSnackbar(error.response.data.message || 'Error al transferir', { variant: 'error' });
        } else {
          enqueueSnackbar(error.message, { variant: 'error' });
        }
      });
  };

  if (user?.role !== 'super_admin') {
    return (
      <Box py={4}>
        <H3 mb={2}>Cuentas Contables</H3>
        <Card sx={{ p: 3 }}>No tienes permisos para administrar el catálogo contable.</Card>
      </Box>
    );
  }

  return (
    <Box py={4}>
      <H3 mb={2}>Cuentas Contables 2025</H3>

      <Card sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="Año"
            type="number"
            value={filters.year}
            onChange={(event) => setFilters((prev) => ({ ...prev, year: Number(event.target.value || 2025) }))}
            sx={{ minWidth: 130 }}
          />
          <TextField
            label="Grupo"
            select
            value={filters.group}
            onChange={(event) => setFilters((prev) => ({ ...prev, group: event.target.value }))}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">Todos</MenuItem>
            {GROUPS.filter(Boolean).map((group) => (
              <MenuItem key={group} value={group}>{group}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Buscar por código o descripción"
            value={filters.q}
            onChange={(event) => setFilters((prev) => ({ ...prev, q: event.target.value }))}
            fullWidth
          />
          <TextField
            label="Scope Type"
            select
            value={scope.scopeType}
            onChange={(event) => setScope((prev) => ({ ...prev, scopeType: event.target.value }))}
            sx={{ minWidth: 170 }}
          >
            <MenuItem value="department">department</MenuItem>
            <MenuItem value="project">project</MenuItem>
          </TextField>
          <TextField
            label="Scope ID"
            value={scope.scopeId}
            onChange={(event) => setScope((prev) => ({ ...prev, scopeId: event.target.value }))}
            sx={{ minWidth: 230 }}
          />
          <Button variant="outlined" onClick={handleSearch}>Buscar</Button>
          <Button variant="outlined" color="secondary" onClick={() => {
            setTransferForm((prev) => ({ ...prev, year: filters.year, scopeType: scope.scopeType, scopeId: scope.scopeId }));
            setOpenTransfer(true);
          }}>Transferir</Button>
          <Button variant="contained" onClick={() => setOpenCreate(true)}>Nueva Cuenta</Button>
        </Stack>
      </Card>

      <Card>
        <Scrollbar>
          <TableContainer sx={{ minWidth: 1050 }}>
            <Table>
              <TableHeader hideSelectBtn heading={tableHeading} />
              <TableBody>
                {accounts.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>
                      No hay cuentas para mostrar
                    </td>
                  </tr>
                ) : (
                  accounts.map((account) => (
                    <AccountRow
                      key={`${account.year}-${account.code}`}
                      account={account}
                      year={filters.year}
                      onRefresh={fetchAccounts}
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

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField label="Año" type="number" value={createForm.year} onChange={(event) => setCreateForm((prev) => ({ ...prev, year: Number(event.target.value || 2025) }))} />
            <TextField label="Código (12 dígitos)" value={createForm.code} onChange={(event) => setCreateForm((prev) => ({ ...prev, code: event.target.value }))} required />
            <TextField label="Descripción" value={createForm.description} onChange={(event) => setCreateForm((prev) => ({ ...prev, description: event.target.value }))} required />
            <TextField label="Grupo" select value={createForm.group} onChange={(event) => setCreateForm((prev) => ({ ...prev, group: event.target.value }))}>
              {GROUPS.filter(Boolean).map((group) => (
                <MenuItem key={group} value={group}>{group}</MenuItem>
              ))}
            </TextField>
            <TextField label="Nivel" type="number" value={createForm.level} onChange={(event) => setCreateForm((prev) => ({ ...prev, level: Number(event.target.value || 1) }))} />
            <TextField label="Código Padre" value={createForm.parent_code} onChange={(event) => setCreateForm((prev) => ({ ...prev, parent_code: event.target.value }))} placeholder="Opcional" />
            <TextField
              label="Tipo"
              select
              value={createForm.is_header ? 'header' : 'detail'}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, is_header: event.target.value === 'header' }))}
            >
              <MenuItem value="header">Titular</MenuItem>
              <MenuItem value="detail">Detalle</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpenCreate(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreate}>Crear</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openTransfer} onClose={() => setOpenTransfer(false)} maxWidth="sm" fullWidth>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField label="Año" type="number" value={transferForm.year} onChange={(event) => setTransferForm((prev) => ({ ...prev, year: Number(event.target.value || 2025) }))} />
            <TextField
              label="Scope Type"
              select
              value={transferForm.scopeType}
              onChange={(event) => setTransferForm((prev) => ({ ...prev, scopeType: event.target.value }))}
            >
              <MenuItem value="department">department</MenuItem>
              <MenuItem value="project">project</MenuItem>
            </TextField>
            <TextField label="Scope ID" value={transferForm.scopeId} onChange={(event) => setTransferForm((prev) => ({ ...prev, scopeId: event.target.value }))} required />
            <TextField label="Cuenta origen (12 dígitos)" value={transferForm.fromAccountCode} onChange={(event) => setTransferForm((prev) => ({ ...prev, fromAccountCode: event.target.value }))} required />
            <TextField label="Cuenta destino (12 dígitos)" value={transferForm.toAccountCode} onChange={(event) => setTransferForm((prev) => ({ ...prev, toAccountCode: event.target.value }))} required />
            <TextField label="Monto" type="number" value={transferForm.amount} onChange={(event) => setTransferForm((prev) => ({ ...prev, amount: event.target.value }))} required />
            <TextField label="Descripción" value={transferForm.description} onChange={(event) => setTransferForm((prev) => ({ ...prev, description: event.target.value }))} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpenTransfer(false)}>Cancelar</Button>
          <Button variant="contained" color="secondary" onClick={handleTransfer}>Transferir</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
