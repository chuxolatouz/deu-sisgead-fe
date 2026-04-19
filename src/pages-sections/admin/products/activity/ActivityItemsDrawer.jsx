import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Add, CheckCircleOutline, Close, DeleteOutline, EditOutlined, PlaylistAddCheck } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import AccountSelector from "components/accounting/AccountSelector";
import { useApi } from "contexts/AxiosContext";
import { useSnackbar } from "notistack";
import { formatMonto } from "lib";

const emptyForm = {
  nombre: "",
  descripcion: "",
  monto: "",
  accountCode: null,
};

const getDocId = (budget) => budget?._id?.$oid || budget?._id || "";

const getPendingItems = (items) =>
  (items || []).filter((item) => item.status !== "closed" && !item.isSynthetic);

function ActivityItemsDrawer({ budget, project, onChanged }) {
  const { api } = useApi();
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [closure, setClosure] = useState({ referencia: "", banco: "", transferAmount: "" });
  const [loadingAction, setLoadingAction] = useState("");

  const docId = getDocId(budget);
  const isSponsored = Boolean(budget?.isSponsored || budget?.patrocinada);
  const pendingItems = useMemo(() => getPendingItems(items), [items]);
  const fundingYear = Number(project?.fundingYear || budget?.fundingYear || new Date().getFullYear());

  useEffect(() => {
    setItems(Array.isArray(budget?.items) ? budget.items : []);
  }, [budget?.items]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId("");
  };

  const handleSubmitItem = () => {
    if (!form.nombre.trim()) {
      enqueueSnackbar("El nombre del item es requerido", { variant: "error" });
      return;
    }
    if (!isSponsored && Number(form.monto || 0) <= 0) {
      enqueueSnackbar("El monto del item debe ser mayor que 0", { variant: "error" });
      return;
    }

    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      monto: form.monto || "0",
      accountCode: form.accountCode || "",
    };
    const request = editingId
      ? api.put(`/documentos/${docId}/items/${editingId}`, payload)
      : api.post(`/documentos/${docId}/items`, payload);

    setLoadingAction("item");
    request
      .then((response) => {
        enqueueSnackbar(response.data.message, { variant: "success" });
        resetForm();
        onChanged?.();
      })
      .catch((error) => {
        enqueueSnackbar(error?.response?.data?.message || error.message, { variant: "error" });
      })
      .finally(() => setLoadingAction(""));
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      nombre: item.nombre || "",
      descripcion: item.descripcion || "",
      monto: item.monto ? String((Number(item.monto) || 0) / 100) : "",
      accountCode: item.accountCode || null,
    });
  };

  const handleDelete = (itemId) => {
    setLoadingAction(`delete-${itemId}`);
    api.delete(`/documentos/${docId}/items/${itemId}`)
      .then((response) => {
        enqueueSnackbar(response.data.message, { variant: "success" });
        onChanged?.();
      })
      .catch((error) => {
        enqueueSnackbar(error?.response?.data?.message || error.message, { variant: "error" });
      })
      .finally(() => setLoadingAction(""));
  };

  const closePayload = () => ({
    year: fundingYear,
    referencia: closure.referencia,
    banco: closure.banco,
    transferAmount: isSponsored ? "0" : closure.transferAmount,
  });

  const handleCloseItem = (itemId) => {
    setLoadingAction(`close-${itemId}`);
    api.post(`/documentos/${docId}/items/${itemId}/cierre-administrativo`, closePayload())
      .then((response) => {
        enqueueSnackbar(response.data.mensaje, { variant: "success" });
        onChanged?.();
      })
      .catch((error) => {
        enqueueSnackbar(error?.response?.data?.error || error?.response?.data?.message || error.message, { variant: "error" });
      })
      .finally(() => setLoadingAction(""));
  };

  const handleClosePending = () => {
    const formData = new FormData();
    formData.append("projectId", project?._id || budget?.projectId || budget?.project_id?.$oid || "");
    formData.append("docId", docId);
    formData.append("monto", "0");
    formData.append("year", String(fundingYear));
    formData.append("referencia", closure.referencia);
    formData.append("banco", closure.banco);
    formData.append("transferAmount", isSponsored ? "0" : closure.transferAmount);

    setLoadingAction("close-pending");
    api.post("/documento_cerrar", formData)
      .then((response) => {
        enqueueSnackbar(response.data.mensaje, { variant: "success" });
        onChanged?.();
      })
      .catch((error) => {
        enqueueSnackbar(error?.response?.data?.error || error?.response?.data?.message || error.message, { variant: "error" });
      })
      .finally(() => setLoadingAction(""));
  };

  return (
    <>
      <Tooltip title="Gestionar items">
        <Button
          size="small"
          variant="outlined"
          startIcon={<PlaylistAddCheck />}
          onClick={() => setOpen(true)}
        >
          Items
        </Button>
      </Tooltip>
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{ sx: { width: { xs: "100%", sm: 620 }, maxWidth: "100%" } }}
      >
        <Stack spacing={2.5} sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6">Items de actividad</Typography>
              <Typography variant="body2" color="text.secondary">
                {budget?.descripcion || "Actividad"}
              </Typography>
            </Box>
            <IconButton onClick={() => setOpen(false)}>
              <Close />
            </IconButton>
          </Box>

          {isSponsored && (
            <Alert severity="info">
              Actividad patrocinada: los cierres se registran en cero y usan la cuenta de patrocinio configurada.
            </Alert>
          )}

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={2}>
              <Typography variant="subtitle2">
                {editingId ? "Editar item" : "Agregar item"}
              </Typography>
              <TextField
                label="Nombre"
                value={form.nombre}
                onChange={(event) => setForm((prev) => ({ ...prev, nombre: event.target.value }))}
                fullWidth
              />
              <TextField
                label="Descripción"
                value={form.descripcion}
                onChange={(event) => setForm((prev) => ({ ...prev, descripcion: event.target.value }))}
                fullWidth
                multiline
                minRows={2}
              />
              <TextField
                label="Monto"
                type="number"
                value={form.monto}
                onChange={(event) => setForm((prev) => ({ ...prev, monto: event.target.value }))}
                fullWidth
                disabled={isSponsored}
                helperText={isSponsored ? "Las actividades patrocinadas se cierran con monto 0." : ""}
              />
              {!isSponsored && (
                <AccountSelector
                  label="Partida del item"
                  value={form.accountCode}
                  group="EGRESO"
                  year={fundingYear}
                  allowHeaders={false}
                  scopeType="project"
                  scopeId={project?._id || budget?.projectId}
                  assignedOnly
                  includeZero={false}
                  optionBalanceLabel="Disponible"
                  onChange={(accountCode) => {
                    setForm((prev) => ({ ...prev, accountCode }));
                  }}
                />
              )}
              <Box display="flex" justifyContent="flex-end" gap={1}>
                {editingId && (
                  <Button variant="outlined" color="inherit" onClick={resetForm}>
                    Cancelar edición
                  </Button>
                )}
                <LoadingButton
                  variant="contained"
                  startIcon={<Add />}
                  loading={loadingAction === "item"}
                  onClick={handleSubmitItem}
                >
                  {editingId ? "Guardar item" : "Agregar item"}
                </LoadingButton>
              </Box>
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={2}>
              <Typography variant="subtitle2">Cierre administrativo</Typography>
              <TextField
                label="Referencia"
                value={closure.referencia}
                onChange={(event) => setClosure((prev) => ({ ...prev, referencia: event.target.value }))}
                fullWidth
              />
              <Box display="flex" gap={2} flexWrap="wrap">
                <TextField
                  label="Banco"
                  value={closure.banco}
                  onChange={(event) => setClosure((prev) => ({ ...prev, banco: event.target.value }))}
                  sx={{ flex: "1 1 220px" }}
                />
                <TextField
                  label="Monto transferencia"
                  type="number"
                  value={closure.transferAmount}
                  onChange={(event) => setClosure((prev) => ({ ...prev, transferAmount: event.target.value }))}
                  disabled={isSponsored}
                  sx={{ flex: "1 1 220px" }}
                />
              </Box>
              <LoadingButton
                variant="outlined"
                color="secondary"
                loading={loadingAction === "close-pending"}
                disabled={!pendingItems.length}
                onClick={handleClosePending}
              >
                Cerrar items pendientes
              </LoadingButton>
            </Stack>
          </Paper>

          <Divider />

          <Stack spacing={1.5}>
            {items.length ? items.map((item) => {
              const closed = item.status === "closed";
              return (
                <Paper key={item.id} variant="outlined" sx={{ p: 2 }}>
                  <Box display="flex" justifyContent="space-between" gap={2}>
                    <Box>
                      <Typography fontWeight={700}>{item.nombre || "Item sin nombre"}</Typography>
                      {item.descripcion && (
                        <Typography variant="body2" color="text.secondary">
                          {item.descripcion}
                        </Typography>
                      )}
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {formatMonto((Number(item.monto) || 0) / 100)}
                      </Typography>
                      {item.accountCode && (
                        <Typography variant="caption" color="text.secondary">
                          Partida: {item.accountCode}
                        </Typography>
                      )}
                    </Box>
                    <Chip
                      size="small"
                      color={closed ? "success" : "warning"}
                      variant="outlined"
                      label={closed ? "Cerrado" : "Pendiente"}
                    />
                  </Box>
                  {!item.isSynthetic && !closed && (
                    <Box display="flex" justifyContent="flex-end" gap={1} mt={2} flexWrap="wrap">
                      <Button size="small" startIcon={<EditOutlined />} onClick={() => handleEdit(item)}>
                        Editar
                      </Button>
                      <LoadingButton
                        size="small"
                        color="error"
                        startIcon={<DeleteOutline />}
                        loading={loadingAction === `delete-${item.id}`}
                        onClick={() => handleDelete(item.id)}
                      >
                        Eliminar
                      </LoadingButton>
                      <LoadingButton
                        size="small"
                        color="secondary"
                        variant="outlined"
                        startIcon={<CheckCircleOutline />}
                        loading={loadingAction === `close-${item.id}`}
                        onClick={() => handleCloseItem(item.id)}
                      >
                        Cerrar item
                      </LoadingButton>
                    </Box>
                  )}
                </Paper>
              );
            }) : (
              <Alert severity="warning">
                Esta actividad todavía no tiene items. Agrega al menos uno antes de hacer el cierre administrativo.
              </Alert>
            )}
          </Stack>
        </Stack>
      </Drawer>
    </>
  );
}

export default ActivityItemsDrawer;
