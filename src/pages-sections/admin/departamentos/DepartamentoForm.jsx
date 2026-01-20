import { Card, Grid, TextField, Box, FormControlLabel, Switch } from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import { LoadingButton } from "@mui/lab";

const DepartamentoForm = ({ initialValues, handleFormSubmit, validationSchema }) => {
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
  } = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handleFormSubmit,
    enableReinitialize: true,
  });

  return (
    <Card
      sx={{
        p: 6,
      }}
    >
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item sm={6} xs={12}>
            <TextField
              fullWidth
              name="nombre"
              label="Nombre del Departamento"
              color="info"
              size="medium"
              placeholder="Ej: Recursos Humanos"
              value={values.nombre}
              onBlur={handleBlur}
              onChange={handleChange}
              error={!!touched.nombre && !!errors.nombre}
              helperText={touched.nombre && errors.nombre}
            />
          </Grid>

          <Grid item sm={6} xs={12}>
            <TextField
              fullWidth
              name="codigo"
              label="Código"
              color="info"
              size="medium"
              placeholder="Ej: RH-001"
              value={values.codigo}
              onBlur={handleBlur}
              onChange={handleChange}
              error={!!touched.codigo && !!errors.codigo}
              helperText={touched.codigo && errors.codigo}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              name="descripcion"
              label="Descripción"
              color="info"
              size="medium"
              placeholder="Descripción del departamento..."
              value={values.descripcion}
              onBlur={handleBlur}
              onChange={handleChange}
              error={!!touched.descripcion && !!errors.descripcion}
              helperText={touched.descripcion && errors.descripcion}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={values.activo}
                  onChange={(e) => setFieldValue('activo', e.target.checked)}
                  name="activo"
                  color="primary"
                />
              }
              label="Departamento Activo"
            />
          </Grid>
        </Grid>

        <Box mt={4}>
          <LoadingButton
            type="submit"
            color="primary"
            variant="contained"
            size="large"
          >
            Guardar Departamento
          </LoadingButton>
        </Box>
      </form>
    </Card>
  );
};

export default DepartamentoForm;

