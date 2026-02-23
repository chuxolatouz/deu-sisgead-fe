import {
    Dialog,
    DialogTitle,
    DialogActions,
    DialogContent,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
  } from "@mui/material";
  import { useEffect, useState } from "react";
  import { useApi } from "contexts/AxiosContext";
  import { useSnackbar } from "notistack";
  
  const ChangeRoleUserModal = ({ open, onClose, user, onSuccess }) => {
  const [selectedRole, setSelectedRole] = useState(
    user?.rol || user?.role || (user?.is_admin ? "super_admin" : "usuario")
  );
  const { api } = useApi();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    setSelectedRole(user?.rol || user?.role || (user?.is_admin ? "super_admin" : "usuario"));
  }, [user]);
  
  const handleChangeRole = () => {
    const data = {
      id: user._id.$oid,
      rol: selectedRole,
    };
  
      api.post("/cambiar_rol_usuario", data)
        .then((res) => {
          enqueueSnackbar(res.data.message, { variant: "success" });
          onSuccess();
          onClose();
        })
        .catch((error) => {
          if (error.response) {
            enqueueSnackbar(error.response.data.message, { variant: "error" });
          } else {
            enqueueSnackbar(error.message, { variant: "error" });
          }
        });
    };
  
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Cambiar rol del usuario</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="role-label">Rol</InputLabel>
            <Select
              labelId="role-label"
              value={selectedRole}
              label="Rol"
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <MenuItem value="usuario">Usuario</MenuItem>
              <MenuItem value="admin_departamento">Admin Departamento</MenuItem>
              <MenuItem value="super_admin">Super Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant="outlined" color="error">Cancelar</Button>
          <Button onClick={handleChangeRole} variant="outlined" color="success">Guardar Cambios</Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  export default ChangeRoleUserModal;
  
