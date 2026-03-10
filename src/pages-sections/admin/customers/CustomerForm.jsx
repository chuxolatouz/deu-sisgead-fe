import { 
  Button,
  Card,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Typography
} from "@mui/material";
import { Formik } from "formik";

// ================================================================

// ================================================================

const CustomerForm = (props) => {
  const {
    initialValues,
    validationSchema,
    handleFormSubmit,
    reinitialize = false,
    shrink = false,
    departments = [],
    loadingDepartments = false,
    currentUserRole = "",
    isDepartmentLocked = false,
  } = props;
  
  return (
    <Card
      sx={{
        p: 6,
      }}
    >
      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        enableReinitialize={reinitialize}
        validationSchema={validationSchema}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          setFieldValue,
        }) => (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="nombre"
                  label="Nombre"
                  color="info"
                  size="medium"
                  placeholder={shrink ? "Nombre" : ""}
                  value={values.nombre}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  error={!!touched.nombre && !!errors.nombre}
                  helperText={touched.nombre && errors.nombre}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  rows={6}
                  fullWidth
                  color="info"
                  size="medium"
                  name="email"
                  label="Correo"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder="Correo"
                  value={values.email}
                  error={!!touched.email && !!errors.email}
                  helperText={touched.email && errors.email}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item  xs={12}>
                <TextField
                  rows={6}
                  fullWidth
                  color="info"
                  size="medium"
                  name="password"
                  label="Contraseña"
                  type="password"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder="Contraseña"
                  value={values.password}
                  error={!!touched.password && !!errors.password}
                  helperText={touched.password && errors.password}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              {currentUserRole === "super_admin" && (
                <Grid item xs={12}>
                  <FormControl fullWidth error={!!touched.rol && !!errors.rol}>
                    <InputLabel id="rol-label">Rol</InputLabel>
                    <Select
                      labelId="rol-label"
                      name="rol"
                      label="Rol"
                      value={values.rol}
                      onChange={(event) => {
                        const nextRole = event.target.value;
                        setFieldValue("rol", nextRole);
                        if (nextRole === "super_admin") {
                          setFieldValue("departmentId", "");
                        }
                      }}
                      onBlur={handleBlur}
                    >
                      <MenuItem value="usuario">Usuario</MenuItem>
                      <MenuItem value="admin_departamento">Admin Departamento</MenuItem>
                      <MenuItem value="super_admin">Super Admin</MenuItem>
                    </Select>
                    <FormHelperText>{touched.rol && errors.rol}</FormHelperText>
                  </FormControl>
                </Grid>
              )}

              {currentUserRole !== "super_admin" && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Rol asignado: Usuario
                  </Typography>
                </Grid>
              )}

              {values.rol !== "super_admin" && (
                <Grid item xs={12}>
                  <FormControl fullWidth error={!!touched.departmentId && !!errors.departmentId}>
                    <InputLabel id="department-label">Departamento</InputLabel>
                    <Select
                      labelId="department-label"
                      name="departmentId"
                      label="Departamento"
                      value={values.departmentId || ""}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={isDepartmentLocked || loadingDepartments}
                    >
                      {departments.map((department) => {
                        const departmentId = department?._id?.$oid || department?._id || "";
                        return (
                          <MenuItem key={departmentId} value={departmentId}>
                            {department?.nombre || "Sin nombre"} {department?.codigo ? `(${department.codigo})` : ""}
                          </MenuItem>
                        );
                      })}
                    </Select>
                    <FormHelperText>{touched.departmentId && errors.departmentId}</FormHelperText>
                  </FormControl>
                </Grid>
              )}

              <Grid item sm={6} xs={12}>
                <Button variant="contained" color="info" type="submit">
                  {shrink ? "Actualizar": "Crear"}
                </Button>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </Card>
  );
};
export default CustomerForm;
