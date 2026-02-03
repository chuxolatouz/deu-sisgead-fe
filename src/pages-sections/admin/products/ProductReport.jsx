import { useEffect, useState } from 'react';
import { Card, Grid, Typography, Box } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useApi } from 'contexts/AxiosContext';
import { useSnackbar } from 'notistack';
import { uniqueId } from 'lodash';
import { formatMonto } from 'lib';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function ProjectReport({ id }) {
  const [balanceHistory, setBalanceHistory] = useState([]);
  const [egresosPorTipo, setEgresosPorTipo] = useState([]);
  const [summary, setSummary] = useState({
    ingresos: 0,
    egresos: 0,
    presupuestos: 0,
    represupuestos: 0,
    miembros: 0
  });
  const { api } = useApi();
  const { enqueueSnackbar } = useSnackbar();

  // biome-ignore lint/correctness/useExhaustiveDependencies: id es la única dependencia necesaria
  useEffect(() => {
    if (id) {
      api.get(`/proyecto/${id}/reporte`)
        .then((res) => {
          // El backend devuelve balance_history y egresos_tipo (snake_case)
          const balanceHistory = Array.isArray(res.data?.balance_history)
            ? res.data.balance_history
            : [];
          const egresosPorTipo = Array.isArray(res.data?.egresos_tipo)
            ? res.data.egresos_tipo
            : [];
          const resumen = res.data?.resumen || {};

          setBalanceHistory(balanceHistory);
          setEgresosPorTipo(egresosPorTipo);
          setSummary({
            ingresos: resumen.ingresos || 0,
            egresos: resumen.egresos || 0,
            presupuestos: resumen.presupuestos || 0,
            represupuestos: resumen.represupuestos || 0,
            miembros: resumen.miembros || 0
          });
        })
        .catch((err) => {
          console.error("Error al cargar el reporte:", err);
          enqueueSnackbar("Error al cargar el reporte", { variant: 'error' });
          // Asegurar que los estados sean arrays vacíos en caso de error
          setBalanceHistory([]);
          setEgresosPorTipo([]);
        });
    }
  }, [id]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card style={{ padding: 20 }}>
          <Typography variant="h6" gutterBottom>Evolución del Saldo</Typography>
          {balanceHistory && balanceHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={balanceHistory}>
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="saldo" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" height={300}>
              <Typography variant="body2" color="text.secondary">
                No hay historial de saldo disponible
              </Typography>
            </Box>
          )}
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card style={{ padding: 20 }}>
          <Typography variant="h6" gutterBottom>Egresos por Tipo</Typography>
          {egresosPorTipo && egresosPorTipo.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={egresosPorTipo} dataKey="monto" nameKey="tipo" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                  {egresosPorTipo.map((entry, index) => (
                    <Cell key={`cell-${entry.tipo || index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" height={300}>
              <Typography variant="body2" color="text.secondary">
                No hay egresos registrados
              </Typography>
            </Box>
          )}
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card style={{ padding: 20 }}>
          <Typography variant="h6" gutterBottom>Resumen del Proyecto</Typography>
          <Grid container spacing={2} justifyContent="center">
            {[
              { label: "Ingresos", value: formatMonto(summary.ingresos || 0), color: 'text.primary' },
              { label: "Egresos", value: formatMonto(summary.egresos || 0), color: 'error.main' },
              { label: "Actividades Finalizadas", value: summary.presupuestos },
              { label: "Actividades Nuevas", value: summary.represupuestos },
              { label: "Miembros", value: summary.miembros }
            ].map((item) => (
              <Grid item xs={6} md={2.4} key={item.label}>
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Typography
                    variant="subtitle2"
                    align="center"
                    sx={{ minHeight: 40 }} // <- fuerza altura uniforme
                  >
                    {item.label}
                  </Typography>
                  <Typography variant="h6" color={item.color || 'text.primary'}>
                    {item.value}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Card>
      </Grid>
    </Grid>
  );
}
