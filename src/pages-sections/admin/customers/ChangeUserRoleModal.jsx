import { useEffect, useMemo, useState } from "react";
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
  FormHelperText,
  Typography,
} from "@mui/material";
import { useApi } from "contexts/AxiosContext";
import { useSnackbar } from "notistack";

const getUserId = (value) => value?._id?.$oid || value?._id || "";
const getDepartmentId = (value) => value?.departmentId || value?.departamento_id || "";
const getRole = (value) => value?.rol || value?.role || (value?.is_admin ? "super_admin" : "usuario");

const ChangeRoleUserModal = ({ open, onClose, user: targetUser, onSuccess }) => {
  const { api, user } = useApi();
  const { enqueueSnackbar } = useSnackbar();
  const [selectedRole, setSelectedRole] = useState("usuario");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  const actorRole = user?.role || "";
  const actorDepartmentId = getDepartmentId(user);
  const canManageUsers = actorRole === "super_admin" || actorRole === "admin_departamento";
  const canAssignAllRoles = actorRole === "super_admin";
  const targetRole = getRole(targetUser);
  const targetDepartmentId = getDepartmentId(targetUser);

  useEffect(() => {
    if (!open) return;
    const defaultRole = canAssignAllRoles ? targetRole : "usuario";
    const defaultDepartment = canAssignAllRoles ? targetDepartmentId : actorDepartmentId;
    setSelectedRole(defaultRole || "usuario");
    setSelectedDepartmentId(defaultDepartment || "");
  }, [open, canAssignAllRoles, targetRole, targetDepartmentId, actorDepartmentId]);

  useEffect(() => {
    if (!open || !canManageUsers) return;
    const loadDepartments = async () => {
      setLoadingDepartments(true);
      try {
        if (canAssignAllRoles) {
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
  }, [open, canManageUsers, canAssignAllRoles, actorDepartmentId, api, enqueueSnackbar]);

  const roleOptions = useMemo(() => {
    if (!canAssignAllRoles) {
      return [{ value: "usuario", label: "Usuario" }];
    }
    return [
      { value: "usuario", label: "Usuario" },
      { value: "admin_departamento", label: "Admin Departamento" },
      { value: "super_admin", label: "Super Admin" },
    ];
  }, [canAssignAllRoles]);

  const handleChangeRole = () => {
    if (!canManageUsers) {
      enqueueSnackbar("No autorizado para cambiar roles", { variant: "error" });
      return;
    }

    const userId = getUserId(targetUser);
    if (!userId) {
      enqueueSnackbar("Usuario inválido", { variant: "error" });
      return;
    }

    const payload = {
      id: userId,
      rol: selectedRole,
    };

    if (selectedRole !== "super_admin") {
      payload.departmentId = canAssignAllRoles ? selectedDepartmentId : actorDepartmentId;
      if (!payload.departmentId) {
        enqueueSnackbar("Debes seleccionar un departamento", { variant: "error" });
        return;
      }
    }

    api.post("/cambiar_rol_usuario", payload)
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
        {!canManageUsers && (
          <Typography color="error" variant="body2" sx={{ mt: 2 }}>
            No autorizado para gestionar roles.
          </Typography>
        )}

        <FormControl fullWidth sx={{ mt: 2 }} disabled={!canAssignAllRoles || !canManageUsers}>
          <InputLabel id="role-label">Rol</InputLabel>
          <Select
            labelId="role-label"
            value={selectedRole}
            label="Rol"
            onChange={(e) => {
              const nextRole = e.target.value;
              setSelectedRole(nextRole);
              if (nextRole === "super_admin") {
                setSelectedDepartmentId("");
              }
            }}
          >
            {roleOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {!canAssignAllRoles && (
            <FormHelperText>Solo puedes asignar el rol Usuario.</FormHelperText>
          )}
        </FormControl>

        {selectedRole !== "super_admin" && (
          <FormControl fullWidth sx={{ mt: 2 }} disabled={!canManageUsers || !canAssignAllRoles || loadingDepartments}>
            <InputLabel id="department-label">Departamento</InputLabel>
            <Select
              labelId="department-label"
              value={canAssignAllRoles ? selectedDepartmentId : actorDepartmentId}
              label="Departamento"
              onChange={(e) => setSelectedDepartmentId(e.target.value)}
            >
              {departments.map((department) => {
                const departmentId = getUserId(department);
                return (
                  <MenuItem key={departmentId} value={departmentId}>
                    {department?.nombre || "Sin nombre"} {department?.codigo ? `(${department.codigo})` : ""}
                  </MenuItem>
                );
              })}
            </Select>
            {!canAssignAllRoles && (
              <FormHelperText>Como admin de departamento, solo puedes usar tu departamento.</FormHelperText>
            )}
          </FormControl>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="error">Cancelar</Button>
        <Button onClick={handleChangeRole} variant="outlined" color="success" disabled={!canManageUsers}>
          Guardar Cambios
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangeRoleUserModal;
