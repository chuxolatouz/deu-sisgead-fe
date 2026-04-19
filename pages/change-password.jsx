import { useState } from "react";
import SEO from "components/SEO";
import {
  Alert,
  Box,
  Button,
  Card,
  TextField,
} from "@mui/material";
import { H1, Paragraph } from "components/Typography";
import { FlexRowCenter } from "components/flex-box";
import { useApi } from "contexts/AxiosContext";
import { useSnackbar } from "notistack";

const ChangePassword = () => {
  const { api } = useApi();
  const { enqueueSnackbar } = useSnackbar();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!currentPassword || !newPassword) {
      enqueueSnackbar("Completa la contraseña temporal y la nueva contraseña", { variant: "error" });
      return;
    }
    if (newPassword.length < 6) {
      enqueueSnackbar("La nueva contraseña debe tener al menos 6 caracteres", { variant: "error" });
      return;
    }
    if (newPassword !== confirmPassword) {
      enqueueSnackbar("Las contraseñas no coinciden", { variant: "error" });
      return;
    }

    setLoading(true);
    api.post("/change-password", {
      currentPassword,
      newPassword,
    })
      .then((response) => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          localStorage.setItem("user", JSON.stringify({ ...user, mustChangePassword: false }));
        }
        enqueueSnackbar(response.data.message, { variant: "success" });
        window.location.href = "/admin/products";
      })
      .catch((error) => {
        enqueueSnackbar(
          error?.response?.data?.message || error.message || "No se pudo cambiar la contraseña",
          { variant: "error" }
        );
      })
      .finally(() => setLoading(false));
  };

  return (
    <FlexRowCenter flexDirection="column" minHeight="100vh">
      <SEO title="Cambiar contraseña" />
      <Card sx={{ padding: 4, maxWidth: 560, width: "100%", boxShadow: 1 }}>
        <H1 fontSize={20} fontWeight={700} mb={2} textAlign="center">
          Cambiar contraseña
        </H1>
        <Paragraph color="grey.600" textAlign="center">
          Para continuar, reemplaza la contraseña temporal por una nueva.
        </Paragraph>
        <Alert severity="info" sx={{ mt: 3 }}>
          Usa la contraseña temporal que recibiste por correo como contraseña actual.
        </Alert>
        <Box component="form" onSubmit={handleSubmit} mt={3}>
          <TextField
            fullWidth
            sx={{ mb: 2 }}
            type="password"
            label="Contraseña temporal"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />
          <TextField
            fullWidth
            sx={{ mb: 2 }}
            type="password"
            label="Nueva contraseña"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
          <TextField
            fullWidth
            sx={{ mb: 3 }}
            type="password"
            label="Confirmar contraseña"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
          <Button
            fullWidth
            type="submit"
            color="primary"
            variant="contained"
            disabled={loading}
          >
            Guardar contraseña
          </Button>
        </Box>
      </Card>
    </FlexRowCenter>
  );
};

export default ChangePassword;
