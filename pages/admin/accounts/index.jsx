import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  Stack,
  Table,
  TableContainer,
  TableBody,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Typography,
  Alert,
} from "@mui/material";
import { Refresh } from "@mui/icons-material";
import VendorDashboardLayout from "components/layouts/vendor-dashboard";
import Scrollbar from "components/Scrollbar";
import { H3 } from "components/Typography";
import { FlexBox } from "components/flex-box";
import TableHeader from "components/data-table/TableHeader";
import TablePagination from "components/data-table/TablePagination";
import SearchArea from "components/dashboard/SearchArea";
import AccountRow from "pages-sections/admin/accounts/AccountRow";
import AccountFormModal from "pages-sections/admin/accounts/AccountFormModal";
import AccountDetailModal from "pages-sections/admin/accounts/AccountDetailModal";
import accountsService from "utils/__api__/accounts";
import { useSnackbar } from "notistack";
import { debounce } from "lodash";

// TABLE HEADING DATA LIST
const tableHeading = [
  {
    id: "code",
    label: "Código",
    align: "left",
  },
  {
    id: "name",
    label: "Nombre",
    align: "left",
  },
  {
    id: "description",
    label: "Descripción",
    align: "left",
  },
  {
    id: "active",
    label: "Estado",
    align: "center",
  },
  {
    id: "action",
    label: "Acciones",
    align: "center",
  },
];

// =============================================================================
AccountsList.getLayout = function getLayout(page) {
  return <VendorDashboardLayout>{page}</VendorDashboardLayout>;
};
// =============================================================================

