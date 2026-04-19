import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  OutlinedInput,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import AccountSelector from "components/accounting/AccountSelector";
import { useApi } from "contexts/AxiosContext";
import { useSnackbar } from "notistack";

function CerrarActividad({ budget, onComplete, year }) {
  const isSponsored = Boolean(budget?.isSponsored || budget?.patrocinada);
  const initialAmount = useMemo(() => {
    if (isSponsored) return "0";
    const rawAmount = Number(budget?.monto || 0);
    if (!rawAmount) return "";
    return String(rawAmount / 100);
  }, [budget?.monto, isSponsored]);

  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState(initialAmount);
  const [referencia, setReferencia] = useState("");
  const [montoTransferencia, setMontoTransferencia] = useState("");
  const [banco, setBanco] = useState("");
  const [cuentaContableCode, setCuentaContableCode] = useState(null);
  const [cuentaContableManual, setCuentaContableManual] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { api } = useApi();
  const { enqueueSnackbar } = useSnackbar();
  const resolvedProjectId = budget?.projectId || budget?.project_id?.$oid;
  const resolvedFundingYear = Number(year || budget?.fundingYear || new Date().getFullYear());

  useEffect(() => {
    setAmount(initialAmount);
    if (isSponsored) {
      setMontoTransferencia("0");
      setCuentaContableCode(null);
      setCuentaContableManual("");
    }
  }, [initialAmount, isSponsored]);

  const handleClickStatus = () => {
    if (budget.status === "new") {
      setIsOpen(true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setAmount(initialAmount);
    setReferencia("");
    setMontoTransferencia(isSponsored ? "0" : "");
    setBanco("");
    setCuentaContableCode(null);
    setCuentaContableManual("");
  };

  const handleCrearDoc = () => {
    if (!isSponsored && (!amount || Number(amount) <= 0)) {
      enqueueSnackbar("Debes indicar un monto aprobado valido", {
        variant: "error",
      });
      return;
    }
    const cuentaContable = cuentaContableCode || cuentaContableManual.trim();
    if (!isSponsored && !cuentaContable) {
      enqueueSnackbar(
        "Debes seleccionar una partida del proyecto para imputar el gasto",
        { variant: "error" }
      );
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    const approvedAmount = isSponsored ? "0" : amount;
    const transferAmount = isSponsored ? "0" : montoTransferencia;
    formData.append("projectId", resolvedProjectId || "");
    formData.append("monto", approvedAmount);
    formData.append("docId", budget._id.$oid);
    formData.append("year", String(resolvedFundingYear));
    formData.append("referencia", referencia);
    formData.append("transferAmount", transferAmount);
    formData.append("banco", banco);
    if (!isSponsored) {
      formData.append("accountCode", cuentaContable);
    }

    api
      .post("/documento_cerrar", formData)
      .then((response) => {
        handleClose();
        enqueueSnackbar(response.data.mensaje, { variant: "success" });
        onComplete?.();
      })
      .catch((error) => {
        if (error.response) {
          enqueueSnackbar(
            error.response.data.error || error.response.data.mensaje,
            { variant: "error" }
          );
        } else {
          enqueueSnackbar(
            error.message ||
              "Error al registrar el cierre administrativo de la actividad",
            { variant: "error" }
          );
        }
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <Box>
      <Chip
        color="primary"
        onClick={handleClickStatus}
        clickable
        variant="outlined"
        label="Cierre administrativo"
      />
      <Dialog open={isOpen} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Registrar cierre administrativo: {budget.descripcion}
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" variant="outlined" sx={{ mt: 2 }}>
            {isSponsored
              ? "Esta actividad fue marcada como patrocinada. El cierre administrativo se registrará sin consumir fondos del proyecto."
              : "Este paso asigna los fondos a la actividad y la deja lista para el cierre final con resultados."}
          </Alert>

          {isSponsored && (
            <Chip
              sx={{ mt: 2 }}
              color="info"
              variant="outlined"
              label="Actividad patrocinada"
            />
          )}

          <FormControl
            fullWidth
            type="number"
            variant="outlined"
            sx={{ mt: 2 }}
          >
            <InputLabel id="monto">Monto aprobado</InputLabel>
            <OutlinedInput
              label="Monto aprobado"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isSponsored}
            />
          </FormControl>

          <Box display="flex" gap={2} mt={2}>
            <FormControl fullWidth>
              <InputLabel htmlFor="referencia">Referencia</InputLabel>
              <OutlinedInput
                id="referencia"
                label="Referencia"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
              />
            </FormControl>

            <FormControl sx={{ minWidth: "180px" }}>
              <InputLabel htmlFor="montoTransferencia">
                Monto transferencia
              </InputLabel>
              <OutlinedInput
                id="montoTransferencia"
                label="Monto transferencia"
                value={montoTransferencia}
                onChange={(e) => setMontoTransferencia(e.target.value)}
                type="number"
                disabled={isSponsored}
              />
            </FormControl>
          </Box>

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel htmlFor="banco">Banco</InputLabel>
            <OutlinedInput
              id="banco"
              label="Banco"
              value={banco}
              onChange={(e) => setBanco(e.target.value)}
            />
          </FormControl>

          {isSponsored ? (
            <Alert severity="success" variant="outlined" sx={{ mt: 2, mb: 2 }}>
              No es necesario seleccionar una partida ni una cuenta manual. El sistema usará la cuenta de patrocinio configurada como referencia y registrará el cierre en cero.
            </Alert>
          ) : (
            <Box sx={{ mt: 2, mb: 2 }}>
              <AccountSelector
                label="Partida del proyecto"
                value={cuentaContableCode}
                group="EGRESO"
                year={resolvedFundingYear}
                allowHeaders={false}
                helperText="Solo se muestran partidas del proyecto con saldo disponible."
                scopeType="project"
                scopeId={resolvedProjectId}
                assignedOnly
                includeZero={false}
                optionBalanceLabel="Disponible"
                onChange={(accountCode) => {
                  setCuentaContableCode(accountCode);
                }}
              />
              <TextField
                sx={{ mt: 2 }}
                fullWidth
                label="Cuenta contable manual"
                value={cuentaContableManual}
                onChange={(event) => setCuentaContableManual(event.target.value)}
                disabled={Boolean(cuentaContableCode)}
                helperText={
                  cuentaContableCode
                    ? "Hay una partida seleccionada; limpia la selección para usar texto libre."
                    : "Compatibilidad temporal para cuentas no catalogadas."
                }
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="error" onClick={handleClose}>
            Cancelar
          </Button>
          <LoadingButton
            variant="outlined"
            color="secondary"
            onClick={handleCrearDoc}
            loading={submitting}
          >
            Registrar cierre administrativo
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CerrarActividad;
