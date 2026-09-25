import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Add, Close, DeleteOutline } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import AccountSelector from "components/accounting/AccountSelector";
import { useApi } from "contexts/AxiosContext";
import { useSnackbar } from "notistack";
import { formatMonto } from "lib";

const buildRow = (baseAmount = "") => ({
  fromAccountCode: "",
  fromAccount: null,
  amount: baseAmount,
  description: "",
});

function ProjectFundingDrawer({
  open,
  onClose,
  project,
  fundingSummary,
  onSuccess,
  migration = false,
  year = new Date().getFullYear(),
}) {
  const { api, user } = useApi();
  const { enqueueSnackbar } = useSnackbar();
  const [submitting, setSubmitting] = useState(false);
  const [sourceScopeType, setSourceScopeType] = useState("department");
  const [rows, setRows] = useState([buildRow("")]);
  const projectId = project?._id?.$oid || project?._id || "";
  const departmentId = project?.departmentId || project?.departamento_id || "";
  const allowedSources = fundingSummary?.permissions?.allowedSources || [];
  const isSuperAdmin = user?.role === "super_admin";
  const totalRequired = Number(fundingSummary?.totals?.currentAvailable || 0);
  const resolvedYear = Number(year || new Date().getFullYear());

  useEffect(() => {
    if (!open) return;
    const defaultSource = allowedSources.includes("department")
      ? "department"
      : allowedSources[0] || "department";
    setSourceScopeType(defaultSource);
    setRows(migration ? [] : [buildRow("")]);
  }, [open, migration, totalRequired, allowedSources]);

  const sourceScopeId = sourceScopeType === "global" ? "global" : departmentId;

  const totalAssigned = useMemo(
    () => rows.reduce((acc, item) => acc + Number(item.amount || 0), 0),
    [rows]
  );

  const canSubmit =
    migration ||
    (rows.length > 0 &&
      rows.every((row) => row.fromAccountCode && Number(row.amount) > 0));

  const updateRow = (index, changes) => {
    setRows((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...changes } : row
      )
    );
  };

  const addRow = () => setRows((prev) => [...prev, buildRow("")]);
  const removeRow = (index) =>
    setRows((prev) => prev.filter((_, rowIndex) => rowIndex !== index));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        year: resolvedYear,
        sourceScopeType,
        sourceScopeId,
        allocations: migration
          ? []
          : rows.map((row) => ({
              fromAccountCode: row.fromAccountCode,
              amount: Number(row.amount),
              description: row.description?.trim() || "Asignación de fondos",
            })),
      };
      if (migration) {
        payload.note = "Migración manual desde UI";
      }

      const url = migration
        ? `/api/projects/${projectId}/funding-migration`
        : `/api/projects/${projectId}/funding-allocations`;

      await api.post(url, payload);
      enqueueSnackbar(
        migration
          ? "Migración de saldo completada"
          : "Fondos asignados correctamente",
        { variant: "success" }
      );
      onSuccess?.();
      onClose?.();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "No se pudo completar la operación";
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: "100vw", sm: 620 }, p: 3 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Box>
            <Typography variant="h6">
              {migration ? "Migrar saldo legacy" : "Asignar fondos"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {migration
                ? "Consolida el saldo actual del proyecto en una sola bolsa."
                : "Descuenta fondos de las cuentas de origen y los unifica en la bolsa del proyecto."}
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Stack>

        {migration && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Se conservará el historial anterior y se abrirá la bolsa única con
            el saldo disponible actual:{" "}
            <strong>{formatMonto(totalRequired)}</strong>
          </Alert>
        )}

        {!fundingSummary?.permissions?.canFund && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {fundingSummary?.permissions?.reason ||
              "No tienes permisos para asignar fondos."}
          </Alert>
        )}

        {!migration && (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <TextField
              select
              label="Origen del fondo"
              value={sourceScopeType}
              onChange={(event) => setSourceScopeType(event.target.value)}
              disabled={!isSuperAdmin || allowedSources.length <= 1}
            >
              {allowedSources.map((item) => (
                <MenuItem key={item} value={item}>
                  {item === "global"
                    ? "Global directo"
                    : "Departamento del proyecto"}
                </MenuItem>
              ))}
            </TextField>
          </FormControl>
        )}

        {!migration && (
          <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
            {sourceScopeType === "global"
              ? "El origen será el scope global."
              : `El origen será el departamento propietario del proyecto (${
                  departmentId || "sin departamento"
                }).`}
          </Alert>
        )}

        {!migration && (
          <Stack spacing={2}>
            {rows.map((row, index) => {
              const sourceBalance = Number(row.fromAccount?.balance || 0);
              return (
                <Paper
                  key={`funding-row-${index}`}
                  variant="outlined"
                  sx={{ p: 2 }}
                >
                  <Stack spacing={2}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="subtitle2">{`Línea ${
                        index + 1
                      }`}</Typography>
                      {rows.length > 1 && (
                        <IconButton
                          onClick={() => removeRow(index)}
                          size="small"
                        >
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>

                    <AccountSelector
                      label="Cuenta origen"
                      value={row.fromAccountCode || null}
                      year={resolvedYear}
                      allowHeaders={false}
                      scopeType={sourceScopeType}
                      scopeId={sourceScopeId}
                      assignedOnly
                      includeZero={false}
                      optionBalanceLabel="Disponible origen"
                      onChange={(accountCode, account) =>
                        updateRow(index, {
                          fromAccountCode: accountCode || "",
                          fromAccount: account,
                        })
                      }
                    />

                    <TextField
                      label="Monto"
                      type="number"
                      value={row.amount}
                      onChange={(event) =>
                        updateRow(index, { amount: event.target.value })
                      }
                      inputProps={{ min: 0, step: "0.01" }}
                    />

                    <TextField
                      label="Descripción"
                      value={row.description}
                      onChange={(event) =>
                        updateRow(index, { description: event.target.value })
                      }
                      placeholder={
                        migration
                          ? "Migración saldo legacy"
                          : "Asignación de fondos"
                      }
                    />

                    <Alert severity="info" variant="outlined">
                      <Stack spacing={0.5}>
                        <Typography variant="body2">{`Saldo disponible en origen: ${formatMonto(
                          sourceBalance
                        )}`}</Typography>
                        <Typography variant="body2">
                          El monto se incorporará al disponible único del
                          proyecto.
                        </Typography>
                      </Stack>
                    </Alert>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        )}

        {!migration && (
          <Button
            startIcon={<Add />}
            onClick={addRow}
            sx={{ mt: 2 }}
            disabled={!fundingSummary?.permissions?.canFund}
          >
            Agregar otra línea
          </Button>
        )}

        <Divider sx={{ my: 3 }} />

        <Alert severity="success" variant="outlined" sx={{ mb: 2 }}>
          <Typography variant="body2">
            {migration
              ? `Saldo que será consolidado: ${formatMonto(totalRequired)}`
              : `Total de esta operación: ${formatMonto(totalAssigned)}`}
          </Typography>
        </Alert>

        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          <Button variant="outlined" color="error" onClick={onClose}>
            Cancelar
          </Button>
          <LoadingButton
            variant="contained"
            onClick={handleSubmit}
            loading={submitting}
            disabled={!fundingSummary?.permissions?.canFund || !canSubmit}
          >
            {migration ? "Migrar saldo" : "Asignar fondos"}
          </LoadingButton>
        </Stack>
      </Box>
    </Drawer>
  );
}

export default ProjectFundingDrawer;
