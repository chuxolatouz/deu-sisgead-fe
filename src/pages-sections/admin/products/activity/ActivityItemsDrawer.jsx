import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  Paper,
  Stack,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Add,
  AttachFile,
  CheckCircleOutline,
  Close,
  DeleteOutline,
  EditOutlined,
  OpenInNew,
  PlaylistAddCheck,
} from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import AccountSelector from "components/accounting/AccountSelector";
import DropZone from "components/DropZone";
import { useApi } from "contexts/AxiosContext";
import { useSnackbar } from "notistack";
import { formatMonto } from "lib";

const emptyForm = {
  nombre: "",
  descripcion: "",
  monto: "",
  accountCode: null,
  requirementId: "",
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
  const [closure, setClosure] = useState({
    referencia: "",
    banco: "",
    transferAmount: "",
  });
  const [supportFiles, setSupportFiles] = useState([]);
  const [closureAccounts, setClosureAccounts] = useState({});
  const [loadingAction, setLoadingAction] = useState("");

  const docId = getDocId(budget);
  const isSponsored = Boolean(budget?.isSponsored || budget?.patrocinada);
  const pendingItems = useMemo(() => getPendingItems(items), [items]);
  const activityRequirements = Array.isArray(budget?.requerimientos)
    ? budget.requerimientos
    : [];
  const selectedRequirement = activityRequirements.find(
    (requirement) => requirement.requirementId === form.requirementId
  );
  const fundingYear = Number(
    project?.fundingYear || budget?.fundingYear || new Date().getFullYear()
  );

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
    const itemAmount = Number(form.monto || 0);
    if (itemAmount < 0) {
      enqueueSnackbar("El monto del item no puede ser negativo", {
        variant: "error",
      });
      return;
    }
    if (!isSponsored && itemAmount === 0 && form.accountCode) {
      enqueueSnackbar(
        "Un item con monto 0 no puede tener una cuenta asociada",
        { variant: "error" }
      );
      return;
    }
    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      monto: form.monto || "0",
      accountCode: form.accountCode || "",
      requirementId: form.requirementId || "",
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
        enqueueSnackbar(error?.response?.data?.message || error.message, {
          variant: "error",
        });
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
      requirementId: item.requirementId || "",
    });
  };

  const handleDelete = (itemId) => {
    setLoadingAction(`delete-${itemId}`);
    api
      .delete(`/documentos/${docId}/items/${itemId}`)
      .then((response) => {
        enqueueSnackbar(response.data.message, { variant: "success" });
        onChanged?.();
      })
      .catch((error) => {
        enqueueSnackbar(error?.response?.data?.message || error.message, {
          variant: "error",
        });
      })
      .finally(() => setLoadingAction(""));
  };

  const appendClosureData = (formData, itemId = null) => {
    formData.append("year", String(fundingYear));
    formData.append("referencia", closure.referencia);
    formData.append("banco", closure.banco);
    formData.append(
      "transferAmount",
      isSponsored ? "0" : closure.transferAmount
    );
    if (itemId && closureAccounts[itemId]) {
      formData.append("accountCode", closureAccounts[itemId]);
    }
    formData.append("accountMappings", JSON.stringify(closureAccounts));
    supportFiles.forEach((file) => formData.append("supportFiles", file));
    return formData;
  };

  const handleCloseItem = (itemId) => {
    setLoadingAction(`close-${itemId}`);
    api
      .post(
        `/documentos/${docId}/items/${itemId}/cierre-administrativo`,
        appendClosureData(new FormData(), itemId)
      )
      .then((response) => {
        enqueueSnackbar(response.data.mensaje, { variant: "success" });
        setSupportFiles([]);
        onChanged?.();
      })
      .catch((error) => {
        enqueueSnackbar(
          error?.response?.data?.error ||
            error?.response?.data?.message ||
            error.message,
          { variant: "error" }
        );
      })
      .finally(() => setLoadingAction(""));
  };

  const handleClosePending = () => {
    const formData = appendClosureData(new FormData());
    formData.append(
      "projectId",
      project?._id || budget?.projectId || budget?.project_id?.$oid || ""
    );
    formData.append("docId", docId);
    formData.append("monto", "0");

    setLoadingAction("close-pending");
    api
      .post("/documento_cerrar", formData)
      .then((response) => {
        enqueueSnackbar(response.data.mensaje, { variant: "success" });
        setSupportFiles([]);
        onChanged?.();
      })
      .catch((error) => {
        enqueueSnackbar(
          error?.response?.data?.error ||
            error?.response?.data?.message ||
            error.message,
          { variant: "error" }
        );
      })
      .finally(() => setLoadingAction(""));
  };

  const requiresClosureAccount = (item) => {
    if (isSponsored || Number(item?.monto || 0) <= 0) return false;
    if (item?.accountCode || item?.cuenta_contable) return false;
    const requirement = activityRequirements.find(
      (candidate) => candidate.requirementId === item?.requirementId
    );
    return !requirement || Boolean(requirement.account?.isHeader);
  };

  const canClosePending = pendingItems.every(
    (item) => !requiresClosureAccount(item) || closureAccounts[item.id]
  );

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
        PaperProps={{
          sx: { width: { xs: "100%", sm: 620 }, maxWidth: "100%" },
        }}
      >
        <Stack spacing={2.5} sx={{ p: 3 }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
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
              Actividad patrocinada: los cierres se registran en cero y usan la
              cuenta de patrocinio configurada.
            </Alert>
          )}

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={2}>
              <Typography variant="subtitle2">
                {editingId ? "Editar item" : "Agregar item"}
              </Typography>
              {activityRequirements.length > 0 && !isSponsored && (
                <FormControl fullWidth>
                  <InputLabel id="item-requirement-label">
                    Requerimiento (opcional)
                  </InputLabel>
                  <Select
                    labelId="item-requirement-label"
                    label="Requerimiento (opcional)"
                    value={form.requirementId}
                    onChange={(event) => {
                      const requirementId = event.target.value;
                      const requirement = activityRequirements.find(
                        (item) => item.requirementId === requirementId
                      );
                      const isHeader = requirement?.account?.isHeader;
                      setForm((current) => ({
                        ...current,
                        requirementId,
                        nombre: current.nombre || requirement?.nombre || "",
                        descripcion:
                          current.descripcion || requirement?.descripcion || "",
                        accountCode: isHeader
                          ? null
                          : requirement?.accountCode || null,
                      }));
                    }}
                  >
                    <MenuItem value="">
                      <em>Sin requerimiento asociado</em>
                    </MenuItem>
                    {activityRequirements.map((requirement) => (
                      <MenuItem
                        key={requirement.requirementId}
                        value={requirement.requirementId}
                      >
                        <ListItemText
                          primary={requirement.nombre}
                          secondary={`${requirement.accountCode} · ${
                            requirement.account?.isHeader
                              ? "Titular"
                              : "Detalle"
                          } · Nivel ${requirement.account?.level || "-"}`}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              <TextField
                label="Nombre"
                value={form.nombre}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, nombre: event.target.value }))
                }
                fullWidth
              />
              <TextField
                label="Descripción"
                value={form.descripcion}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    descripcion: event.target.value,
                  }))
                }
                fullWidth
                multiline
                minRows={2}
              />
              <TextField
                label="Monto"
                type="number"
                value={form.monto}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, monto: event.target.value }))
                }
                fullWidth
                disabled={isSponsored}
                helperText={
                  isSponsored
                    ? "Las actividades patrocinadas se cierran con monto 0."
                    : ""
                }
              />
              {!isSponsored &&
                selectedRequirement &&
                !selectedRequirement.account?.isHeader && (
                  <TextField
                    label="Partida del requerimiento"
                    value={`${selectedRequirement.accountCode} - ${
                      selectedRequirement.account?.description || ""
                    }`}
                    fullWidth
                    disabled
                    helperText="Esta cuenta se aplicará automáticamente durante el cierre."
                  />
                )}
              {!isSponsored &&
                (!selectedRequirement ||
                  selectedRequirement.account?.isHeader) && (
                  <Alert severity="info" variant="outlined">
                    Administración seleccionará la cuenta detalle cuando
                    registre el cierre de este item.
                  </Alert>
                )}
              <Box display="flex" justifyContent="flex-end" gap={1}>
                {editingId && (
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={resetForm}
                  >
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
                onChange={(event) =>
                  setClosure((prev) => ({
                    ...prev,
                    referencia: event.target.value,
                  }))
                }
                fullWidth
              />
              <Box display="flex" gap={2} flexWrap="wrap">
                <TextField
                  label="Banco"
                  value={closure.banco}
                  onChange={(event) =>
                    setClosure((prev) => ({
                      ...prev,
                      banco: event.target.value,
                    }))
                  }
                  sx={{ flex: "1 1 220px" }}
                />
                <TextField
                  label="Monto transferencia"
                  type="number"
                  value={closure.transferAmount}
                  onChange={(event) =>
                    setClosure((prev) => ({
                      ...prev,
                      transferAmount: event.target.value,
                    }))
                  }
                  disabled={isSponsored}
                  sx={{ flex: "1 1 220px" }}
                />
              </Box>
              <DropZone
                onChange={setSupportFiles}
                onRejected={() =>
                  enqueueSnackbar(
                    "Solo se permiten hasta 10 imágenes o PDF de 10 MB",
                    { variant: "error" }
                  )
                }
                title="Adjunta respaldos del cierre (opcional)"
                imageSize="Imágenes o PDF, máximo 10 MB por archivo"
              />
              {supportFiles.length > 0 && (
                <Stack spacing={0.5}>
                  {supportFiles.map((file) => (
                    <Typography
                      key={`${file.name}-${file.size}`}
                      variant="caption"
                    >
                      {file.name}
                    </Typography>
                  ))}
                </Stack>
              )}
              <LoadingButton
                variant="outlined"
                color="secondary"
                loading={loadingAction === "close-pending"}
                disabled={!pendingItems.length || !canClosePending}
                onClick={handleClosePending}
              >
                Cerrar items pendientes
              </LoadingButton>
            </Stack>
          </Paper>

          <Divider />

          <Box>
            <Typography variant="subtitle2" mb={1}>
              Expediente administrativo
            </Typography>
            {(budget?.administrativeAttachments || []).length ? (
              <Stack spacing={1}>
                {budget.administrativeAttachments.map((attachment, index) => (
                  <Button
                    key={
                      attachment.public_id || `${attachment.nombre}-${index}`
                    }
                    component="a"
                    href={attachment.download_url}
                    target="_blank"
                    rel="noreferrer"
                    variant="outlined"
                    color="inherit"
                    startIcon={<AttachFile />}
                    endIcon={<OpenInNew />}
                    sx={{ justifyContent: "space-between" }}
                  >
                    {attachment.nombre || "Respaldo"}
                  </Button>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No se han cargado respaldos administrativos.
              </Typography>
            )}
          </Box>

          <Divider />

          <Stack spacing={1.5}>
            {items.length ? (
              items.map((item) => {
                const closed = item.status === "closed";
                const itemRequirement = activityRequirements.find(
                  (requirement) =>
                    requirement.requirementId === item.requirementId
                );
                const needsAccount = requiresClosureAccount(item);
                return (
                  <Paper key={item.id} variant="outlined" sx={{ p: 2 }}>
                    <Box display="flex" justifyContent="space-between" gap={2}>
                      <Box>
                        <Typography fontWeight={700}>
                          {item.nombre || "Item sin nombre"}
                        </Typography>
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
                        {item.requirementName && (
                          <Typography
                            variant="caption"
                            color="primary"
                            display="block"
                          >
                            Requerimiento: {item.requirementName}
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
                      <Stack spacing={1.5} mt={2}>
                        {needsAccount && (
                          <AccountSelector
                            label={
                              itemRequirement?.account?.isHeader
                                ? `Cuenta detalle bajo ${itemRequirement.accountCode}`
                                : "Cuenta contable para el cierre"
                            }
                            value={closureAccounts[item.id] || null}
                            group="EGRESO"
                            year={fundingYear}
                            allowHeaders={false}
                            ancestorCode={
                              itemRequirement?.account?.isHeader
                                ? itemRequirement.accountCode
                                : undefined
                            }
                            onChange={(accountCode) =>
                              setClosureAccounts((current) => ({
                                ...current,
                                [item.id]: accountCode || "",
                              }))
                            }
                            helperText="Administración imputará esta cuenta al liquidar el item."
                          />
                        )}
                        <Box
                          display="flex"
                          justifyContent="flex-end"
                          gap={1}
                          flexWrap="wrap"
                        >
                          <Button
                            size="small"
                            startIcon={<EditOutlined />}
                            onClick={() => handleEdit(item)}
                          >
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
                            disabled={needsAccount && !closureAccounts[item.id]}
                          >
                            Cerrar item
                          </LoadingButton>
                        </Box>
                      </Stack>
                    )}
                  </Paper>
                );
              })
            ) : (
              <Alert severity="warning">
                Esta actividad todavía no tiene items. Agrega al menos uno antes
                de hacer el cierre administrativo.
              </Alert>
            )}
          </Stack>
        </Stack>
      </Drawer>
    </>
  );
}

export default ActivityItemsDrawer;
