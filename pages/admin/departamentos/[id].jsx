import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Box, Card, Grid, Chip, Tabs, Tab } from "@mui/material";
import VendorDashboardLayout from "components/layouts/vendor-dashboard";
import { H2, H5, Paragraph } from "components/Typography";
import BazaarBreadcrumb from "components/BazaarBreadcrumb";
import DepartmentProjects from "pages-sections/admin/departamentos/DepartmentProjects";
import DepartmentUsers from "pages-sections/admin/departamentos/DepartmentUsers";
import { useApi } from "contexts/AxiosContext";
import { useSnackbar } from "notistack";

// =============================================================================
DepartamentoDetail.getLayout = function getLayout(page) {
  return <VendorDashboardLayout>{page}</VendorDashboardLayout>;
};
// =============================================================================

export default function DepartamentoDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [departamento, setDepartamento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const { api } = useApi();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (id) {
      fetchDepartamento();
    }
  }, [id]);

  const fetchDepartamento = () => {
    setLoading(true);
    api.get(`/departamentos/${id}`)
      .then((response) => {
        setDepartamento(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        if (error.response) {
          enqueueSnackbar(error.response.data.message || 'Error al cargar departamento', { variant: 'error' });
        } else {
          enqueueSnackbar(error.message, { variant: 'error' });
        }
      });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const dateValue = dateString.$date || dateString;
      const date = new Date(dateValue);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '-';
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const breadcrumbItems = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Departamentos", href: "/admin/departamentos" },
    { label: departamento?.nombre || "Cargando...", href: "#" },
  ];

  if (loading) {
    return (
      <Box py={4}>
        <Paragraph>Cargando...</Paragraph>
      </Box>
    );
  }

  if (!departamento) {
    return (
      <Box py={4}>
        <Paragraph>Departamento no encontrado</Paragraph>
      </Box>
    );
  }

  return (
    <Box py={4}>
      <BazaarBreadcrumb items={breadcrumbItems} />
      
      {/* Department Header */}
      <Card sx={{ p: 4, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box>
            <H2 mb={1}>{departamento.nombre}</H2>
            <Paragraph color="grey.600" fontSize={16}>
              Código: <strong>{departamento.codigo}</strong>
            </Paragraph>
          </Box>
          <Chip
            label={departamento.activo ? "Activo" : "Inactivo"}
            color={departamento.activo ? "success" : "default"}
            size="medium"
          />
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box mb={2}>
              <H5 color="grey.600" mb={1}>Descripción</H5>
              <Paragraph>{departamento.descripcion || 'Sin descripción'}</Paragraph>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box mb={2}>
              <H5 color="grey.600" mb={1}>Fecha de Creación</H5>
              <Paragraph>{formatDate(departamento.fecha_creacion)}</Paragraph>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Tabs for Projects and Users */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Proyectos" />
          <Tab label="Usuarios" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box>
        {activeTab === 0 && <DepartmentProjects departamentoId={id} />}
        {activeTab === 1 && <DepartmentUsers departamentoId={id} />}
      </Box>
    </Box>
  );
}

