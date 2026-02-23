import { useState, useEffect } from 'react';
import {
    Button,
    Box,
    Select,
    MenuItem,
    InputLabel, 
    FormControl, 
    Dialog, 
    DialogContent, 
    DialogTitle, 
    DialogActions
} from '@mui/material';
import { useApi } from 'contexts/AxiosContext';
import { useSnackbar } from 'notistack';
import Router from 'next/router';

function AsignarMiembro({ id }) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUser, setSelectedUser] = useState({});
  const [selectedRole, setSelectedRole] = useState('');
//   const navigate = useNavigate();
  const { api } = useApi();
  const { enqueueSnackbar } = useSnackbar();

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
  };
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setUsers([]);
  };
  const handleAgregarMiembro = () => {
    const collectedUser = users.find((user) => user._id.$oid === selectedUser);
    const collectedRole = roles.find((rol) => rol.value === selectedRole);
    const data = {
      user: collectedUser,
      role: collectedRole,
      projectId: id,
    };
    // eslint-disable-next-line no-unused-vars
    api.patch('/asignar_usuario_proyecto', data).then(() => {
      Router.reload();
    }).catch((error) => {
      if (error.response) {
          enqueueSnackbar(error.response.data.message, { variant: 'error'})
      } else {
          enqueueSnackbar(error.message, { variant: 'error'})
      }
  })
  };

  useEffect(() => {
    api.get('/roles').then((response) => {
      setRoles(response.data);
    }).catch((error) => {
      if (error.response) {
          enqueueSnackbar(error.response.data.message, { variant: 'error'})
      } else {
          enqueueSnackbar(error.message, { variant: 'error'})
      }
  })
    api.get('/mostrar_usuarios').then((response) => {
      setUsers(response.data.request_list);
    }).catch((error) => {
      if (error.response) {
          enqueueSnackbar(error.response.data.message, { variant: 'error'})
      } else {
          enqueueSnackbar(error.message, { variant: 'error'})
      }
  })
  }, []);

  return (
    <Box>
      <Box>
        <Button variant="outlined" color="success" onClick={handleOpen}>
          Asignar Miembro
        </Button>
      </Box>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Es momento de Agregar un usuario</DialogTitle>
        <DialogContent>
          <Box align="center" sx={{ paddingTop: '30px' }}>
            <Box sx={{ paddingTop: '30px' }}>
              <FormControl variant="outlined" sx={{ m: 1, minWidth: 220 }}>
                <InputLabel id="user-select-outlined-label">Usuario</InputLabel>
                <Select
                  id="user-select-standar"
                  labelId="user-select-outlined-label"
                  value={selectedUser}
                  onChange={(event) => setSelectedUser(event.target.value)}
                  label="usuario"
                >
                  {users.map((user) => (
                    <MenuItem key={user._id.$oid} value={user._id.$oid}>
                      {user.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ paddingTop: '30px' }} align="center">
              <FormControl variant="outlined" sx={{ m: 1, minWidth: 220 }}>
                <InputLabel id="role-select-outlined-label">Rol</InputLabel>
                <Select
                  id="role-select-standar"
                  labelId="role-select-outlined-label"
                  value={selectedRole}
                  onChange={handleRoleChange}
                  label="rol"
                >
                  {roles.map((rol) => (
                    <MenuItem key={rol.value} value={rol.value}>
                      {rol.label}
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
            <Button color="success" variant="outlined" onClick={handleAgregarMiembro}>
              Agregar Usuario
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AsignarMiembro;
