import { useState, useEffect } from 'react';
import Router from 'next/router';
import { useApi } from 'contexts/AxiosContext';
import { useSnackbar } from 'notistack';

import { 
    Button, 
    Grid,
    Typography,
    Dialog,
    DialogTitle,
    DialogActions,
    DialogContent,
    Box,
    FormControl,
    OutlinedInput,
    InputAdornment,
    IconButton,
    InputLabel,
 } from '@mui/material';

 import { PercentOutlined, AttachMoneyOutlined } from '@mui/icons-material';
import TodoList from 'components/icons/duotone/TodoList';

function AddRules({ id }) {
    const [roles, setRoles] = useState([]);
    const [isPercentage, setIsPercentage] = useState(true);
    const [amounts, setAmounts] = useState({});
    const [open, setOpen] = useState(false);
    const { api } = useApi();    
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        api.get('/roles').then((response) => {
            setRoles(response.data)
        })
        .catch((error) => {
            if (error.response) {
                enqueueSnackbar(error.response.data.message, { variant: 'error'})
            } else {
                enqueueSnackbar(error.message, { variant: 'error'})
            }
        })
    },[])
    const handleOpen = () => {
        setOpen(true);
    }
    const handleClose = () => {
        setOpen(false);
    }
    const handleAddRule = () => {
      const totalAmount = Object.keys(amounts).reduce((acc, rol) => acc + amounts[rol], 0)
        if(isPercentage && totalAmount !== 100) {
          enqueueSnackbar('El monto total excede el 100% en la distribución', { variant: 'error'})
          setOpen(false);
          return
        }
        api.post(`/asignar_regla_distribucion`,
        { 
            distributionRule: amounts,
            projectId: id
         }
        ).then(() => {
            Router.reload();
        }).catch((error) => {    
          console.log(error)        
            if (error.response) {
                enqueueSnackbar(error.response.data.message, { variant: 'error'})
            } else {
                enqueueSnackbar(error.message, { variant: 'error'})
            }
        })
    }
  return (
    <Grid container alignItems="center" gap={2}>
      <Grid item alignItems="center">
        <TodoList sx={{verticalAlign: 'middle'}}/>
      </Grid>
      <Grid item>
        <Button variant="text" onClick={handleOpen}>
          <Typography fontSize="14px" color="grey.600">
            Reglas Distribución
          </Typography>
        </Button>
      </Grid>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Es momento de agregar una Regla de Distribución</DialogTitle>
        <DialogContent>
          <Box align="center" sx={{ paddingTop: '30px' }}>
            {roles.map((role) => (
            <Box key={role.value}>
                <FormControl variant="outlined" sx={{ m: 1, minWidth: 220 }}>
                  <InputLabel id={`${role.value}-input-label`}>{role.label}</InputLabel>
                  <OutlinedInput
                      id={`${role.value}-input`}
                      labelId={`${role.value}-input-label`}
                      type="number"
                      value={amounts[role.value] || ''}                      
                      onChange={(event) =>
                      setAmounts((prevAmounts) => ({
                          ...prevAmounts,
                          [role.value]: Number.parseInt(event.target.value, 10),
                      }))
                      }
                      endAdornment={
                      <InputAdornment position="end">
                          <IconButton onClick={() => setIsPercentage((prev) => !prev)}>
                          {isPercentage ? <PercentOutlined /> : <AttachMoneyOutlined />}
                          </IconButton>
                      </InputAdornment>
                      }
                      label={role.label}
                  />
                </FormControl>
            </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ paddingBottom: '50px' }}>
          <Box sx={{ position: 'absolute', bottom: '16px', right: '16px' }}>
            <Button color="error" variant="outlined" onClick={handleClose}>
              Cancelar
            </Button>
            <Button color="success" variant="outlined" onClick={handleAddRule}>
              Agregar Regla
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}

export default AddRules;