export default function AccountsList() {
  const { enqueueSnackbar } = useSnackbar();

  // Estados
  const [accounts, setAccounts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [filters, setFilters] = useState({
    code: "",
    name: "",
    active: "",
  });

  // Modales
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // Cargar cuentas
  const loadAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      // Agregar filtros si existen
      if (filters.code) params.code = filters.code;
      if (filters.name) params.name = filters.name;
      if (filters.active !== "") params.active = filters.active;

      const response = await accountsService.getAccounts(params);
      setAccounts(response.data || []);
      setPagination(response.pagination || pagination);
    } catch (err) {
      setError(err.message || "Error al cargar cuentas");
      enqueueSnackbar(err.message || "Error al cargar cuentas", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters, enqueueSnackbar]);

  // Cargar al montar y cuando cambien los filtros
  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  // Debounce para búsquedas
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((field, value) => {
      setFilters((prev) => ({ ...prev, [field]: value }));
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 300),
    []
  );

  // Handlers de filtros
  const handleFilterChange = (field, value) => {
    if (field === "active") {
      setFilters((prev) => ({ ...prev, [field]: value }));
      setPagination((prev) => ({ ...prev, page: 1 }));
    } else {
      debouncedSearch(field, value);
    }
  };

  const handleClearFilters = () => {
    setFilters({ code: "", name: "", active: "" });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Handlers de acciones
  const handleView = (account) => {
    setSelectedAccount(account);
    setDetailModalOpen(true);
  };

  const handleEdit = (account) => {
    setSelectedAccount(account);
    setFormModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedAccount(null);
    setFormModalOpen(true);
  };

  const handleToggleStatus = async (id, newStatus) => {
    try {
      if (newStatus) {
        await accountsService.activateAccount(id);
        enqueueSnackbar("✓ Cuenta activada", { variant: "success" });
      } else {
        await accountsService.deactivateAccount(id);
        enqueueSnackbar("✓ Cuenta desactivada", { variant: "success" });
      }
      loadAccounts();
    } catch (error) {
      enqueueSnackbar(error.message || "Error al cambiar estado", {
        variant: "error",
      });
      throw error;
    }
  };

  const handleSuccess = () => {
    loadAccounts();
  };

  // Paginación
  const handleChangePage = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleChangeRowsPerPage = (newLimit) => {
    setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
  };

  // Empty state
  const showEmptyState =
    !loading && !error && accounts.length === 0 && !filters.code && !filters.name;
  const showNoResults =
    !loading &&
    !error &&
    accounts.length === 0 &&
    (filters.code || filters.name || filters.active !== "");

  return (
    <Box py={4}>
      <H3 mb={2}>Catálogo de Cuentas Contables</H3>

      {/* Barra de búsqueda principal */}
      <SearchArea
        buttonText="Nueva Cuenta"
        searchPlaceholder="Buscar cuentas..."
        handleBtnClick={handleCreate}
      />

      {/* Filtros avanzados */}
      <Card sx={{ mb: 2, p: 2 }}>
        <FlexBox gap={2} flexWrap="wrap" alignItems="center">
          <TextField
            size="small"
            label="Buscar por código"
            placeholder="Ej: 1.1"
            sx={{ flex: 1, minWidth: 200 }}
            defaultValue={filters.code}
            onChange={(e) => handleFilterChange("code", e.target.value)}
          />

          <TextField
            size="small"
            label="Buscar por nombre"
            placeholder="Ej: Caja"
            sx={{ flex: 1, minWidth: 200 }}
            defaultValue={filters.name}
            onChange={(e) => handleFilterChange("name", e.target.value)}
          />

          <TextField
            select
            size="small"
            label="Estado"
            value={filters.active}
            onChange={(e) => handleFilterChange("active", e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="true">Activos</MenuItem>
            <MenuItem value="false">Inactivos</MenuItem>
          </TextField>

          <Button
            variant="outlined"
            color="secondary"
            onClick={handleClearFilters}
          >
            Limpiar Filtros
          </Button>

          <Button
            variant="outlined"
            color="primary"
            startIcon={<Refresh />}
            onClick={loadAccounts}
          >
            Actualizar
          </Button>
        </FlexBox>
      </Card>

      {/* Error state */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={loadAccounts}>
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Tabla */}
      <Card>
        <Scrollbar>
          <TableContainer sx={{ minWidth: 900 }}>
            <Table>
              <TableHeader heading={tableHeading} hideSelectBtn />

              <TableBody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: 40 }}>
                      <CircularProgress />
                    </td>
                  </tr>
                ) : showEmptyState ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: 40 }}>
                      <Typography variant="h6" color="text.secondary" mb={1}>
                        No hay cuentas registradas
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        Comienza creando tu primera cuenta contable
                      </Typography>
                      <Button variant="contained" onClick={handleCreate}>
                        + Crear Primera Cuenta
                      </Button>
                    </td>
                  </tr>
                ) : showNoResults ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: 40 }}>
                      <Typography variant="h6" color="text.secondary" mb={1}>
                        No se encontraron cuentas
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        Intenta ajustar los filtros de búsqueda
                      </Typography>
                      <Button variant="outlined" onClick={handleClearFilters}>
                        Limpiar Filtros
                      </Button>
                    </td>
                  </tr>
                ) : (
                  accounts.map((account) => (
                    <AccountRow
                      key={account._id}
                      account={account}
                      onView={handleView}
                      onEdit={handleEdit}
                      onToggleStatus={handleToggleStatus}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        {/* Paginación */}
        {!loading && accounts.length > 0 && (
          <Stack alignItems="center" my={4}>
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Mostrando{" "}
                {(pagination.page - 1) * pagination.limit + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)} de{" "}
                {pagination.total} cuentas
              </Typography>
            </Box>

            <FlexBox gap={2} alignItems="center">
              <TextField
                select
                size="small"
                value={pagination.limit}
                onChange={(e) => handleChangeRowsPerPage(Number(e.target.value))}
                sx={{ minWidth: 100 }}
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </TextField>

              <TablePagination
                onChange={handleChangePage}
                count={pagination.pages}
              />
            </FlexBox>
          </Stack>
        )}
      </Card>

      {/* Modales */}
      <AccountFormModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        account={selectedAccount}
        onSuccess={handleSuccess}
      />

      <AccountDetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        account={selectedAccount}
        onEdit={handleEdit}
        onToggleStatus={handleToggleStatus}
      />
    </Box>
  );
}


