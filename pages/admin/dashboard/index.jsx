import { useEffect, useState } from 'react';
import { Box, Grid, Card, Typography, Chip, Alert } from '@mui/material';
import { H3 } from "components/Typography";
import { 
    PieChart, 
    Pie, 
    Cell, 
    Tooltip, 
    ResponsiveContainer, 
    CartesianGrid, 
    BarChart, 
    Bar, 
    LineChart, 
    Line, 
    LabelList,
    XAxis, 
    YAxis, 
    Legend 
} from 'recharts';
import { useApi } from 'contexts/AxiosContext';
import { useDepartment } from 'contexts/DepartmentContext';
import VendorDashboardLayout from "components/layouts/vendor-dashboard";
import DashboardFilter from "components/DashboardFilters";
import { useSnackbar } from 'notistack';
import FolderIcon from "@mui/icons-material/Folder";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BusinessIcon from "@mui/icons-material/Business";
import { set } from 'lodash';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const stats = [
    { label: "Proyectos", valueKey: "proyectos", icon: <FolderIcon color="primary" /> },
    { label: "Miembros", valueKey: "miembros", icon: <GroupWorkIcon color="secondary" /> },
    { label: "Presupuestos", valueKey: "presupuestos", icon: <AssignmentIcon color="warning" /> },
    { label: "Presupuestos Completados", valueKey: "presupuestos_finalizados", icon: <CheckCircleIcon color="success" /> },
  ];

DashboardResumen.getLayout = function getLayout(page) {
    return <VendorDashboardLayout>{page}</VendorDashboardLayout>;
  };

  export default function DashboardResumen() {
    const [balanceHistory, setBalanceHistory] = useState([]);
    const [ocurrencias, setOccurencias] = useState([]);
    const [pieData, setPieData] = useState([
      { name: "Ingresos", value: 0 },
      { name: "Egresos", value: 0 }
    ]);
    const [proyectosPorCategoria, setProyectosPorCategoria] = useState([]);
    const [range, setRange] = useState("6m");
    const [summary, setSummary] = useState({});
    const [usuarios, setUsuarios] = useState(0);
    const { api } = useApi();
    const { departamentoData, usandoContexto } = useDepartment();
    const { enqueueSnackbar } = useSnackbar();
  
    useEffect(() => {
        api.get(`/dashboard_global?range=${range}`)
        .then((res) => {
          const { balanceHistory, categorias, resumen, totales, usuarios } = res.data;
          setBalanceHistory(balanceHistory);
          setProyectosPorCategoria(categorias);
          setUsuarios(usuarios || 0);
          setOccurencias(resumen.ocurrencias || []);
          setPieData([
            { name: "Ingresos", value: totales.ingresos || 0 },
            { name: "Egresos", value: totales.egresos || 0 }
          ]);
          setSummary(resumen);
        })
        .catch((err) => {
            console.error("Error al cargar el resumen del dashboard:", err);
          enqueueSnackbar("Error al cargar el resumen del dashboard", { variant: "error" });
        });
    }, [range]);
      

  
    return (
    <Box py={4} >
      {usandoContexto && departamentoData && (
        <Alert 
          severity="info" 
          icon={<BusinessIcon />}
          sx={{ mb: 3 }}
        >
          Estás viendo el dashboard del departamento: <strong>{departamentoData.nombre}</strong>
        </Alert>
      )}
      <Grid container spacing={3}>
      <Grid item xs={12}>
          <Card style={{ padding: 20 }}>
            
            <Grid container spacing={2} justifyContent="space-between" alignItems="center">
                <Grid item>
                    <Box display="flex" alignItems="center" gap={2}>
                      <H3>
                        {usandoContexto && departamentoData 
                          ? `Dashboard - ${departamentoData.nombre}` 
                          : 'Dashboard Resumen'}
                      </H3>
                      {usandoContexto && departamentoData && (
                        <Chip 
                          icon={<BusinessIcon />}
                          label={departamentoData.codigo}
                          color="primary"
                          size="small"
                        />
                      )}
                    </Box>
                </Grid>
                <Grid item>
                    <DashboardFilter onChange={setRange} />
                </Grid>
            </Grid>
            <Grid container spacing={3} justifyContent="center">
                {stats.map(({ label, valueKey, icon }) => (
                    <Grid item xs={12} sm={6} md={2.4} key={valueKey}>
                    <Card
                        sx={{
                        p: 2,
                        textAlign: "center",
                        boxShadow: 3,
                        borderRadius: 2,
                        }}
                    >
                        <Box display="flex" justifyContent="center" mb={1}>
                        {icon}
                        </Box>
                        <Typography variant="subtitle2" color="textSecondary">
                        {label}
                        </Typography>
                        <Typography variant="h6">
                        {valueKey === "usuarios" ? usuarios : summary[valueKey]}
                        </Typography>
                    </Card>
                    </Grid>
                ))}
                </Grid>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card style={{ padding: 20 }}>
            <Typography variant="h6" gutterBottom>Evolución del Saldo Total</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={balanceHistory}>
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="saldo" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
  
        <Grid item xs={12} md={6}>
          <Card style={{ padding: 20 }}>
            <Typography variant="h6" gutterBottom>Proyectos por Categoría</Typography>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={proyectosPorCategoria || []}>
                <XAxis dataKey="categoria" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#1976d2" />
                </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
  
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, height: 450 }}>
            <Typography variant="h6" gutterBottom>Ingresos vs Egresos</Typography>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                >
                    {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
                </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
            <Card sx={{ p: 2, height: 450 }}>
            <Typography variant="h6" gutterBottom>
                Participación de Usuarios en Proyectos
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart
                data={ocurrencias}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" />
                <Tooltip />
                <Bar dataKey="projects" fill="#1976d2">
                    <LabelList dataKey="projects" position="right" />
                </Bar>
                </BarChart>
            </ResponsiveContainer>
            </Card>
        </Grid>
      </Grid>
    </Box>
    );
  }
  