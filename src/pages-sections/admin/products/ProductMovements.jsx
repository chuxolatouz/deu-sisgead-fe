import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import TablePagination from "components/data-table/TablePagination";
import { useApi } from "contexts/AxiosContext";
import { useSnackbar } from "notistack";
import { formatMonto, formatSafeDate } from "lib";

const TYPE_LABELS = {
  funding: "Fondeo",
  expense: "Gasto",
  rule: "Regla",
  migration: "Migración",
  adjustment: "Ajuste",
};

const TYPE_COLORS = {
  funding: "success",
  expense: "error",
  rule: "warning",
  migration: "info",
  adjustment: "default",
};

function ProductMovements({ id, year = new Date().getFullYear() }) {
  const [pagination, setPagination] = useState(1);
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const { api } = useApi();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (!id) return;
    api
      .get(
        `/api/projects/${id}/funding-timeline?page=${pagination - 1}&limit=10&year=${year}`
      )
      .then((response) => {
        setRows(response.data.request_list || []);
        setCount(Math.max(1, Math.ceil((response.data.count || 0) / 10)));
      })
      .catch((error) => {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Error al cargar movimientos";
        enqueueSnackbar(message, { variant: "error" });
      });
  }, [api, enqueueSnackbar, id, pagination, year]);

  return (
    <Box>
      <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
        Esta línea de tiempo consolida movimientos estructurados de partidas y,
        cuando aplica, historial legacy.
      </Alert>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Título</TableCell>
              <TableCell>Partida</TableCell>
              <TableCell>Actor</TableCell>
              <TableCell align="right">Monto</TableCell>
              <TableCell align="right">Saldo proyecto</TableCell>
              <TableCell>Fuente</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {formatSafeDate(item.occurredAt, "dd/MM/yyyy HH:mm")}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={TYPE_COLORS[item.type] || "default"}
                      label={TYPE_LABELS[item.type] || item.type}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="body2">{item.title}</Typography>
                      {item.description && (
                        <Typography variant="caption" color="text.secondary">
                          {item.description}
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>{item.accountCode || "-"}</TableCell>
                  <TableCell>{item.actorName || "-"}</TableCell>
                  <TableCell align="right">
                    {formatMonto(item.amount || 0)}
                  </TableCell>
                  <TableCell align="right">
                    {formatMonto(item.projectBalanceAfter || 0)}
                  </TableCell>
                  <TableCell>
                    {item.source === "legacy_action"
                      ? "Histórico legacy"
                      : "Ledger"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8}>
                  <Typography color="text.secondary">
                    No hay movimientos financieros para mostrar.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Stack alignItems="center" my={4}>
        <TablePagination
          onChange={(_, value) => setPagination(value)}
          page={pagination}
          count={count || 1}
        />
      </Stack>
    </Box>
  );
}

export default ProductMovements;
