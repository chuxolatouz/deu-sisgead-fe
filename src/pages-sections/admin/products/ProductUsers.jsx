import { useState, useEffect } from 'react';
import {
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Paper from '@mui/material/Paper';
import Router from 'next/router';
import { useSnackbar } from 'notistack';
import AddUser from './actions/add/AddUser';
import { useApi } from 'contexts/AxiosContext';

function ProjectUsers({ users, id }) {
  const [listUsers, setListUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);
  const { api } = useApi();
  const { enqueueSnackbar } = useSnackbar();

  const handleDelete = (userId) => {
    setUserIdToDelete(userId);
    setOpen(true);
  };

  const handleConfirmDelete = () => {
  // Elimina el usuario con el ID `userIdToDelete` y cierra el cuadro de diálogo.
    const data = {
      projectId: id,
      userId: userIdToDelete,
    };
    api.patch('/eliminar_usuario_proyecto', data).then(() => {
      Router.reload();
    }).catch((error) => {
      if (error.response) {
          enqueueSnackbar(error.response.data.message, { variant: 'error'})
      } else {
          enqueueSnackbar(error.message, { variant: 'error'})
      }
  })
  };

  const handleCancelDelete = () => {
  // Cierra el cuadro de diálogo de confirmación.
    setOpen(false);
  };
  const castUsers = (data) => {
    const newData = data.map((user) => ({
      nombre: user.usuario.nombre,
      rol: user.role.label,
      fecha_ingreso: user.fecha_ingreso,
      id: user.usuario._id.$oid,
    }));
    return newData;
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (users) {
      setListUsers(castUsers(users));
    }
  }, [id]);

  return (
    <div>
      <AddUser id={id} />
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell align="left">Persona</TableCell>
              <TableCell align="left">Rol</TableCell>
              <TableCell align="left">Fecha agregado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {listUsers.map((action) => (
              <TableRow
                key={action.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 }, height: '50px' }}
              >
                <TableCell component="th" scope="row" align="left">{action.nombre}</TableCell>
                <TableCell align="left">{action.rol}</TableCell>
                <TableCell align="left">{action.fecha_ingreso}</TableCell>
                <TableCell>
                  <IconButton color="error" onClick={() => handleDelete(action.id)}>
                    <Tooltip title="Eliminar usuario de Proyecto">
                      <DeleteIcon />
                    </Tooltip>
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleCancelDelete}>
        <DialogTitle>¿Estás seguro de que quieres eliminar este usuario?</DialogTitle>
        <DialogActions>
          <Button color="error" onClick={handleCancelDelete}>Cancelar</Button>
          <Button color="secondary" onClick={handleConfirmDelete}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default ProjectUsers;
