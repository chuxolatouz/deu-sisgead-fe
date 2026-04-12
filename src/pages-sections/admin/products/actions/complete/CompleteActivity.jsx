import { useMemo, useState } from "react";
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
  const initialAmount = useMemo(() => {
    const rawAmount = Number(budget?.monto || 0);
    if (!rawAmount) return "";
    return String(rawAmount / 100);
  }, [budget?.monto]);

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

  const handleClickStatus = () => {
    if (budget.status === "new") {
      setIsOpen(true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setAmount(initialAmount);
    setReferencia("");
    setMontoTransferencia("");
    setBanco("");
    setCuentaContableCode(null);
    setCuentaContableManual("");
  };

  const handleCrearDoc = () => {
    if (!amount || Number(amount) <= 0) {
      enqueueSnackbar("Debes indicar un monto aprobado valido", {
        variant: "error",
      });
      return;
    }
    const cuentaContable = cuentaContableCode || cuentaContableManual.trim();
    if (!cuentaContable) {
      enqueueSnackbar(
        "Debes seleccionar una partida del proyecto para imputar el gasto",
        { variant: "error" }
      );
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("projectId", resolvedProjectId || "");
    formData.append("monto", amount);
    formData.append("docId", budget._id.$oid);
    formData.append("year", String(resolvedFundingYear));
    formData.append("referencia", referencia);
    formData.append("transferAmount", montoTransferencia);
    formData.append("banco", banco);
    formData.append("accountCode", cuentaContable);

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
            Este paso asigna los fondos a la actividad y la deja lista para el
            cierre final con resultados.
          </Alert>

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
                  ? "Hay una partida seleccionada; limpia la seleccion para usar texto libre."
                  : "Compatibilidad temporal para cuentas no catalogadas."
              }
            />
          </Box>
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
