import { useState, useEffect } from 'react';
import Router from 'next/router';
import { useApi } from 'contexts/AxiosContext';
import { useSnackbar } from 'notistack';
import { 
    Button, 
    Grid, 
    Select,
    Typography, 
    Dialog, 
    DialogTitle, 
    DialogActions, 
    DialogContent, 
    Box, 
    FormControl, 
    InputLabel, 
    MenuItem 
} from '@mui/material';

import TodoList from 'components/icons/duotone/TodoList';

function AddFixedRules({ id }) {
    const [rules, setRules] = useState([]);
    const [selectedRule, setSelectedRule] = useState('');
    const [open, setOpen] = useState(false);
    const { api } = useApi();    
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        api.get('/mostrar_reglas_fijas').then((response) => {            
            setRules(response.data.request_list)
        }).catch((error) => {
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
        api.post("/asignar_regla_fija/",
        { 
            ruleId: selectedRule,
            projectId: id
         }
        ).then((response) => {
            Router.reload();
        }).catch((error) => {            
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
                    Reglas Fijas
                    </Typography>
                </Button>
            </Grid>
            <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Es momento de agregar una Refla Fija</DialogTitle>
            <DialogContent>
            <Box align="center" sx={{ paddingTop: '30px' }}>
                <Box >
                <FormControl variant="outlined" sx={{ m: 1, minWidth: 220 }}>
                    <InputLabel id="user-select-outlined-label">Reglas</InputLabel>
                    <Select
                    id="user-select-standar"
                    labelId="user-select-outlined-label"
                    value={selectedRule}
                    onChange={(event) => setSelectedRule(event.target.value)}
                    label="Regla"
                    >
                    {rules.map((user) => (
                        <MenuItem key={user._id.$oid} value={user._id.$oid}>
                        {user.nombre}
                        </MenuItem>
                    ))}
                    </Select>
                </FormControl>
                </Box>
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
    )
}

export default AddFixedRules;
