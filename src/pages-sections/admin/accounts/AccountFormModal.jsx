import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControlLabel,
  Switch,
  CircularProgress,
  IconButton,
  Chip,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  OutlinedInput,
  Alert,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSnackbar } from "notistack";
import accountsService from "utils/__api__/accounts";
import { useApi } from "contexts/AxiosContext";

// Esquema de validación con Yup
const validationSchema = Yup.object({
  code: Yup.string()
    .required("El código es requerido")
    .matches(
      /^[0-9.]+$/,
      "El código debe contener solo números y puntos"
    ),
  name: Yup.string()
    .required("El nombre es requerido")
    .min(3, "El nombre debe tener al menos 3 caracteres"),
  description: Yup.string(),
  departments: Yup.array(),
  active: Yup.boolean(),
});

const AccountFormModal = ({ open, onClose, account, onSuccess }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { user, api } = useApi();
  const isEditing = Boolean(account);
  const isSuperAdmin = user?.role === 'super_admin';

  // Estado para departamentos
  const [departamentos, setDepartamentos] = useState([]);
  const [loadingDepartamentos, setLoadingDepartamentos] = useState(false);

  // Cargar departamentos al abrir el modal (solo para super_admin)
  useEffect(() => {
    if (open && isSuperAdmin) {
      loadDepartamentos();
    }
  }, [open, isSuperAdmin]);

  const loadDepartamentos = async () => {
    try {
      setLoadingDepartamentos(true);
      const response = await api.get('/departamentos?limit=100');
      const departamentosList = Array.isArray(response.data)
        ? response.data
        : (response.data.departamentos || response.data.request_list || []);
      setDepartamentos(departamentosList);
    } catch (error) {
      console.error('Error al cargar departamentos:', error);
      enqueueSnackbar('Error al cargar departamentos', { variant: 'warning' });
    } finally {
      setLoadingDepartamentos(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      code: account?.code || "",
      name: account?.name || "",
      description: account?.description || "",
      departments: account?.departments || [],
      active: account?.active !== undefined ? account.active : true,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // Preparar datos según el rol
        const dataToSend = { ...values };
        if (!isSuperAdmin) {
          // Los usuarios normales no envían departments, se asigna automáticamente en el backend
          delete dataToSend.departments;
        }

        if (isEditing) {
          await accountsService.updateAccount(account._id, dataToSend);
          enqueueSnackbar("✓ Cuenta actualizada con éxito", {
            variant: "success",
          });
        } else {
          await accountsService.createAccount(dataToSend);
          enqueueSnackbar("✓ Cuenta creada con éxito", {
            variant: "success",
          });
        }
        onSuccess();
        handleClose();
      } catch (error) {
        enqueueSnackbar(error.message || "Error al guardar cuenta", {
          variant: "error",
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  // Verificar si el código ya existe (solo para nuevas cuentas)
  const checkCodeExists = async (code) => {
    if (!code || isEditing) return;
    try {
      await accountsService.getAccountByCode(code);
      formik.setFieldError("code", "Ya existe una cuenta con este código");
    } catch (error) {
      // Si no encuentra la cuenta, está disponible
      if (error.message === "Cuenta no encontrada") {
        // Código disponible
      }
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEditing ? "Editar Cuenta Contable" : "Nueva Cuenta Contable"}
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers>
          <Box mb={2}>
            <TextField
              fullWidth
              label="Código de Cuenta *"
              name="code"
              placeholder="Ej: 1.1.07"
              value={formik.values.code}
              onChange={formik.handleChange}
              onBlur={(e) => {
                formik.handleBlur(e);
                checkCodeExists(e.target.value);
              }}
              error={formik.touched.code && Boolean(formik.errors.code)}
              helperText={
                formik.touched.code && formik.errors.code
                  ? formik.errors.code
                  : "Debe ser único en el sistema"
              }
              disabled={isEditing}
            />
          </Box>

          <Box mb={2}>
            <TextField
              fullWidth
              label="Nombre de la Cuenta *"
              name="name"
              placeholder="Ej: Fondo Fijo de Caja Chica"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
          </Box>

          <Box mb={2}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Descripción"
              name="description"
              placeholder="Descripción detallada de la cuenta contable"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.description && Boolean(formik.errors.description)
              }
              helperText={formik.touched.description && formik.errors.description}
            />
          </Box>

          {/* Selector de Departamentos - Solo para Super Admin */}
          {isSuperAdmin ? (
            <Box mb={2}>
              <FormControl fullWidth>
                <InputLabel id="departments-label">Departamentos</InputLabel>
                <Select
                  labelId="departments-label"
                  multiple
                  name="departments"
                  value={formik.values.departments}
                  onChange={formik.handleChange}
                  input={<OutlinedInput label="Departamentos" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.length === 0 ? (
                        <Chip label="Todos los departamentos" size="small" />
                      ) : (
                        selected.map((value) => {
                          const dept = departamentos.find(d => d._id === value);
                          return (
                            <Chip 
                              key={value} 
                              label={dept?.nombre || value} 
                              size="small" 
                            />
                          );
                        })
                      )}
                    </Box>
                  )}
                  disabled={loadingDepartamentos}
                >
                  {loadingDepartamentos ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} /> Cargando...
                    </MenuItem>
                  ) : departamentos.length > 0 ? (
                    departamentos.map((dept) => (
                      <MenuItem key={dept._id} value={dept._id}>
                        {dept.nombre}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No hay departamentos disponibles</MenuItem>
                  )}
                </Select>
                <Box
                  component="p"
                  sx={{
                    fontSize: "0.75rem",
                    color: "text.secondary",
                    mt: 0.5,
                  }}
                >
                  Selecciona los departamentos que pueden usar esta cuenta. Si no seleccionas ninguno, estará disponible para todos.
                </Box>
              </FormControl>
            </Box>
          ) : (
            <Box mb={2}>
              <Alert severity="info" sx={{ fontSize: "0.85rem" }}>
                Esta cuenta se asignará automáticamente a tu departamento.
              </Alert>
            </Box>
          )}

          <Box>
            <FormControlLabel
              control={
                <Switch
                  name="active"
                  checked={formik.values.active}
                  onChange={formik.handleChange}
                  color="primary"
                />
              }
              label="Cuenta Activa"
            />
            <Box
              component="p"
              sx={{
                fontSize: "0.75rem",
                color: "text.secondary",
                mt: 0.5,
                ml: 4,
              }}
            >
              Las cuentas inactivas no se pueden usar en nuevas transacciones
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} color="secondary" disabled={formik.isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={formik.isSubmitting || !formik.isValid}
            startIcon={
              formik.isSubmitting ? <CircularProgress size={16} /> : null
            }
          >
            {formik.isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AccountFormModal;



