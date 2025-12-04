import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  FormControlLabel,
  Switch
} from "@mui/material";
import { H3 } from "components/Typography";
import { useSnackbar } from 'notistack';
import { useApi } from 'contexts/AxiosContext';

const EditDepartamentoModal = ({ open, onClose, departamento, onSuccess }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    codigo: '',
    activo: true
  });
  const { enqueueSnackbar } = useSnackbar();
  const { api } = useApi();

  useEffect(() => {
    if (departamento) {
      setFormData({
        nombre: departamento.nombre || '',
        descripcion: departamento.descripcion || '',
        codigo: departamento.codigo || '',
        activo: departamento.activo !== undefined ? departamento.activo : true
      });
    }
  }, [departamento]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'activo' ? checked : value
    }));
  };

  const handleSubmit = () => {
    if (!formData.nombre || !formData.codigo) {
      enqueueSnackbar('Nombre y código son obligatorios', { variant: 'error' });
      return;
    }

    const departamentoId = departamento._id?.$oid || departamento._id;
    
    api.put(`/departamentos/${departamentoId}`, formData)
      .then((response) => {
        enqueueSnackbar('Departamento actualizado exitosamente', { variant: 'success' });
        onSuccess();
        onClose();
      })
      .catch((error) => {
        if (error.response) {
          enqueueSnackbar(error.response.data.message, { variant: 'error' });
        } else {
          enqueueSnackbar(error.message, { variant: 'error' });
        }
      });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent>
        <Box>
          <H3 mb={3}>Editar Departamento</H3>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              fullWidth
              label="Nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              label="Código"
              name="codigo"
              value={formData.codigo}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              label="Descripción"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              multiline
              rows={3}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.activo}
                  onChange={handleChange}
                  name="activo"
                />
              }
              label="Activo"
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditDepartamentoModal;

