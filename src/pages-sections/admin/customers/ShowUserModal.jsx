import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Divider,
  Box,
  Chip,
} from "@mui/material";

const ShowUserModal = ({ open, onClose, user }) => {
  if (!user) return null;
  const userRole = user?.rol || user?.role || (user?.is_admin ? 'super_admin' : 'usuario');

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Detalles del Usuario</DialogTitle>
      <DialogContent dividers>
        <Box mb={2}>
          <Typography variant="subtitle2" color="textSecondary">
            ID del Usuario:
          </Typography>
          <Typography variant="body1">
            {user._id?.$oid || "Desconocido"}
          </Typography>
        </Box>

        <Divider />

        <Box mt={2} mb={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Nombre:
          </Typography>
          <Typography variant="body1">{user.nombre}</Typography>
        </Box>

        <Divider />

        <Box mt={2} mb={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Email:
          </Typography>
          <Typography variant="body1">{user.email}</Typography>
        </Box>

        <Divider />

        <Box mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Tipo de cuenta:
          </Typography>
          {userRole === 'super_admin' && <Chip label="Super Admin" color="warning" />}
          {userRole === 'admin_departamento' && <Chip label="Admin Departamento" color="info" />}
          {userRole === 'usuario' && <Chip label="Usuario regular" variant="outlined" />}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShowUserModal;
