import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import AccountSelector from "components/accounting/AccountSelector";
import DropZone from "components/DropZone";
import { useApi } from "contexts/AxiosContext";
import { useSnackbar } from "notistack";
import { normalizeMongoId } from "lib";

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
  const [selectedRequirementId, setSelectedRequirementId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [supportFiles, setSupportFiles] = useState([]);

  const { api } = useApi();
  const { enqueueSnackbar } = useSnackbar();
  const resolvedProjectId = normalizeMongoId(
    budget?.projectId || budget?.project_id
  );
  const resolvedDocumentId = normalizeMongoId(budget);
  const resolvedFundingYear = Number(
    year || budget?.fundingYear || new Date().getFullYear()
  );
  const activityRequirements = Array.isArray(budget?.requerimientos)
    ? budget.requerimientos
    : [];
  const selectedRequirement = activityRequirements.find(
    (requirement) => requirement.requirementId === selectedRequirementId
  );

  useEffect(() => {
    setAmount(initialAmount);
    if (isSponsored) {
      setMontoTransferencia("0");
      setCuentaContableCode(null);
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
    setSelectedRequirementId("");
    setSupportFiles([]);
  };

  const handleCrearDoc = () => {
    const numericAmount = Number(amount || 0);
    if (numericAmount < 0) {
      enqueueSnackbar("El monto aprobado no puede ser negativo", {
        variant: "error",
      });
      return;
    }
    const requirementAccount =
      selectedRequirement && !selectedRequirement.account?.isHeader
        ? selectedRequirement.accountCode
        : "";
    const cuentaContable = requirementAccount || cuentaContableCode;
    if (!isSponsored && numericAmount === 0 && cuentaContable) {
      enqueueSnackbar(
        "Un cierre con monto 0 no puede tener una cuenta asociada",
        { variant: "error" }
      );
      return;
    }
    if (!isSponsored && numericAmount > 0 && !cuentaContable) {
      enqueueSnackbar(
        "Debes seleccionar una cuenta contable de gasto para registrar el cierre",
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
    formData.append("docId", resolvedDocumentId || "");
    formData.append("year", String(resolvedFundingYear));
    formData.append("referencia", referencia);
    formData.append("transferAmount", transferAmount);
    formData.append("banco", banco);
    if (selectedRequirementId) {
      formData.append("requirementId", selectedRequirementId);
    }
    if (!isSponsored) {
      if (cuentaContable) formData.append("accountCode", cuentaContable);
    }
    supportFiles.forEach((file) => formData.append("supportFiles", file));

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
              No es necesario seleccionar una partida ni una cuenta manual. El
              sistema usará la cuenta de patrocinio configurada como referencia
              y registrará el cierre en cero.
            </Alert>
          ) : (
            <Box sx={{ mt: 2, mb: 2 }}>
              {activityRequirements.length > 0 && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="closure-requirement-label">
                    Requerimiento (opcional)
                  </InputLabel>
                  <Select
                    labelId="closure-requirement-label"
                    label="Requerimiento (opcional)"
                    value={selectedRequirementId}
                    onChange={(event) => {
                      setSelectedRequirementId(event.target.value);
                      setCuentaContableCode(null);
                    }}
                  >
                    <MenuItem value="">Sin requerimiento</MenuItem>
                    {activityRequirements.map((requirement) => (
                      <MenuItem
                        key={requirement.requirementId}
                        value={requirement.requirementId}
                      >
                        {requirement.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              {selectedRequirement && !selectedRequirement.account?.isHeader ? (
                <TextField
                  fullWidth
                  disabled
                  label="Cuenta del requerimiento"
                  value={`${selectedRequirement.accountCode} - ${
                    selectedRequirement.account?.description || ""
                  }`}
                  helperText="La cuenta se tomará automáticamente del requerimiento."
                />
              ) : (
                <AccountSelector
                  label={
                    selectedRequirement?.account?.isHeader
                      ? `Cuenta detalle bajo ${selectedRequirement.accountCode}`
                      : "Cuenta contable del gasto"
                  }
                  value={cuentaContableCode}
                  group="EGRESO"
                  year={resolvedFundingYear}
                  allowHeaders={false}
                  helperText="La cuenta se aplicará al registrar el cierre administrativo."
                  ancestorCode={
                    selectedRequirement?.account?.isHeader
                      ? selectedRequirement.accountCode
                      : undefined
                  }
                  onChange={(accountCode) => {
                    setCuentaContableCode(accountCode);
                  }}
                />
              )}
            </Box>
          )}
          <DropZone
            onChange={setSupportFiles}
            onRejected={() =>
              enqueueSnackbar(
                "Solo se permiten hasta 10 imágenes o PDF de 10 MB",
                { variant: "error" }
              )
            }
            title="Adjunta respaldos del cierre (opcional)"
            imageSize="Imágenes o PDF, máximo 10 MB por archivo"
          />
          {supportFiles.map((file) => (
            <Typography
              key={`${file.name}-${file.size}`}
              variant="caption"
              display="block"
            >
              {file.name}
            </Typography>
          ))}
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
