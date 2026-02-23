import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import Router from 'next/router';
import { useApi } from 'contexts/AxiosContext';
import { useSnackbar } from 'notistack';

function Acciones({ id }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(0);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const { api } = useApi();
  const { enqueueSnackbar } = useSnackbar();

  const handleAgregarBalance = ({ fetchBalance }) => {
    const balanceParsed = Number.parseFloat(value).toFixed(2);
    const data = { projectId: id, balance: balanceParsed };
    api.patch('/asignar_balance', data).then(() => {
      handleClose();
      Router.reload();
      fetchBalance
    }).catch((error) => {
      if (error.response) {
          enqueueSnackbar(error.response.data.message, { variant: 'error'})
      } else {
          enqueueSnackbar(error.message, { variant: 'error'})
      }
  })
  };
  const formatText = (float) => {
    // Si el valor ingresado coincide con el patrón permitido, actualiza el estado text
    if (/^(?!0\d)\d*(\.\d{0,2})?$/.test(float)) {
      setValue(float);
    }
  };

  return (
    <Box>
      <Box>
        <Button variant="outlined" color="success" onClick={handleOpen}>
          Agregar Saldo
        </Button>
      </Box>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Es momento de agregar saldo un proyecto</DialogTitle>
        <DialogContent>
          <Typography>Introduce el monto que desees agregar</Typography>
          <FormControl sx={{ margin: '10px' }}>
            <InputLabel id="outlined-adornment-amount">Monto</InputLabel>
            <OutlinedInput
              id="outlined-adornment-amount"
              labelId="outlined-adornment-amount"
              startAdornment={<InputAdornment position="start">$</InputAdornment>}
              label="Monto"
              fullWidth
              value={value}
              type="number"
              inputProps={{
                step: '0.01',
                min: '0',
                max: '9999999.99',
                pattern: '\\d+(\\.\\d{1,2})?',
              }}
              onChange={(event) => {
                formatText(event.target.value);
              }}
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button color="error" variant="outlined" onClick={handleClose}>
            Cancelar
          </Button>
          <Button color="success" variant="outlined" onClick={handleAgregarBalance}>
            Agregar Fondos
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Acciones;
