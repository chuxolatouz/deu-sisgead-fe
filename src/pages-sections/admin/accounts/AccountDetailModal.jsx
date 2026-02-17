import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Chip,
  Divider,
  IconButton,
  Grid,
  Typography,
} from "@mui/material";
import { Close, Edit, ToggleOff, ToggleOn } from "@mui/icons-material";
import { format } from "date-fns";
import es from "date-fns/locale/es/index.js";
import { useApi } from "contexts/AxiosContext";

const AccountDetailModal = ({ open, onClose, account, onEdit, onToggleStatus }) => {
  const { user } = useApi();
  const isSuperAdmin = user?.role === 'super_admin';
  
  if (!account) return null;

  const { code, name, description, departments = [], active, created_at, updated_at, created_by } =
    account;

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: es });
    } catch (error) {
      return dateString;
    }
  };

  const handleToggle = async () => {
    try {
      await onToggleStatus(account._id, !active);
      onClose();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h6" component="span">
              {code} - {name}
            </Typography>
            <Chip
              label={active ? "Activo" : "Inactivo"}
              color={active ? "success" : "default"}
              size="small"
            />
          </Box>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Información General */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom color="primary">
            Información General
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Código:
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {code}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Estado:
              </Typography>
              <Chip
                label={active ? "Activo" : "Inactivo"}
                color={active ? "success" : "default"}
                size="small"
                sx={{ mt: 0.5 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Nombre:
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {name}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Descripción:
              </Typography>
              <Typography variant="body1">
                {description || "Sin descripción"}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Departamentos:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {departments && departments.length > 0 ? (
                  departments.map((dept, index) => (
                    <Chip
                      key={index}
                      label={dept}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  ))
                ) : (
                  <Chip
                    label="Todos los departamentos"
                    size="small"
                    variant="outlined"
                    color="default"
                  />
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Metadatos */}
        <Box>
          <Typography variant="h6" gutterBottom color="primary">
            Metadatos
          </Typography>
          <Grid container spacing={2}>
            {created_by && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Creado por:
                </Typography>
                <Typography variant="body1">{created_by}</Typography>
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Fecha de creación:
              </Typography>
              <Typography variant="body1">{formatDate(created_at)}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Última actualización:
              </Typography>
              <Typography variant="body1">{formatDate(updated_at)}</Typography>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {isSuperAdmin ? (
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              color={active ? "error" : "success"}
              startIcon={active ? <ToggleOff /> : <ToggleOn />}
              onClick={handleToggle}
            >
              {active ? "Desactivar" : "Activar"}
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Edit />}
              onClick={() => {
                onEdit(account);
                onClose();
              }}
            >
              Editar Cuenta
            </Button>
          </Box>
        ) : (
          <Button onClick={onClose} color="primary" variant="contained">
            Cerrar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AccountDetailModal;



