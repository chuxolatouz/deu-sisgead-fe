import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Button,
  Chip,
  InputLabel,
  OutlinedInput,
  Box,
  FormControl,
  TextField,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import DropZone from "components/DropZone";
import AccountSelector from "components/accounting/AccountSelector";
import { useApi } from "contexts/AxiosContext";
import { useSnackbar } from "notistack";

function CerrarActividad({ budget, onComplete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");
  const [amount, setAmount] = useState(0);
  const [files, setFiles] = useState([]);
  const [referencia, setReferencia] = useState("");
  const [montoTransferencia, setMontoTransferencia] = useState("");
  const [banco, setBanco] = useState("");
  const [cuentaContableCode, setCuentaContableCode] = useState(null);
  const [cuentaContableManual, setCuentaContableManual] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { api } = useApi();
  const { enqueueSnackbar } = useSnackbar();
  const resolvedProjectId = budget?.projectId || budget?.project_id?.$oid;
  const handleClickStatus = () => {
    if (budget.status !== "finished") {
      setIsOpen(true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Limpiar campos del formulario
    setText("");
    setAmount(0);
    setFiles([]);
    setReferencia("");
    setMontoTransferencia("");
    setBanco("");
    setCuentaContableCode(null);
    setCuentaContableManual("");
  };
  const handleCrearDoc = () => {
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
    formData.append("descripcion", text);

    // biome-ignore lint/complexity/noForEach: <explanation>
    files.forEach((file) => {
      formData.append("files", file);
    });
    formData.append("projectId", resolvedProjectId || "");
    formData.append("monto", amount);
    formData.append("docId", budget._id.$oid);
    formData.append("description", budget.descripcion);
    formData.append("referencia", referencia);
    formData.append("transferAmount", montoTransferencia);
    formData.append("banco", banco);
    formData.append("accountCode", cuentaContable);

    api
      .post("/documento_cerrar", formData)
      .then((response) => {
        handleClose();
        enqueueSnackbar(response.data.mensaje, { variant: "success" });

        // Recargar la lista de actividades
        if (onComplete) {
          onComplete();
        }
      })
      .catch((error) => {
        if (error.response) {
          enqueueSnackbar(
            error.response.data.error || error.response.data.mensaje,
            { variant: "error" }
          );
        } else {
          enqueueSnackbar(error.message || "Error al completar la actividad", {
            variant: "error",
          });
        }
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const fileList = files.map((file) => (
    <Box key={file.path}>{`${file.path}-${file.size}bytes`}</Box>
  ));

  return (
    <Box>
      <Chip
        color="primary"
        onClick={handleClickStatus}
        clickable
        variant="outlined"
        label="Asignar Monto"
      />
      <Dialog open={isOpen} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Agrega la factura de {budget.descripcion}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
            <InputLabel id="documentos">Descripcion</InputLabel>
            <OutlinedInput
              label="Descripción"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </FormControl>
          <FormControl
            fullWidth
            type="number"
            variant="outlined"
            sx={{ mt: 2 }}
          >
            <InputLabel id="monto">Monto</InputLabel>
            <OutlinedInput
              label="Monto"
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

            <FormControl sx={{ minWidth: "150px" }}>
              <InputLabel htmlFor="montoTransferencia">
                Monto Transferencia
              </InputLabel>
              <OutlinedInput
                id="montoTransferencia"
                label="Monto Transferencia"
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
              year={2025}
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
              label="Cuenta Contable manual"
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
          <DropZone
            onChange={(file) => {
              setFiles(file);
            }}
          />
          <aside>
            <h4>Files</h4>
            <ul>{fileList}</ul>
          </aside>
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
            Subir Actividad
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CerrarActividad;
