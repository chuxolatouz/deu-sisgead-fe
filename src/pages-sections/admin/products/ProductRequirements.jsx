import { Box, Grid, Paper, Typography } from "@mui/material";

const requirements = [
  { key: "materiales_necesarios", label: "Materiales necesarios" },
  { key: "recursos_humanos", label: "Recursos humanos" },
  { key: "logistica", label: "Logística" },
];

const ProductRequirements = ({ project }) => (
  <Box>
    <Typography variant="h5" mb={0.5}>
      Requerimientos del proyecto
    </Typography>
    <Typography variant="body2" color="text.secondary" mb={3}>
      Recursos previstos para la ejecución de las actividades del proyecto.
    </Typography>

    <Grid container spacing={2} alignItems="stretch">
      {requirements.map(({ key, label }) => {
        const value = String(project?.[key] || "").trim();
        return (
          <Grid item md={4} xs={12} key={key}>
            <Paper
              variant="outlined"
              sx={{ height: "100%", overflow: "hidden" }}
            >
              <Typography
                variant="subtitle1"
                fontWeight={700}
                textAlign="center"
                sx={{ px: 2, py: 1.5, bgcolor: "grey.100" }}
              >
                {label}
              </Typography>
              <Typography
                variant="body1"
                color={value ? "text.primary" : "text.secondary"}
                sx={{ p: 2, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
              >
                {value || "Sin especificar"}
              </Typography>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  </Box>
);

export default ProductRequirements;
