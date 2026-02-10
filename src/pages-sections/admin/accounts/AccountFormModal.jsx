import React, { useEffect } from "react";
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
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSnackbar } from "notistack";
import accountsService from "utils/__api__/accounts";

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
  active: Yup.boolean(),
});

const AccountFormModal = ({ open, onClose, account, onSuccess }) => {
  const { enqueueSnackbar } = useSnackbar();
  const isEditing = Boolean(account);

  const formik = useFormik({
    initialValues: {
      code: account?.code || "",
      name: account?.name || "",
      description: account?.description || "",
      active: account?.active !== undefined ? account.active : true,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (isEditing) {
          await accountsService.updateAccount(account._id, values);
          enqueueSnackbar("✓ Cuenta actualizada con éxito", {
            variant: "success",
          });
        } else {
          await accountsService.createAccount(values);
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


