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

const loadDepartmentUsers = async (api, departmentId) => {
  const limit = 100;
  const endpoint = `/departamentos/${departmentId}/usuarios`;
  const firstResponse = await api.get(endpoint, {
    params: { page: 0, limit },
  });
  const firstPage = Array.isArray(firstResponse.data?.request_list)
    ? firstResponse.data.request_list
    : [];
  const count = Number(firstResponse.data?.count) || firstPage.length;
  const pageCount = Math.ceil(count / limit);

  if (pageCount <= 1) return firstPage;

  const remainingResponses = await Promise.all(
    Array.from({ length: pageCount - 1 }, (_, index) =>
      api.get(endpoint, {
        params: { page: index + 1, limit },
      })
    )
  );

  return remainingResponses.reduce((users, response) => {
    const page = Array.isArray(response.data?.request_list)
      ? response.data.request_list
      : [];
    return users.concat(page);
  }, firstPage);
};

function AsignarMiembro({ id, project }) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState(DEFAULT_PROJECT_ROLES);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [loadingSetup, setLoadingSetup] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const { api, user: actor } = useApi();
  const { enqueueSnackbar } = useSnackbar();

  const projectId = useMemo(() => getDocumentId(id), [id]);
  const projectDepartmentId = getDocumentId(
    project?.departmentId || project?.departamento_id
  );
  const actorRole = actor?.role || actor?.rol || "";
  const isSuperAdmin = actorRole === "super_admin";
  const canChooseDepartment = isSuperAdmin && !projectDepartmentId;
  const effectiveDepartmentId = projectDepartmentId || selectedDepartmentId;
  const canAssignUsers = Boolean(projectDepartmentId || isSuperAdmin);
  const loading = loadingSetup || loadingUsers;

  const handleClose = () => {
    if (submitting) return;
    setOpen(false);
    setUsers([]);
    setSelectedDepartmentId(projectDepartmentId);
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
    if (!effectiveDepartmentId) {
      enqueueSnackbar("Selecciona un departamento", { variant: "warning" });
      return;
    }

    const data = {
      projectId,
      project_id: projectId,
      proyecto_id: projectId,
      user: collectedUser,
      usuario: collectedUser,
      role: collectedRole,
      departmentId: effectiveDepartmentId,
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
      setLoadingSetup(true);
      setLoadError("");
      setSelectedDepartmentId(projectDepartmentId);
      setUsers([]);
      setSelectedUser("");

      if (!canAssignUsers) {
        setLoadError(
          "Solo un superadministrador puede seleccionar departamento para un proyecto que no tiene uno asociado."
        );
        setLoadingSetup(false);
        return;
      }

      try {
        const [rolesResponse, departmentsResponse] = await Promise.all([
          api.get("/roles"),
          canChooseDepartment
            ? api.get("/departamentos?activo=true")
            : Promise.resolve({ data: [] }),
        ]);
        if (!active) return;

        setRoles(normalizeRoles(rolesResponse.data));
        setDepartments(
          Array.isArray(departmentsResponse.data)
            ? departmentsResponse.data
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
        if (active) setLoadingSetup(false);
      }
    };

    loadOptions();
    return () => {
      active = false;
    };
  }, [
    api,
    canAssignUsers,
    canChooseDepartment,
    enqueueSnackbar,
    open,
    projectDepartmentId,
  ]);

  useEffect(() => {
    if (!open || !effectiveDepartmentId || !canAssignUsers) {
      setUsers([]);
      return undefined;
    }

    let active = true;
    setLoadingUsers(true);
    setLoadError("");
    loadDepartmentUsers(api, effectiveDepartmentId)
      .then((loadedUsers) => {
        if (!active) return;
        setUsers(loadedUsers);
      })
      .catch((error) => {
        if (!active) return;
        setUsers([]);
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "No se pudieron cargar los usuarios del departamento";
        setLoadError(message);
        enqueueSnackbar(message, { variant: "error" });
      })
      .finally(() => {
        if (active) setLoadingUsers(false);
      });

    return () => {
      active = false;
    };
  }, [api, canAssignUsers, effectiveDepartmentId, enqueueSnackbar, open]);

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
            {canChooseDepartment && (
              <FormControl fullWidth disabled={loadingSetup || submitting}>
                <InputLabel id="project-department-select-label">
                  Departamento
                </InputLabel>
                <Select
                  id="project-department-select"
                  labelId="project-department-select-label"
                  value={selectedDepartmentId}
                  onChange={(event) => {
                    setSelectedDepartmentId(event.target.value);
                    setSelectedUser("");
                  }}
                  label="Departamento"
                >
                  {departments.map((department) => {
                    const departmentId = getDocumentId(department);
                    return (
                      <MenuItem key={departmentId} value={departmentId}>
                        {department?.nombre || "Sin nombre"}
                        {department?.codigo ? ` (${department.codigo})` : ""}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            )}

            <FormControl
              fullWidth
              disabled={
                loading ||
                submitting ||
                !effectiveDepartmentId ||
                !canAssignUsers
              }
            >
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

            {effectiveDepartmentId && !loadingUsers && users.length === 0 && (
              <Alert severity="info">
                No hay usuarios disponibles en el departamento seleccionado.
              </Alert>
            )}

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
              !effectiveDepartmentId ||
              !canAssignUsers ||
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
