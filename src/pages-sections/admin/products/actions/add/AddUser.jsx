import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import Router from "next/router";
import { useSnackbar } from "notistack";
import { useApi } from "contexts/AxiosContext";

const DEFAULT_PROJECT_ROLES = [
  { value: "lider", label: "Líder" },
  { value: "miembro", label: "Miembro" },
];

const getDocumentId = (value) => {
  if (!value) return "";
  if (typeof value === "object") {
    return String(value.$oid || value._id?.$oid || value._id || "").trim();
  }
  return String(value).trim();
};

const normalizeRoles = (items) => {
  if (!Array.isArray(items) || items.length === 0) return DEFAULT_PROJECT_ROLES;

  const normalized = items
    .map((role) => ({
      ...role,
      value: String(role?.value || role?.nombre || "").trim(),
      label: String(role?.label || role?.nombre || role?.value || "").trim(),
    }))
    .filter((role) => role.value && role.label);

  return normalized.length > 0 ? normalized : DEFAULT_PROJECT_ROLES;
};

function AsignarMiembro({ id }) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState(DEFAULT_PROJECT_ROLES);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const { api } = useApi();
  const { enqueueSnackbar } = useSnackbar();

  const projectId = useMemo(() => getDocumentId(id), [id]);

  const handleClose = () => {
    if (submitting) return;
    setOpen(false);
    setSelectedUser("");
    setSelectedRole("");
    setLoadError("");
  };

  const handleAgregarMiembro = async () => {
    const collectedUser = users.find(
      (user) => getDocumentId(user) === selectedUser
    );
    const collectedRole = roles.find((role) => role.value === selectedRole);

    if (!projectId) {
      enqueueSnackbar("No se pudo identificar el proyecto (projectId)", {
        variant: "error",
      });
      return;
    }
    if (!collectedUser) {
      enqueueSnackbar("Selecciona un usuario válido", { variant: "warning" });
      return;
    }
    if (!collectedRole) {
      enqueueSnackbar("Selecciona un rol válido", { variant: "warning" });
      return;
    }

    const data = {
      projectId,
      project_id: projectId,
      proyecto_id: projectId,
      user: collectedUser,
      usuario: collectedUser,
      role: collectedRole,
    };

    try {
      setSubmitting(true);
      await api.patch("/asignar_usuario_proyecto", data);
      enqueueSnackbar("Usuario asignado al proyecto", { variant: "success" });
      Router.reload();
    } catch (error) {
      enqueueSnackbar(
        error?.response?.data?.message ||
          error?.message ||
          "No se pudo asignar el usuario",
        { variant: "error" }
      );
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!open) return undefined;

    let active = true;
    const loadOptions = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const [rolesResponse, usersResponse] = await Promise.all([
          api.get("/roles"),
          api.get("/mostrar_usuarios", { params: { page: 0, limit: 500 } }),
        ]);
        if (!active) return;

        setRoles(normalizeRoles(rolesResponse.data));
        setUsers(
          Array.isArray(usersResponse.data?.request_list)
            ? usersResponse.data.request_list
            : []
        );
      } catch (error) {
        if (!active) return;
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "No se pudieron cargar los usuarios";
        setLoadError(message);
        enqueueSnackbar(message, { variant: "error" });
      } finally {
        if (active) setLoading(false);
      }
    };

    loadOptions();
    return () => {
      active = false;
    };
  }, [api, enqueueSnackbar, open]);

  return (
    <Box>
      <Button variant="outlined" color="success" onClick={() => setOpen(true)}>
        Asignar Miembro
      </Button>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Agregar un usuario al proyecto</DialogTitle>
        <DialogContent>
          {loadError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {loadError}
            </Alert>
          )}

          <Box sx={{ pt: 3, display: "grid", gap: 3 }}>
            <FormControl fullWidth disabled={loading || submitting}>
              <InputLabel id="project-user-select-label">Usuario</InputLabel>
              <Select
                id="project-user-select"
                labelId="project-user-select-label"
                value={selectedUser}
                onChange={(event) => setSelectedUser(event.target.value)}
                label="Usuario"
              >
                {users.map((user) => {
                  const userId = getDocumentId(user);
                  return (
                    <MenuItem key={userId} value={userId}>
                      {user.nombre} {user.email ? `(${user.email})` : ""}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            <FormControl fullWidth disabled={loading || submitting}>
              <InputLabel id="project-role-select-label">
                Rol en el proyecto
              </InputLabel>
              <Select
                id="project-role-select"
                labelId="project-role-select-label"
                value={selectedRole}
                onChange={(event) => setSelectedRole(event.target.value)}
                label="Rol en el proyecto"
              >
                {roles.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    {role.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            color="error"
            variant="outlined"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            color="success"
            variant="contained"
            onClick={handleAgregarMiembro}
            disabled={
              loading ||
              submitting ||
              !projectId ||
              !selectedUser ||
              !selectedRole
            }
          >
            {submitting ? (
              <CircularProgress color="inherit" size={20} />
            ) : (
              "Agregar usuario"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AsignarMiembro;
