import { useState } from 'react';
import {
  Delete,
  Visibility,
  Edit,
  Shield
} from "@mui/icons-material";
import {
  Avatar,
  Chip,
  Box,  
  Tooltip,
  Stack
} from "@mui/material";
import { FlexBox } from "components/flex-box";
import { Paragraph } from "components/Typography";
import {
  StyledIconButton,
  StyledTableCell,
  StyledTableRow,
} from "../StyledComponents";
import { useSnackbar } from 'notistack';
import { useApi } from 'contexts/AxiosContext';
import DeleteUserModal from "./DeleteUserModal";
import ChangeUserRoleModal from "./ChangeUserRoleModal";
import ShowUserModal from "./ShowUserModal";
import EditUserModal from './EditUserModal';

// ========================================================================

const CustomerRow = ({ customer, fetchUsers, canManageUsers = false }) => {
  const { email, nombre, avatar } = customer;
  const userRole = customer?.rol || customer?.role || (customer?.is_admin ? 'super_admin' : 'usuario');
  const userId = customer?._id?.$oid || customer?._id;
  const departmentId = customer?.departmentId || customer?.departamento_id;
  const departmentCode = customer?.departmentCode || customer?.departamento_codigo || customer?.departamento?.codigo || customer?.department?.codigo;
  const departmentName = customer?.departamento?.nombre || customer?.department?.nombre;
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [openChangeRole, setOpenChangeRole] = useState(false);
  const [openEditUser, setOpenEditUser] = useState(false);
  const [openShowUser, setOpenShowUser] = useState(false);

  const { enqueueSnackbar } = useSnackbar();
  const { api } = useApi();

  const handleDelete = () => setIsDeleteOpen(true);
  const handleCancelDelete = () => setIsDeleteOpen(false);

  const handleConfirmDelete = () => {
    if (!userId) {
      enqueueSnackbar("Usuario inválido", { variant: "error" });
      return;
    }

    api.post('/eliminar_usuario', {
      id_usuario: userId,
    }).then((response) => {
      enqueueSnackbar(response.data.message, { variant: 'success' });
      handleCancelDelete();
      fetchUsers();
    }).catch((error) => {
      if (error.response) {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    });
  };

  return (
    <StyledTableRow tabIndex={-1} >
      <StyledTableCell align="left">
        <FlexBox alignItems="center" gap={1.5}>
          {/* <Avatar src={avatar} /> */}
          <Box>
            <Paragraph>{nombre}</Paragraph>
            {userRole !== 'usuario' && (
              <Chip
                label={userRole === 'super_admin' ? 'Super Admin' : 'Admin Departamento'}
                size="small"
                color="warning"
                sx={{ mt: 0.5 }}
              />
            )}
            {userRole !== "super_admin" && (
              <Paragraph fontSize={11} color="grey.600">
                Departamento: {departmentCode || departmentName || departmentId || "Sin asignar"}
              </Paragraph>
            )}
          </Box>
        </FlexBox>
      </StyledTableCell>

      <StyledTableCell align="left">{email}</StyledTableCell>

      <StyledTableCell align="center">
        {canManageUsers ? (
          <Stack direction="row" spacing={1} justifyContent="center">
            <Tooltip title="Ver usuario">
              <StyledIconButton onClick={() => setOpenShowUser(true)}>
                <Visibility color="success" />
              </StyledIconButton>
            </Tooltip>

            <Tooltip title="Editar usuario">
              <StyledIconButton onClick={() => setOpenEditUser(true)}>
                <Edit color="secondary" />
              </StyledIconButton>
            </Tooltip>

            <Tooltip title="Cambiar rol">
              <StyledIconButton onClick={() => setOpenChangeRole(true)}>
                <Shield color="warning"/>
              </StyledIconButton>
            </Tooltip>

            <Tooltip title="Eliminar usuario de la plataforma">
              <StyledIconButton onClick={handleDelete}>
                <Delete color="error" />
              </StyledIconButton>
            </Tooltip>
          </Stack>
        ) : (
          <Paragraph fontSize={12} color="grey.600">
            Sin permisos
          </Paragraph>
        )}
      </StyledTableCell>

      <DeleteUserModal
        open={isDeleteOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        onSuccess={fetchUsers}
      />
      <ChangeUserRoleModal
        open={openChangeRole}
        onClose={() => setOpenChangeRole(false)}
        user={customer}
        onSuccess={fetchUsers}
      />
      <ShowUserModal
        open={openShowUser}
        onClose={() => setOpenShowUser(false)}
        user={customer}
      />
      <EditUserModal
        open={openEditUser}
        onClose={() => setOpenEditUser(false)}
        user={customer}
        onSuccess={fetchUsers}
      />
    </StyledTableRow>
  );
};

export default CustomerRow;
