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
  TextField
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import DropZone from 'components/DropZone';
import AccountSelector from 'components/accounting/AccountSelector';
import { useApi } from 'contexts/AxiosContext';
import { useSnackbar } from 'notistack';

function CerrarActividad({ budget, onComplete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const [amount, setAmount] = useState(0);
  const [files, setFiles] = useState([]);
  const [referencia, setReferencia] = useState('');
  const [montoTransferencia, setMontoTransferencia] = useState('');
  const [banco, setBanco] = useState('');
  const [cuentaContableCode, setCuentaContableCode] = useState(null);
  const [cuentaContableManual, setCuentaContableManual] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { api } = useApi();
  const { enqueueSnackbar } = useSnackbar();
  const handleClickStatus = () => {
    if (budget.status !== 'finished') {
      setIsOpen(true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Limpiar campos del formulario
    setText('');
    setAmount(0);
    setFiles([]);
    setReferencia('');
    setMontoTransferencia('');
    setBanco('');
    setCuentaContableCode(null);
    setCuentaContableManual('');
  };
  const handleCrearDoc = () => {
    setSubmitting(true);
    const formData = new FormData();
    formData.append('descripcion', text);

    // biome-ignore lint/complexity/noForEach: <explanation>
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('proyecto_id', budget.project_id.$oid);
    formData.append('monto', amount);
    formData.append('doc_id', budget._id.$oid);
    formData.append('description', budget.descripcion)
    formData.append('referencia', referencia);
    formData.append('monto_transferencia', montoTransferencia);
    formData.append('banco', banco);
    const cuentaContable = cuentaContableCode || cuentaContableManual.trim();
    formData.append('cuenta_contable', cuentaContable);

    api.post('/documento_cerrar', formData).then((response) => {
      handleClose();
      enqueueSnackbar(response.data.mensaje, { variant: 'success' });

      // Recargar la lista de actividades
      if (onComplete) {
        onComplete();
      }
    }).catch((error) => {
      if (error.response) {
        enqueueSnackbar(error.response.data.error || error.response.data.mensaje, { variant: 'error' })
      } else {
        enqueueSnackbar(error.message || 'Error al completar la actividad', { variant: 'error' })
      }
    }).finally(() => {
      setSubmitting(false);
    })
  };

  const fileList = files.map((file) => (
    <Box key={file.path}>
      {`${file.path}-${file.size}bytes`}
    </Box>
  ));

  return (
    <Box>
      <Chip color="primary" onClick={handleClickStatus} clickable variant="outlined" label="Asignar Monto" />
      <Dialog open={isOpen} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Agrega la factura de {budget.descripcion}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
            <InputLabel id="documentos">Descripcion</InputLabel>
            <OutlinedInput

              label="Descripción"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </FormControl>
          <FormControl fullWidth type="number" variant="outlined" sx={{ mt: 2 }}>
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

            <FormControl sx={{ minWidth: '150px' }}>
              <InputLabel htmlFor="montoTransferencia">Monto Transferencia</InputLabel>
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
              label="Cuenta Contable (opcional)"
              value={cuentaContableCode}
              group="EGRESO"
              year={2025}
              allowHeaders={false}
              helperText="Búsqueda en catálogo EGRESO. Si no aplica, puedes usar texto libre abajo."
              onChange={(accountCode) => {
                setCuentaContableCode(accountCode);
              }}
            />
            <TextField
              sx={{ mt: 2 }}
              fullWidth
              label="Cuenta Contable (texto libre opcional)"
              value={cuentaContableManual}
              onChange={(event) => setCuentaContableManual(event.target.value)}
              disabled={Boolean(cuentaContableCode)}
              helperText={cuentaContableCode ? 'Hay una cuenta de catálogo seleccionada; limpia la selección para usar texto libre.' : ''}
            />
          </Box>
          <DropZone onChange={(file) => { setFiles(file) }} />
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
