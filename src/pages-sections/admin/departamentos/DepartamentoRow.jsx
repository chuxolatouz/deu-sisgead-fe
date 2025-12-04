import { useState } from 'react';
import { Delete, Edit } from "@mui/icons-material";
import { Box, Chip, Tooltip, Stack } from "@mui/material";
import { FlexBox } from "components/flex-box";
import { Paragraph } from "components/Typography";
import {
  StyledIconButton,
  StyledTableCell,
  StyledTableRow,
} from "../StyledComponents";
import { useSnackbar } from 'notistack';
import { useApi } from 'contexts/AxiosContext';
import DeleteDepartamentoModal from "./DeleteDepartamentoModal";
import EditDepartamentoModal from "./EditDepartamentoModal";

const DepartamentoRow = ({ departamento, fetchDepartamentos }) => {
  const { nombre, descripcion, codigo, activo } = departamento;
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { enqueueSnackbar } = useSnackbar();
  const { api } = useApi();

  const handleDelete = () => setIsDeleteOpen(true);
  const handleCancelDelete = () => setIsDeleteOpen(false);

  const handleConfirmDelete = () => {
    const departamentoId = departamento._id?.$oid || departamento._id;
    
    api.delete(`/departamentos/${departamentoId}`)
      .then((response) => {
        enqueueSnackbar('Departamento eliminado exitosamente', { variant: 'success' });
        handleCancelDelete();
        fetchDepartamentos();
      })
      .catch((error) => {
        if (error.response) {
          enqueueSnackbar(error.response.data.message, { variant: 'error' });
        } else {
          enqueueSnackbar(error.message, { variant: 'error' });
        }
      });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      // Si el backend devuelve el formato MongoDB {$date: '...'}
      const dateValue = dateString.$date || dateString;
      const date = new Date(dateValue);
      return date.toLocaleDateString('es-ES');
    } catch {
      return '-';
    }
  };

  return (
    <StyledTableRow tabIndex={-1}>
      <StyledTableCell align="left">
        <FlexBox alignItems="center" gap={1.5}>
          <Box>
            <Paragraph fontWeight={600}>{nombre}</Paragraph>
            <Paragraph fontSize={12} color="grey.600">
              Código: {codigo}
            </Paragraph>
          </Box>
        </FlexBox>
      </StyledTableCell>

      <StyledTableCell align="left">
        <Paragraph>{descripcion || '-'}</Paragraph>
      </StyledTableCell>

      <StyledTableCell align="center">
        <Chip
          label={activo ? "Activo" : "Inactivo"}
          size="small"
          color={activo ? "success" : "default"}
        />
      </StyledTableCell>

      <StyledTableCell align="left">
        <Paragraph fontSize={13}>
          {formatDate(departamento.fecha_creacion)}
        </Paragraph>
      </StyledTableCell>

      <StyledTableCell align="center">
        <Stack direction="row" spacing={1} justifyContent="center">
          <Tooltip title="Editar departamento">
            <StyledIconButton onClick={() => setIsEditOpen(true)}>
              <Edit color="secondary" />
            </StyledIconButton>
          </Tooltip>

          <Tooltip title="Eliminar departamento">
            <StyledIconButton onClick={handleDelete}>
              <Delete color="error" />
            </StyledIconButton>
          </Tooltip>
        </Stack>
      </StyledTableCell>

      <DeleteDepartamentoModal
        open={isDeleteOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
      
      <EditDepartamentoModal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        departamento={departamento}
        onSuccess={fetchDepartamentos}
      />
    </StyledTableRow>
  );
};

export default DepartamentoRow;

