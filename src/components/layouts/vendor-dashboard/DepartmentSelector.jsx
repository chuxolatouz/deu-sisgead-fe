import { useState, useEffect } from 'react';
import {
  Box,
  Select,
  MenuItem,
  FormControl,
  Chip,
  Typography,
  Button,
  Popover,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress
} from '@mui/material';
import { Business, ExitToApp } from '@mui/icons-material';
import { useDepartment } from 'contexts/DepartmentContext';
import { useApi } from 'contexts/AxiosContext';
import { useSnackbar } from 'notistack';
import { useRouter } from 'next/router';

const DepartmentSelector = () => {
  const { departamentoContexto, departamentoData, usandoContexto, salirDelContexto, ingresarADepartamento, loading } = useDepartment();
  const { api, user } = useApi();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const [departamentos, setDepartamentos] = useState([]);
  const [loadingDepartamentos, setLoadingDepartamentos] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // Solo mostrar para super_admin
  if (user?.role !== 'super_admin') {
    return null;
  }

  useEffect(() => {
    if (usandoContexto || anchorEl) {
      fetchDepartamentos();
    }
  }, [usandoContexto, anchorEl]);

  const fetchDepartamentos = async () => {
    setLoadingDepartamentos(true);
    try {
      const response = await api.get('/departamentos?limit=100');
      const departamentosList = Array.isArray(response.data)
        ? response.data
        : (response.data.departamentos || response.data.request_list || []);
      setDepartamentos(departamentosList);
    } catch (error) {
      console.error('Error al cargar departamentos:', error);
    } finally {
      setLoadingDepartamentos(false);
    }
  };

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectDepartment = async (departamento) => {
    try {
      await ingresarADepartamento(
        departamento._id?.$oid || departamento._id,
        departamento
      );
      enqueueSnackbar(`Cambiaste al departamento: ${departamento.nombre}`, { variant: 'success' });
      handleClose();
      // Recargar la página actual para aplicar el contexto
      router.reload();
    } catch (error) {
      if (error.response) {
        enqueueSnackbar(error.response.data.message || 'Error al cambiar de departamento', { variant: 'error' });
      } else {
        enqueueSnackbar(error.message || 'Error al cambiar de departamento', { variant: 'error' });
      }
    }
  };

  const handleExitContext = () => {
    salirDelContexto();
    enqueueSnackbar('Saliste del contexto del departamento', { variant: 'info' });
    handleClose();
    // Redirigir a la lista de departamentos
    router.push('/admin/departamentos');
  };

  const open = Boolean(anchorEl);

  return (
    <Box>
      {usandoContexto ? (
        <Chip
          icon={<Business />}
          label={departamentoData?.nombre || 'Departamento'}
          onClick={handleOpen}
          color="primary"
          sx={{
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
          }}
        />
      ) : (
        <Button
          variant="outlined"
          size="small"
          startIcon={<Business />}
          onClick={handleOpen}
          sx={{
            textTransform: 'none',
            minWidth: 'auto',
            px: 2,
          }}
        >
          Ver como departamento
        </Button>
      )}

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ minWidth: 300, maxWidth: 400, maxHeight: 500, overflow: 'auto' }}>
          <Box sx={{ p: 2, pb: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              {usandoContexto ? 'Cambiar Departamento' : 'Ingresar a Departamento'}
            </Typography>
            {usandoContexto && departamentoData && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Actual: <strong>{departamentoData.nombre}</strong>
              </Typography>
            )}
          </Box>

          <Divider />

          {loadingDepartamentos ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <List sx={{ py: 0 }}>
              {departamentos.map((departamento) => {
                const departamentoId = departamento._id?.$oid || departamento._id;
                const isCurrent = usandoContexto && departamentoContexto === departamentoId;
                
                return (
                  <ListItem
                    key={departamentoId}
                    button
                    onClick={() => !isCurrent && handleSelectDepartment(departamento)}
                    disabled={isCurrent || loading}
                    sx={{
                      '&:hover': {
                        backgroundColor: isCurrent ? 'transparent' : 'action.hover',
                      },
                      opacity: isCurrent ? 0.6 : 1,
                    }}
                  >
                    <ListItemText
                      primary={departamento.nombre}
                      secondary={departamento.codigo}
                    />
                    {isCurrent && (
                      <Chip
                        label="Actual"
                        size="small"
                        color="primary"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </ListItem>
                );
              })}
            </List>
          )}

          {usandoContexto && (
            <>
              <Divider />
              <Box sx={{ p: 1 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  startIcon={<ExitToApp />}
                  onClick={handleExitContext}
                  disabled={loading}
                  sx={{ textTransform: 'none' }}
                >
                  Salir del contexto
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Popover>
    </Box>
  );
};

export default DepartmentSelector;

