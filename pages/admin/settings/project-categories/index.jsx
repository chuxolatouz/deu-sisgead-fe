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
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TablePagination,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Add, Delete, Edit, Restore } from "@mui/icons-material";
import VendorDashboardLayout from "components/layouts/vendor-dashboard";
import { H3 } from "components/Typography";
import { useApi } from "contexts/AxiosContext";
import { useSnackbar } from "notistack";

const STATUS_FILTERS = [
  { value: "all", label: "Todas" },
  { value: "active", label: "Activas" },
  { value: "inactive", label: "Deshabilitadas" },
  { value: "deleted", label: "Eliminadas" },
];

const DEFAULT_FORM_STATE = {
  nombre: "",
  color: "",
};

const normalizeColor = (value) => {
  if (!value) return "";
  return String(value).trim().replace(/^#/, "").toUpperCase();
};

const isHexColor = (value) => /^[0-9A-F]{6}$/.test(normalizeColor(value));

ProjectCategoriesPage.getLayout = function getLayout(page) {
  return <VendorDashboardLayout>{page}</VendorDashboardLayout>;
};

export default function ProjectCategoriesPage() {
  const { api, user } = useApi();
  const { enqueueSnackbar } = useSnackbar();
  const [categories, setCategories] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formState, setFormState] = useState(DEFAULT_FORM_STATE);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchCategories = async (text = searchText) => {
    setLoading(true);
    const params = new URLSearchParams({
      includeInactive: "true",
      includeDeleted: "true",
      includeStats: "true",
    });
    if (text.trim()) {
      params.append("text", text.trim());
    }
    try {
      const response = await api.get(`/mostrar_categorias?${params.toString()}`);
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      if (error.response) {
        enqueueSnackbar(error.response.data.message || "Error al cargar categorías", { variant: "error" });
      } else {
        enqueueSnackbar(error.message, { variant: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories("");
    // biome-ignore lint/correctness/useExhaustiveDependencies: solo al montar
  }, []);

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      if (statusFilter === "active") return category.activo && !category.eliminado;
      if (statusFilter === "inactive") return !category.activo && !category.eliminado;
      if (statusFilter === "deleted") return category.eliminado;
      return true;
    });
  }, [categories, statusFilter]);

  useEffect(() => {
    setPage(0);
  }, [statusFilter, categories.length]);

  const paginatedCategories = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredCategories.slice(start, end);
  }, [filteredCategories, page, rowsPerPage]);

  const openCreateDialog = () => {
    setFormMode("create");
    setFormCategoryId("");
    setFormState(DEFAULT_FORM_STATE);
    setOpenFormDialog(true);
  };

  const openEditDialog = (category) => {
    setFormMode("edit");
    setFormCategoryId(category._id);
    setFormState({
      nombre: category.nombre || "",
      color: category.color || "",
    });
    setOpenFormDialog(true);
  };

  const closeFormDialog = () => {
    setOpenFormDialog(false);
    setFormCategoryId("");
    setFormState(DEFAULT_FORM_STATE);
  };

  const submitForm = async () => {
    if (!formState.nombre.trim()) {
      enqueueSnackbar("El nombre es obligatorio", { variant: "error" });
      return;
    }
    if (formState.color && !isHexColor(formState.color)) {
      enqueueSnackbar("El color debe estar en formato hexadecimal de 6 caracteres", { variant: "error" });
      return;
    }

    const payload = {
      nombre: formState.nombre.trim(),
    };
    if (formState.color) {
      payload.color = normalizeColor(formState.color);
    }

    try {
      if (formMode === "create") {
        await api.post("/categorias", payload);
        enqueueSnackbar("Categoría creada con éxito", { variant: "success" });
        setSearchText("");
        setStatusFilter("all");
      } else {
        await api.put(`/categorias/${formCategoryId}`, payload);
        enqueueSnackbar("Categoría actualizada con éxito", { variant: "success" });
      }
      closeFormDialog();
      setPage(0);
      await fetchCategories(formMode === "create" ? "" : searchText);
    } catch (error) {
      if (error.response) {
        enqueueSnackbar(error.response.data.message || "Error al guardar categoría", { variant: "error" });
      } else {
        enqueueSnackbar(error.message, { variant: "error" });
      }
    }
  };

  const toggleCategoryStatus = async (category, nextStatus) => {
    try {
      await api.patch(`/categorias/${category._id}/estado`, { activo: nextStatus });
      enqueueSnackbar("Estado actualizado con éxito", { variant: "success" });
      await fetchCategories();
    } catch (error) {
      if (error.response) {
        enqueueSnackbar(error.response.data.message || "Error al actualizar estado", { variant: "error" });
      } else {
        enqueueSnackbar(error.message, { variant: "error" });
      }
    }
  };

  const deleteCategory = async () => {
    if (!deleteTarget?._id) return;
    try {
      await api.delete(`/categorias/${deleteTarget._id}`);
      enqueueSnackbar("Categoría eliminada con éxito", { variant: "success" });
      setDeleteTarget(null);
      await fetchCategories();
    } catch (error) {
      if (error.response) {
        enqueueSnackbar(error.response.data.message || "Error al eliminar categoría", { variant: "error" });
      } else {
        enqueueSnackbar(error.message, { variant: "error" });
      }
    }
  };

  const restoreCategory = async (categoryId) => {
    try {
      await api.post(`/categorias/${categoryId}/restaurar`);
      enqueueSnackbar("Categoría restaurada con éxito", { variant: "success" });
      await fetchCategories();
    } catch (error) {
      if (error.response) {
        enqueueSnackbar(error.response.data.message || "Error al restaurar categoría", { variant: "error" });
      } else {
        enqueueSnackbar(error.message, { variant: "error" });
      }
    }
  };

  if (user?.role !== "super_admin") {
    return (
      <Box py={4}>
        <H3 mb={2}>Categorías de Proyecto</H3>
        <Card sx={{ p: 3 }}>
          <Alert severity="warning">No tienes permisos para administrar categorías globales de proyectos.</Alert>
        </Card>
      </Box>
    );
  }

  return (
    <Box py={4}>
      <H3 mb={2}>Categorías de Proyecto</H3>
      <Card sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
          <TextField
            label="Buscar"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                fetchCategories();
              }
            }}
            sx={{ minWidth: { xs: "100%", md: 320 } }}
          />
          <FormControl sx={{ minWidth: 220 }}>
            <InputLabel id="status-filter-label">Estado</InputLabel>
            <Select
              labelId="status-filter-label"
              label="Estado"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              {STATUS_FILTERS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={() => fetchCategories()}>
            Buscar
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={openCreateDialog}>
            Nueva categoría
          </Button>
        </Stack>
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Proyectos</TableCell>
                <TableCell align="center">Color</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCategories.map((category) => (
                <TableRow key={category._id}>
                  <TableCell>{category.nombre}</TableCell>
                  <TableCell>{category.value}</TableCell>
                  <TableCell>
                    {category.eliminado ? (
                      <Chip size="small" label="Eliminada" color="default" />
                    ) : category.activo ? (
                      <Chip size="small" label="Activa" color="success" />
                    ) : (
                      <Chip size="small" label="Deshabilitada" color="warning" />
                    )}
                  </TableCell>
                  <TableCell align="center">{category.projectCount || 0}</TableCell>
                  <TableCell align="center">
                    <Box display="inline-flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: "4px",
                          backgroundColor: `#${normalizeColor(category.color || "999999")}`,
                          border: "1px solid #ccc",
                        }}
                      />
                      <Typography variant="body2">{`#${normalizeColor(category.color || "999999")}`}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="Editar">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => openEditDialog(category)}
                          startIcon={<Edit />}
                        >
                          Editar
                        </Button>
                      </Tooltip>
                      {category.eliminado ? (
                        <Tooltip title="Restaurar">
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => restoreCategory(category._id)}
                            startIcon={<Restore />}
                          >
                            Restaurar
                          </Button>
                        </Tooltip>
                      ) : (
                        <>
                          <Tooltip title={category.activo ? "Deshabilitar" : "Habilitar"}>
                            <Switch
                              checked={Boolean(category.activo)}
                              onChange={(event) => toggleCategoryStatus(category, event.target.checked)}
                            />
                          </Tooltip>
                          <Tooltip title="Eliminar lógicamente">
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              onClick={() => setDeleteTarget(category)}
                              startIcon={<Delete />}
                            >
                              Eliminar
                            </Button>
                          </Tooltip>
                        </>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCategories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    {loading ? "Cargando..." : "No hay categorías para mostrar"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredCategories.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 20, 50]}
          labelRowsPerPage="Filas por página"
        />
      </Card>

      <Dialog open={openFormDialog} onClose={closeFormDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {formMode === "create" ? "Crear categoría de proyecto" : "Editar categoría de proyecto"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} pt={1}>
            <TextField
              label="Nombre"
              value={formState.nombre}
              onChange={(event) => setFormState((prev) => ({ ...prev, nombre: event.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Color (hex)"
              placeholder="FF5733"
              value={formState.color}
              onChange={(event) => setFormState((prev) => ({ ...prev, color: event.target.value }))}
              fullWidth
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
              <TextField
                label="Selector visual"
                type="color"
                value={`#${isHexColor(formState.color) ? normalizeColor(formState.color) : "1976D2"}`}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, color: normalizeColor(event.target.value) }))
                }
                InputLabelProps={{ shrink: true }}
                sx={{ width: 160 }}
              />
              <Box display="inline-flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 18,
                    height: 18,
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    backgroundColor: `#${isHexColor(formState.color) ? normalizeColor(formState.color) : "1976D2"}`,
                  }}
                />
                <Typography variant="body2">
                  {`#${isHexColor(formState.color) ? normalizeColor(formState.color) : "1976D2"}`}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeFormDialog}>Cancelar</Button>
          <Button variant="contained" onClick={submitForm}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} fullWidth maxWidth="sm">
        <DialogTitle>Eliminar categoría</DialogTitle>
        <DialogContent>
          <Typography>
            {deleteTarget
              ? `Vas a eliminar lógicamente la categoría "${deleteTarget.nombre}". Esta categoría está asociada a ${deleteTarget.projectCount || 0} proyecto(s).`
              : ""}
          </Typography>
          <Typography sx={{ mt: 1 }} color="text.secondary">
            Los proyectos existentes conservarán la referencia histórica, pero la categoría dejará de estar disponible para nuevas asignaciones.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={deleteCategory}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
