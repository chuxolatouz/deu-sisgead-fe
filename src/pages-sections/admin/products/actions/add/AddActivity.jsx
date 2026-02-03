import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Button,
  OutlinedInput,
  InputLabel,
  Select,
  MenuItem,
  Box,
  FormControl,
  CircularProgress
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import DropZone from 'components/DropZone';
import { Span } from 'components/Typography';
import { useApi } from 'contexts/AxiosContext';
import { useSnackbar } from 'notistack';

function AddBudget({ project }) {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const [objectives, setObjectives] = useState([]);
  const [selectedObjective, setSelectedObjective] = useState('');
  const [loadingObjectives, setLoadingObjectives] = useState(false);
  const [amount, setAmount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState([]);
  const { api } = useApi();

  const { enqueueSnackbar } = useSnackbar();


  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (isOpen) {
      setLoadingObjectives(true);
      api.get(`/proyecto/${project._id}/objetivos`)
        .then((res) => setObjectives(res.data.objetivos_especificos))
        .catch((err) => {
          console.error(err);
          enqueueSnackbar("Error al cargar los objetivos específicos", { variant: 'error' });
        })
        .finally(() => setLoadingObjectives(false));
    }
  }, [isOpen]);

  const handleCrearDoc = () => {
    setSubmitting(true);
    const formData = new FormData();
    formData.append('descripcion', text);
    for (const file of files) {
      formData.append('files', file);
    }
    formData.append('proyecto_id', project._id);
    formData.append('monto', amount);
    formData.append('objetivo_especifico', selectedObjective);

    api.post('/documento_crear', formData).then((response) => {
      setIsOpen(false);
      enqueueSnackbar(response.data.mensaje, { variant: 'success' });
    }).catch((error) => {
      if (error?.response?.data?.message) {
        enqueueSnackbar(error.response.data.message, { variant: 'error' })
      } else {
        enqueueSnackbar(error.message, { variant: 'error' })
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
      <Button variant="outlined" color="secondary" onClick={() => setIsOpen(true)}>
        Subir presupuestos
      </Button>
      <Dialog open={isOpen}>
        <DialogTitle><Span>Agrega una solicitud de presupuesto</Span></DialogTitle>
        <DialogContent>
          <FormControl fullWidth variant="outlined" sx={{ marginTop: '20px', marginBottom: '20px' }}>
            <InputLabel id="documentos">Descripción</InputLabel>
            <OutlinedInput
              labelid="documentos"
              label="Descripción"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </FormControl>

          {/* Renderizar objetivos específicos si existen */}
          {loadingObjectives ? (
            <Box display="flex" justifyContent="center" alignItems="center" mt={3} mb={3}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            objectives.length > 0 && (
              <FormControl fullWidth variant="outlined" sx={{ marginTop: '20px', marginBottom: '20px' }}>
                <InputLabel id="objetivo">Seleccionar Objetivo Específico</InputLabel>
                <Select
                  labelId="objetivo"
                  value={selectedObjective}
                  onChange={(e) => setSelectedObjective(e.target.value)}
                  label="Seleccionar Objetivo Específico"
                >
                  {objectives.map((objective, index) => (
                    <MenuItem key={index + objective} value={objective}>
                      {objective}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )
          )}
          <FormControl fullWidth variant="outlined" sx={{ marginTop: '20px', marginBottom: '20px' }}>
            <InputLabel id="monto">Monto</InputLabel>
            <OutlinedInput
              labelid="monto"
              label="Monto"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </FormControl>

          <DropZone onChange={(file) => { setFiles(file) }} />
          <aside>
            <h4>Files</h4>
            <ul>{fileList}</ul>
          </aside>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="error" onClick={() => setIsOpen(false)}>
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

export default AddBudget;
