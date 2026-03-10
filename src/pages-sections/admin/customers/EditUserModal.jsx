import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Typography,
} from "@mui/material";
import { useApi } from "contexts/AxiosContext";
import { useSnackbar } from "notistack";

const getEntityId = (value) => value?._id?.$oid || value?._id || "";
const getRole = (value) => value?.rol || value?.role || (value?.is_admin ? "super_admin" : "usuario");
const getDepartmentId = (value) => value?.departmentId || value?.departamento_id || "";

const EditUserModal = ({ open, onClose, user: targetUser, onSuccess }) => {
  const { api, user } = useApi();
  const { enqueueSnackbar } = useSnackbar();
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  const actorRole = user?.role || "";
  const actorDepartmentId = getDepartmentId(user);
  const targetRole = getRole(targetUser);
  const canManageUsers = actorRole === "super_admin" || actorRole === "admin_departamento";
  const canSelectDepartment = actorRole === "super_admin";
  const isDepartmentRequired = targetRole !== "super_admin";

  useEffect(() => {
    if (!open) return;
    setNombre(targetUser?.nombre || "");
    setPassword("");
    setDepartmentId(canSelectDepartment ? getDepartmentId(targetUser) : actorDepartmentId);
  }, [open, targetUser, canSelectDepartment, actorDepartmentId]);

  useEffect(() => {
    if (!open || !isDepartmentRequired || !canManageUsers) return;

    const loadDepartments = async () => {
      setLoadingDepartments(true);
      try {
        if (canSelectDepartment) {
          const response = await api.get("/departamentos?limit=200");
          const list = Array.isArray(response.data)
            ? response.data
            : (response.data.request_list || response.data.departamentos || []);
          setDepartments(list);
          return;
        }

        if (actorDepartmentId) {
          const response = await api.get(`/departamentos/${actorDepartmentId}`);
          setDepartments([response.data]);
        } else {
          setDepartments([]);
        }
      } catch (error) {
        if (error.response) {
          enqueueSnackbar(error.response.data.message || "Error al cargar departamentos", { variant: "error" });
        } else {
          enqueueSnackbar(error.message || "Error al cargar departamentos", { variant: "error" });
        }
      } finally {
        setLoadingDepartments(false);
      }
    };

    loadDepartments();
  }, [open, isDepartmentRequired, canManageUsers, canSelectDepartment, actorDepartmentId, api, enqueueSnackbar]);

  const handleUpdate = () => {
    if (!canManageUsers) {
      enqueueSnackbar("No autorizado para editar usuarios", { variant: "error" });
      return;
    }

    const targetUserId = getEntityId(targetUser);
    if (!targetUserId) {
      enqueueSnackbar("Usuario inválido", { variant: "error" });
      return;
    }

    const payload = { nombre };
    if (password.trim() !== "") {
      payload.password = password;
    }

    if (isDepartmentRequired) {
      payload.departmentId = canSelectDepartment ? departmentId : actorDepartmentId;
      if (!payload.departmentId) {
        enqueueSnackbar("El usuario debe tener departamento asociado", { variant: "error" });
        return;
      }
    }

    api.put(`/editar_usuario/${targetUserId}`, payload)
      .then((response) => {
        enqueueSnackbar(response.data.message, { variant: "success" });
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

  if (!targetUser) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Editar Usuario</DialogTitle>
      <DialogContent dividers>
        {!canManageUsers && (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            No autorizado para editar este usuario.
          </Typography>
        )}

        <Box mb={2}>
          <TextField
            label="Nombre"
            fullWidth
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </Box>

        <Box mb={2}>
          <TextField
            label="Nueva Contraseña (opcional)"
            fullWidth
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Box>

        {isDepartmentRequired && (
          <Box mb={1}>
            <FormControl fullWidth disabled={!canSelectDepartment || loadingDepartments || !canManageUsers}>
              <InputLabel id="edit-department-label">Departamento</InputLabel>
              <Select
                labelId="edit-department-label"
                value={canSelectDepartment ? departmentId : actorDepartmentId}
                label="Departamento"
                onChange={(event) => setDepartmentId(event.target.value)}
              >
                {departments.map((department) => {
                  const depId = getEntityId(department);
                  return (
                    <MenuItem key={depId} value={depId}>
                      {department?.nombre || "Sin nombre"} {department?.codigo ? `(${department.codigo})` : ""}
                    </MenuItem>
                  );
                })}
              </Select>
              {!canSelectDepartment && (
                <FormHelperText>Solo puedes usar tu propio departamento.</FormHelperText>
              )}
            </FormControl>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancelar
        </Button>
        <Button onClick={handleUpdate} variant="contained" color="primary" disabled={!canManageUsers}>
          Guardar Cambios
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserModal;
