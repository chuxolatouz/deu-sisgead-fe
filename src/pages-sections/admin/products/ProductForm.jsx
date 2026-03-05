import { useState, useEffect, useMemo } from "react";
import { Button, Card, Grid, MenuItem, TextField, Box } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import enGB from 'date-fns/locale/en-GB';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Formik, FieldArray } from "formik";
import { useApi } from "contexts/AxiosContext";
import { useSnackbar } from "notistack";
import { parseSafeDate } from "lib";

// ================================================================

// ================================================================

const normalizeCategoryReference = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    if (value.$oid) return String(value.$oid);
    if (value.value) return String(value.value);
  }
  return String(value).trim();
};

const categoryMatchesReference = (category, reference) => {
  const ref = normalizeCategoryReference(reference);
  if (!ref) return false;
  const categoryId = normalizeCategoryReference(category?._id);
  const categoryValue = normalizeCategoryReference(category?.value);
  return ref === categoryId || ref === categoryValue;
};

const ProductForm = (props) => {
  const [categories, setCategories] = useState([]);
  const { api } = useApi();
  const { enqueueSnackbar } = useSnackbar();
  const {
    initialValues,
    validationSchema,
    handleFormSubmit,
    reinitialize = false,
    shrink = false,
    selectedCategory = null,
  } = props;
  const normalizedSelectedCategory = useMemo(
    () => normalizeCategoryReference(selectedCategory),
    [selectedCategory]
  );

  useEffect(() => {
    let cancelled = false;
    const loadCategories = async () => {
      try {
        const activeResponse = await api.get("/mostrar_categorias?activeOnly=true");
        let mergedCategories = Array.isArray(activeResponse.data) ? activeResponse.data : [];

        if (normalizedSelectedCategory) {
          const existsInActive = mergedCategories.some((category) =>
            categoryMatchesReference(category, normalizedSelectedCategory)
          );
          if (!existsInActive) {
            const allResponse = await api.get(
              "/mostrar_categorias?includeInactive=true&includeDeleted=true"
            );
            const allCategories = Array.isArray(allResponse.data) ? allResponse.data : [];
            const currentCategory = allCategories.find((category) =>
              categoryMatchesReference(category, normalizedSelectedCategory)
            );
            if (currentCategory) {
              mergedCategories = [currentCategory, ...mergedCategories];
            }
          }
        }

        const uniqueCategories = [];
        const seenKeys = new Set();
        mergedCategories.forEach((category) => {
          const key = normalizeCategoryReference(category?._id || category?.value);
          if (!key || seenKeys.has(key)) return;
          seenKeys.add(key);
          uniqueCategories.push(category);
        });

        if (!cancelled) {
          setCategories(uniqueCategories);
        }
      } catch (error) {
        if (error.response) {
          enqueueSnackbar(error.response.data.message, { variant: "error" });
        } else {
          enqueueSnackbar(error.message, { variant: "error" });
        }
      }
    };

    loadCategories();
    return () => {
      cancelled = true;
    };
  }, [api, enqueueSnackbar, normalizedSelectedCategory]);

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
              <Grid item sm={6} xs={12}>
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
              <Grid item sm={6} xs={12}>
                <TextField
                  select
                  fullWidth
                  color="info"
                  size="medium"
                  name="categoria"
                  onBlur={handleBlur}
                  placeholder="Categoria"
                  onChange={(e) => {
                    handleChange(e);
                  }}
                  value={values.categoria ? values.categoria : ""}
                  label="Seleccionar Categoria"
                  error={!!touched.categoria && !!errors.categoria}
                  helperText={touched.categoria && errors.categoria}
                >
                  {categories.map((category) => {
                    const categoryValue = category._id || category.value;
                    const isCurrentCategory = categoryMatchesReference(category, values.categoria);
                    const disabled = (category.eliminado || category.activo === false) && !isCurrentCategory;
                    const statusSuffix = category.eliminado
                      ? " (eliminada)"
                      : category.activo === false
                      ? " (deshabilitada)"
                      : "";

                    return (
                      <MenuItem
                        key={categoryValue}
                        value={categoryValue}
                        disabled={disabled}
                      >
                        {`${category.nombre}${statusSuffix}`}
                      </MenuItem>
                    );
                  })}
                </TextField>
              </Grid>


              <Grid item xs={12}>
                <TextField
                  rows={6}
                  multiline
                  fullWidth
                  color="info"
                  size="medium"
                  name="descripcion"
                  label="Descripción"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder="Descripción"
                  value={values.descripcion}
                  error={!!touched.descripcion && !!errors.descripcion}
                  helperText={touched.descripcion && errors.descripcion}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  rows={6}
                  multiline
                  fullWidth
                  color="info"
                  size="medium"
                  name="objetivo_general"
                  label="Objetivo General"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder="Objetivo General"
                  value={values.objetivo_general}
                  error={!!touched.objetivo_general && !!errors.objetivo_general}
                  helperText={touched.objetivo_general && errors.objetivo_general}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              {/* Dynamic TextFields for objetivos_especificos */}
              <Grid item xs={12}>
                <FieldArray name="objetivos_especificos">
                  {({ push, remove }) => (
                    <Box>
                      <Box mb={2}>
                        <Button variant="contained" onClick={() => push("")}>
                          Añadir Objetivo Específico
                        </Button>
                      </Box>
                      {values.objetivos_especificos.map((_, index) => (
                        <Box key={`${index}-objet`} display="flex" alignItems="center" mb={2}>
                          <TextField
                            fullWidth
                            label={`Objetivo Específico ${index + 1}`}
                            name={`objetivos_especificos[${index}]`}
                            value={values.objetivos_especificos[index]}
                            onChange={handleChange}
                          />
                          <Button
                            color="secondary"
                            onClick={() => remove(index)}
                            style={{ marginLeft: "8px" }}
                          >
                            Eliminar
                          </Button>
                        </Box>
                      ))}
                    </Box>
                  )}
                </FieldArray>
              </Grid>

              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
                <Grid item md={6} xs={12}>

                  <DatePicker
                    label="Fecha de Inicio"
                    // maxDate={new Date()}
                    value={parseSafeDate(values.fecha_inicio)}
                    onChange={(newValue) =>
                      setFieldValue("fecha_inicio", newValue)
                    }
                    slots={{
                      textField: TextField,
                    }}
                    slotProps={{
                      textField: {
                        sx: {
                          mb: 1,
                        },
                        size: "medium",
                        fullWidth: true,
                        value: values.fecha_inicio,
                        helperText: touched.fecha_inicio && errors.fecha_inicio,
                        error: Boolean(
                          !!touched.fecha_inicio && !!errors.fecha_inicio
                        ),
                      },
                    }}
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <DatePicker
                    label="Fecha Fin"
                    // maxDate={new Date()}
                    value={parseSafeDate(values.fecha_fin)}
                    onChange={(newValue) =>
                      setFieldValue("fecha_fin", newValue)
                    }
                    slots={{
                      textField: TextField,
                    }}
                    slotProps={{
                      textField: {
                        sx: {
                          mb: 1,
                        },
                        size: "medium",
                        fullWidth: true,
                        value: values.fecha_fin,
                        helperText: touched.fecha_fin && errors.fecha_fin,
                        error: Boolean(
                          !!touched.fecha_fin && !!errors.fecha_fin
                        ),
                      },
                    }}
                  />
                </Grid>
              </LocalizationProvider>


              <Grid item sm={6} xs={12}>
                <Button variant="contained" color="info" type="submit">
                  {shrink ? "Actualizar" : "Crear"}
                </Button>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </Card>
  );
};
export default ProductForm;
