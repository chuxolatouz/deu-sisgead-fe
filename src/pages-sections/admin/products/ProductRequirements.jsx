import {
  Alert,
  Box,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

const legacyRequirements = [
  { key: "materiales_necesarios", label: "Materiales necesarios" },
  { key: "recursos_humanos", label: "Recursos humanos" },
  { key: "logistica", label: "Logística" },
];

const ProductRequirements = ({ project }) => {
  const catalogRequirements = Array.isArray(project?.requerimientos)
    ? project.requerimientos
    : [];
  const hasLegacyRequirements = legacyRequirements.some(({ key }) =>
    String(project?.[key] || "").trim()
  );

  return (
    <Box>
      <Typography variant="h5" mb={0.5}>
        Requerimientos del proyecto
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Cada requerimiento conserva la cuenta contable definida en el catálogo.
      </Typography>

      {catalogRequirements.length ? (
        <Grid container spacing={2} alignItems="stretch">
          {catalogRequirements.map((requirement) => {
            const account = requirement.account || {};
            return (
              <Grid
                item
                md={6}
                xs={12}
                key={requirement.requirementId || requirement.nombre}
              >
                <Paper variant="outlined" sx={{ height: "100%", p: 2 }}>
                  <Stack spacing={1.5}>
                    <Typography variant="h6">{requirement.nombre}</Typography>
                    {requirement.descripcion && (
                      <Typography color="text.secondary">
                        {requirement.descripcion}
                      </Typography>
                    )}
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip
                        size="small"
                        color="primary"
                        variant="outlined"
                        label={requirement.accountCode}
                      />
                      <Chip
                        size="small"
                        color={account.isHeader ? "warning" : "success"}
                        variant="outlined"
                        label={
                          account.isHeader ? "Cuenta titular" : "Cuenta detalle"
                        }
                      />
                      <Chip
                        size="small"
                        label={`Nivel ${account.level || "-"}`}
                      />
                    </Stack>
                    <Typography variant="body2">
                      {account.description || "Cuenta sin descripción"}
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Alert severity="info">
          Este proyecto no tiene requerimientos del catálogo asociados.
        </Alert>
      )}

      {hasLegacyRequirements && (
        <Box mt={4}>
          <Typography variant="h6" mb={2}>
            Requerimientos descriptivos anteriores
          </Typography>
          <Grid container spacing={2}>
            {legacyRequirements.map(({ key, label }) => {
              const value = String(project?.[key] || "").trim();
              if (!value) return null;
              return (
                <Grid item md={4} xs={12} key={key}>
                  <Paper variant="outlined" sx={{ height: "100%" }}>
                    <Typography
                      fontWeight={700}
                      textAlign="center"
                      sx={{ px: 2, py: 1.5, bgcolor: "grey.100" }}
                    >
                      {label}
                    </Typography>
                    <Typography sx={{ p: 2, whiteSpace: "pre-wrap" }}>
                      {value}
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default ProductRequirements;
