import { useState } from "react";
import Link from "next/link";
import SEO from "components/SEO";
import { Alert, Box, Button, Card, TextField } from "@mui/material";
import { H1, H6, Paragraph } from "components/Typography";
import { FlexBox, FlexRowCenter } from "components/flex-box";
import { useApi } from "contexts/AxiosContext";
import { useSnackbar } from "notistack";

const ResetPassword = () => {
  const { api } = useApi();
  const { enqueueSnackbar } = useSnackbar();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email.trim()) {
      enqueueSnackbar("Ingresa tu email", { variant: "error" });
      return;
    }

    setLoading(true);
    api.post("/olvido_contraseña", { email: email.trim() })
      .then((response) => {
        setSent(true);
        enqueueSnackbar(response.data.message, { variant: "success" });
      })
      .catch((error) => {
        enqueueSnackbar(
          error?.response?.data?.message || error.message || "No se pudo enviar la contraseña temporal",
          { variant: "error" }
        );
      })
      .finally(() => setLoading(false));
  };

  return (
    <FlexRowCenter flexDirection="column" minHeight="100vh">
      <SEO title="Recuperar contraseña" />

      <Card
        sx={{
          padding: 4,
          maxWidth: 600,
          width: "100%",
          marginTop: 4,
          boxShadow: 1,
        }}
      >
        <H1 fontSize={20} fontWeight={700} mb={2} textAlign="center">
          Recuperar contraseña
        </H1>
        <Paragraph color="grey.600" textAlign="center">
          Recibirás una contraseña temporal en tu correo y deberás cambiarla al iniciar sesión.
        </Paragraph>

        {sent && (
          <Alert severity="success" sx={{ mt: 3 }}>
            Revisa tu correo electrónico para continuar.
          </Alert>
        )}

        <FlexBox justifyContent="space-between" flexWrap="wrap" my={2}>
          <form style={{ width: "100%" }} onSubmit={handleSubmit}>
            <TextField
              fullWidth
              name="email"
              type="email"
              label="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <Box sx={{ mt: 2 }}>
              <Button
                fullWidth
                type="submit"
                color="primary"
                variant="contained"
                disabled={loading}
              >
                Enviar contraseña temporal
              </Button>
            </Box>
          </form>

          <FlexRowCenter mt="1.25rem" justifyContent="center" width="100%">
            <Link href="/login">
              <H6 ml={1} borderBottom="1px solid" borderColor="grey.900">
                Volver al inicio de sesión
              </H6>
            </Link>
          </FlexRowCenter>
        </FlexBox>
      </Card>
    </FlexRowCenter>
  );
};

export default ResetPassword;
