import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch
} from '@mui/material';
import { H3 } from 'components/Typography';
import { useSnackbar } from 'notistack';
import { useApi } from 'contexts/AxiosContext';

const GROUPS = ['PASIVO', 'INGRESO', 'EGRESO'];

const EditAccountModal = ({ open, onClose, account, year, onSuccess }) => {
  const [formData, setFormData] = useState({
    description: '',
    group: 'EGRESO',
    level: 1,
    parent_code: '',
    is_header: false
  });
  const { enqueueSnackbar } = useSnackbar();
  const { api } = useApi();

  useEffect(() => {
    if (!account) return;
    setFormData({
      description: account.description || '',
      group: account.group || 'EGRESO',
      level: Number(account.level || 1),
      parent_code: account.parent_code || '',
      is_header: Boolean(account.is_header)
    });
  }, [account]);

  const handleChange = (event) => {
    const { name, value, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'is_header' ? checked : value
    }));
  };

  const handleSubmit = () => {
    if (!formData.description.trim()) {
      enqueueSnackbar('La descripción es obligatoria', { variant: 'error' });
      return;
    }

    const payload = {
      description: formData.description.trim(),
      group: formData.group,
      level: Number(formData.level),
      parent_code: formData.parent_code.trim() || null,
      is_header: Boolean(formData.is_header)
    };

    api.put(`/api/admin/accounts/${account.code}?year=${year}`, payload)
      .then(() => {
        enqueueSnackbar('Cuenta actualizada', { variant: 'success' });
        onSuccess();
        onClose();
      })
      .catch((error) => {
        if (error.response) {
          enqueueSnackbar(error.response.data.message || 'Error al actualizar la cuenta', { variant: 'error' });
        } else {
          enqueueSnackbar(error.message, { variant: 'error' });
        }
      });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent>
        <Box>
          <H3 mb={3}>Editar Cuenta Contable</H3>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField fullWidth label="Código" value={account?.code || ''} disabled />
            <TextField fullWidth label="Descripción" name="description" value={formData.description} onChange={handleChange} required />
            <TextField fullWidth select label="Grupo" name="group" value={formData.group} onChange={handleChange}>
              {GROUPS.map((group) => (
                <MenuItem key={group} value={group}>{group}</MenuItem>
              ))}
            </TextField>
            <TextField fullWidth type="number" label="Nivel" name="level" value={formData.level} onChange={handleChange} inputProps={{ min: 1 }} />
            <TextField fullWidth label="Código Padre" name="parent_code" value={formData.parent_code} onChange={handleChange} placeholder="Opcional (12 dígitos)" />
            <FormControlLabel control={<Switch checked={formData.is_header} onChange={handleChange} name="is_header" />} label="Cuenta titular (header)" />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">Guardar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditAccountModal;
