import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
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
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useApi } from "contexts/AxiosContext";
import { formatMonto, formatSafeDate } from "lib";
import {
  getIncomeTypeChipColor,
  getIncomeTypeLabel,
} from "utils/accounting";
import ProjectFundingDrawer from "./actions/add/ProjectFundingDrawer";
import ProjectFundingMigrationDrawer from "./actions/add/ProjectFundingMigrationDrawer";

const TYPE_LABELS = {
  true: "Titular",
  false: "Detalle",
};

const MODEL_LABELS = {
  active: "Activo",
  legacy: "Legacy por migrar",
  pending_migration: "Migración pendiente",
};

const normalizeProjectId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value.$oid) return value.$oid;
  return "";
};

const flattenTree = (nodes, depth = 0) => {
  const sorted = [...(nodes || [])].sort((a, b) =>
    String(a.code || "").localeCompare(String(b.code || ""))
  );
  const rows = [];
  sorted.forEach((node) => {
    rows.push({ ...node, __depth: depth });
    if (Array.isArray(node.children) && node.children.length > 0) {
      rows.push(...flattenTree(node.children, depth + 1));
    }
  });
  return rows;
};

export default function ProductAccounts({
  projectId,
  project,
  year: defaultYear = new Date().getFullYear(),
}) {
  const normalizedProjectId = normalizeProjectId(projectId || project?._id);
  const [year, setYear] = useState(defaultYear);
  const [showZeroAssigned, setShowZeroAssigned] = useState(false);
  const [tree, setTree] = useState([]);
  const [meta, setMeta] = useState(null);
  const [summary, setSummary] = useState(project?.fundingSummary || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openFunding, setOpenFunding] = useState(false);
  const [openMigration, setOpenMigration] = useState(false);
  const { api } = useApi();
  const { enqueueSnackbar } = useSnackbar();

  const rows = useMemo(() => flattenTree(tree), [tree]);

  useEffect(() => {
    setYear(defaultYear);
  }, [defaultYear]);

  const refreshFunding = () => {
    if (!normalizedProjectId) return;
    api
      .get(`/api/projects/${normalizedProjectId}/funding-summary?year=${year}`)
      .then((response) => setSummary(response.data))
      .catch((err) => {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Error al cargar resumen financiero";
        enqueueSnackbar(message, { variant: "error" });
      });
  };

  const refreshAccounts = () => {
    if (!normalizedProjectId) return;

    setLoading(true);
    setError("");

    const params = new URLSearchParams({
      year: String(year),
      assignedOnly: "true",
      includeZero: showZeroAssigned ? "true" : "false",
    });

    api
      .get(`/api/projects/${normalizedProjectId}/accounts?${params.toString()}`)
      .then((response) => {
        setTree(response.data?.tree || []);
        setMeta(response.data?.meta || null);
      })
      .catch((err) => {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Error al cargar partidas del proyecto";
        setError(message);
        enqueueSnackbar(message, { variant: "error" });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    refreshFunding();
  }, [api, normalizedProjectId, year]);

  useEffect(() => {
    refreshAccounts();
  }, [api, enqueueSnackbar, normalizedProjectId, showZeroAssigned, year]);

  const handleSuccess = () => {
    refreshFunding();
    refreshAccounts();
  };

  return (
    <Box>
      <Stack spacing={2} mb={2}>
        <Alert severity="info" variant="outlined">
          Este módulo es la fuente operativa del saldo del proyecto. El
          disponible total se deriva de estas partidas.
        </Alert>

        {summary?.model?.migrationRequired && (
          <Alert
            severity="warning"
            action={
              summary?.permissions?.canFund ? (
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => setOpenMigration(true)}
                >
                  Migrar saldo
                </Button>
              ) : null
            }
          >
            Saldo legacy por migrar a partidas. Hasta completar la migración no
            se permiten nuevas asignaciones directas.
          </Alert>
        )}

        {summary && (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={2}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                spacing={2}
              >
                <Box>
                  <Typography variant="h6">Resumen financiero</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Disponible actual derivado, saldo inicial asignado y estado
                    del modelo.
                  </Typography>
                </Box>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Chip
                    label={
                      MODEL_LABELS[summary.model?.status] ||
                      summary.model?.status ||
                      "Activo"
                    }
                    color={
                      summary.model?.migrationRequired ? "warning" : "success"
                    }
                    variant="outlined"
                  />
                  {summary.permissions?.canFund ? (
                    <Button
                      variant="contained"
                      onClick={() => setOpenFunding(true)}
                    >
                      Asignar fondos
                    </Button>
                  ) : (
                    <Chip label="Solo lectura" variant="outlined" />
                  )}
                </Stack>
              </Stack>
              <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                <Typography variant="body2" color="text.secondary">
                  Disponible actual:{" "}
                  <strong>
                    {formatMonto(summary.totals?.currentAvailable || 0)}
                  </strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Saldo inicial asignado:{" "}
                  <strong>
                    {formatMonto(summary.totals?.initialAssigned || 0)}
                  </strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Partidas con saldo:{" "}
                  <strong>{summary.totals?.fundedAccountsCount || 0}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Último movimiento:{" "}
                  <strong>
                    {summary.totals?.lastMovementAt
                      ? formatSafeDate(
                          summary.totals.lastMovementAt,
                          "dd/MM/yyyy HH:mm"
                        )
                      : "-"}
                  </strong>
                </Typography>
              </Stack>
              {!summary.permissions?.canFund && summary.permissions?.reason && (
                <Typography variant="body2" color="text.secondary">
                  {summary.permissions.reason}
                </Typography>
              )}
            </Stack>
          </Paper>
        )}

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "flex-start", md: "center" }}
        >
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
            label="Mostrar partidas en 0 (asignadas)"
          />
        </Stack>

        {meta && (
          <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
            <Typography variant="body2" color="text.secondary">
              Cuentas asignadas: <strong>{meta.totalAssigned || 0}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cuentas visibles: <strong>{meta.totalVisible || 0}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Saldo visible:{" "}
              <strong>{formatMonto(meta.totalBalanceVisible || 0)}</strong>
            </Typography>
          </Stack>
        )}
      </Stack>

      {loading ? (
        <Paper sx={{ p: 2 }}>
          <Typography color="text.secondary">
            Cargando partidas del proyecto...
          </Typography>
        </Paper>
      ) : error ? (
        <Paper sx={{ p: 2 }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      ) : rows.length === 0 ? (
        <Paper sx={{ p: 2 }}>
          <Typography color="text.secondary">
            No hay partidas asignadas para mostrar.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Código</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Grupo</TableCell>
                <TableCell>Tipo de ingreso</TableCell>
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
                    <Box sx={{ pl: row.__depth * 2 }}>{row.description}</Box>
                  </TableCell>
                  <TableCell>{row.group || "-"}</TableCell>
                  <TableCell>
                    <Chip
                      label={getIncomeTypeLabel(row.incomeType)}
                      color={getIncomeTypeChipColor(row.incomeType)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {TYPE_LABELS[String(Boolean(row.is_header))] || "Detalle"}
                  </TableCell>
                  <TableCell align="right">
                    {formatMonto(row.balance || 0)}
                  </TableCell>
                  <TableCell align="right">{row.movementsCount || 0}</TableCell>
                  <TableCell>
                    {row.lastMovementAt
                      ? formatSafeDate(row.lastMovementAt, "dd/MM/yyyy HH:mm")
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ProjectFundingDrawer
        open={openFunding}
        onClose={() => setOpenFunding(false)}
        project={project || { _id: normalizedProjectId, departmentId }}
        fundingSummary={summary}
        year={year}
        onSuccess={handleSuccess}
      />
      <ProjectFundingMigrationDrawer
        open={openMigration}
        onClose={() => setOpenMigration(false)}
        project={project || { _id: normalizedProjectId, departmentId }}
        fundingSummary={summary}
        year={year}
        onSuccess={handleSuccess}
      />
    </Box>
  );
}
