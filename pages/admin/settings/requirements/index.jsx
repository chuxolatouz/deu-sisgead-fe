import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Add, Delete, Edit, Restore } from "@mui/icons-material";
import VendorDashboardLayout from "components/layouts/vendor-dashboard";
import AccountSelector from "components/accounting/AccountSelector";
import { H3 } from "components/Typography";
import { useApi } from "contexts/AxiosContext";
import { useSnackbar } from "notistack";

const currentYear = new Date().getFullYear();
const emptyForm = {
  nombre: "",
  descripcion: "",
  accountCode: null,
  account: null,
  accountReferenceYear: currentYear,
};

RequirementsPage.getLayout = function getLayout(page) {
  return <VendorDashboardLayout>{page}</VendorDashboardLayout>;
};

export default function RequirementsPage() {
  const { api, user } = useApi();
  const { enqueueSnackbar } = useSnackbar();
  const [requirements, setRequirements] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadRequirements = async (text = search) => {
    setLoading(true);
    const params = new URLSearchParams({
      includeInactive: "true",
      includeDeleted: "true",
      includeStats: "true",
    });
    if (text.trim()) params.set("text", text.trim());
    try {
      const response = await api.get(`/requerimientos?${params.toString()}`);
      setRequirements(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      enqueueSnackbar(
        error?.response?.data?.message || "Error al cargar requerimientos",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequirements("");
    // biome-ignore lint/correctness/useExhaustiveDependencies: carga inicial
  }, []);

  const visibleRows = useMemo(() => {
    const start = page * rowsPerPage;
    return requirements.slice(start, start + rowsPerPage);
  }, [requirements, page, rowsPerPage]);

  const openCreate = () => {
    setEditingId("");
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (requirement) => {
    setEditingId(requirement._id);
    setForm({
      nombre: requirement.nombre || "",
      descripcion: requirement.descripcion || "",
      accountCode: requirement.accountCode || null,
      account: requirement.account || null,
      accountReferenceYear: requirement.accountReferenceYear || currentYear,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId("");
    setForm(emptyForm);
  };

  const saveRequirement = async () => {
    if (!form.nombre.trim() || !form.accountCode) {
      enqueueSnackbar("El nombre y la cuenta contable son obligatorios", {
        variant: "error",
      });
      return;
    }
    setSaving(true);
    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      accountCode: form.accountCode,
      accountReferenceYear: Number(form.accountReferenceYear),
    };
    try {
      if (editingId) {
        await api.put(`/requerimientos/${editingId}`, payload);
      } else {
        await api.post("/requerimientos", payload);
      }
      enqueueSnackbar(
        editingId
          ? "Requerimiento actualizado con éxito"
          : "Requerimiento creado con éxito",
        { variant: "success" }
      );
      closeDialog();
      await loadRequirements();
    } catch (error) {
      enqueueSnackbar(
        error?.response?.data?.message || "Error al guardar el requerimiento",
        { variant: "error" }
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (requirement, activo) => {
    try {
      await api.patch(`/requerimientos/${requirement._id}/estado`, { activo });
      await loadRequirements();
    } catch (error) {
      enqueueSnackbar(
        error?.response?.data?.message || "Error al actualizar el estado",
        { variant: "error" }
      );
    }
  };

  const deleteRequirement = async () => {
    if (!deleteTarget?._id) return;
    try {
      await api.delete(`/requerimientos/${deleteTarget._id}`);
      setDeleteTarget(null);
      await loadRequirements();
    } catch (error) {
      enqueueSnackbar(
        error?.response?.data?.message || "Error al eliminar el requerimiento",
        { variant: "error" }
      );
    }
  };

  const restoreRequirement = async (requirement) => {
    try {
      await api.post(`/requerimientos/${requirement._id}/restaurar`);
      await loadRequirements();
    } catch (error) {
      enqueueSnackbar(
        error?.response?.data?.message || "Error al restaurar el requerimiento",
        { variant: "error" }
      );
    }
  };

  if (user?.role !== "super_admin") {
    return (
      <Box py={4}>
        <H3 mb={2}>Catálogo de requerimientos</H3>
        <Alert severity="warning">
          Solo un super administrador puede gestionar este catálogo.
        </Alert>
      </Box>
    );
  }

  return (
    <Box py={4}>
      <H3 mb={2}>Catálogo de requerimientos</H3>
      <Card sx={{ p: 2, mb: 2 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ md: "center" }}
        >
          <TextField
            label="Buscar por nombre, descripción o cuenta"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && loadRequirements()}
            sx={{ flex: 1, minWidth: 280 }}
          />
          <Button variant="outlined" onClick={() => loadRequirements()}>
            Buscar
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
            Nuevo requerimiento
          </Button>
        </Stack>
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Requerimiento</TableCell>
                <TableCell>Cuenta contable</TableCell>
                <TableCell>Tipo / nivel</TableCell>
                <TableCell>Uso</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleRows.map((requirement) => (
                <TableRow key={requirement._id}>
                  <TableCell>
                    <Typography fontWeight={700}>
                      {requirement.nombre}
                    </Typography>
                    {requirement.descripcion && (
                      <Typography variant="caption" color="text.secondary">
                        {requirement.descripcion}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={700}>
                      {requirement.accountCode}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {requirement.account?.description || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Chip
                        size="small"
                        variant="outlined"
                        color={
                          requirement.account?.isHeader ? "warning" : "success"
                        }
                        label={
                          requirement.account?.isHeader ? "Titular" : "Detalle"
                        }
                      />
                      <Chip
                        size="small"
                        label={`Nivel ${requirement.account?.level || "-"}`}
                      />
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {`${requirement.projectCount || 0} proyectos · ${
                      requirement.activityCount || 0
                    } actividades`}
                  </TableCell>
                  <TableCell>
                    {requirement.eliminado ? (
                      <Chip size="small" label="Eliminado" />
                    ) : (
                      <Switch
                        checked={Boolean(requirement.activo)}
                        onChange={(event) =>
                          toggleStatus(requirement, event.target.checked)
                        }
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="flex-end"
                    >
                      <Button
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => openEdit(requirement)}
                      >
                        Editar
                      </Button>
                      {requirement.eliminado ? (
                        <Button
                          size="small"
                          color="success"
                          startIcon={<Restore />}
                          onClick={() => restoreRequirement(requirement)}
                        >
                          Restaurar
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          color="error"
                          startIcon={<Delete />}
                          onClick={() => setDeleteTarget(requirement)}
                        >
                          Eliminar
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {!visibleRows.length && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    {loading ? "Cargando..." : "No hay requerimientos"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={requirements.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(Number(event.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 20, 50]}
          labelRowsPerPage="Filas por página"
        />
      </Card>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
        <DialogTitle>
          {editingId ? "Editar requerimiento" : "Crear requerimiento"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} pt={1}>
            <TextField
              label="Nombre"
              required
              value={form.nombre}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  nombre: event.target.value,
                }))
              }
            />
            <TextField
              label="Descripción"
              multiline
              minRows={2}
              value={form.descripcion}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  descripcion: event.target.value,
                }))
              }
            />
            <TextField
              label="Año de referencia contable"
              type="number"
              value={form.accountReferenceYear}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  accountReferenceYear: Number(event.target.value),
                  accountCode: null,
                  account: null,
                }))
              }
            />
            <AccountSelector
              label="Cuenta contable asociada"
              value={form.accountCode}
              year={form.accountReferenceYear}
              group="EGRESO"
              allowHeaders
              required
              helperText="Puede ser titular o detalle. En actividades, una titular exigirá seleccionar una cuenta detalle descendiente."
              onChange={(accountCode, account) =>
                setForm((current) => ({ ...current, accountCode, account }))
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={saveRequirement}
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Eliminar requerimiento</DialogTitle>
        <DialogContent>
          <Typography>
            {`Se eliminará “${
              deleteTarget?.nombre || ""
            }” del catálogo. Las asociaciones existentes conservarán sus datos históricos.`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={deleteRequirement}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
