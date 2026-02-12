import { useState } from 'react';
import { Delete, Edit } from '@mui/icons-material';
import { Chip, Stack, Tooltip } from '@mui/material';
import { Paragraph } from 'components/Typography';
import {
  StyledIconButton,
  StyledTableCell,
  StyledTableRow
} from '../StyledComponents';
import { useSnackbar } from 'notistack';
import { useApi } from 'contexts/AxiosContext';
import DeleteAccountModal from './DeleteAccountModal';
import EditAccountModal from './EditAccountModal';
import { formatMonto } from 'lib';

const AccountRow = ({ account, year, onRefresh }) => {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { api } = useApi();

  const handleDelete = () => {
    api.delete(`/api/admin/accounts/${account.code}?year=${year}`)
      .then(() => {
        enqueueSnackbar('Cuenta eliminada', { variant: 'success' });
        setIsDeleteOpen(false);
        onRefresh();
      })
      .catch((error) => {
        if (error.response) {
          enqueueSnackbar(error.response.data.message || 'Error al eliminar cuenta', { variant: 'error' });
        } else {
          enqueueSnackbar(error.message, { variant: 'error' });
        }
      });
  };

  return (
    <StyledTableRow tabIndex={-1}>
      <StyledTableCell align="left">
        <Paragraph fontWeight={600}>{account.code}</Paragraph>
      </StyledTableCell>

      <StyledTableCell align="left">
        <Paragraph>{account.description}</Paragraph>
      </StyledTableCell>

      <StyledTableCell align="center">
        <Chip label={account.group} size="small" color="info" />
      </StyledTableCell>

      <StyledTableCell align="center">
        <Chip
          label={account.is_header ? 'Titular' : 'Detalle'}
          size="small"
          color={account.is_header ? 'default' : 'success'}
        />
      </StyledTableCell>

      <StyledTableCell align="center">{account.level}</StyledTableCell>

      <StyledTableCell align="left">
        <Paragraph>{account.parent_code || '-'}</Paragraph>
      </StyledTableCell>

      <StyledTableCell align="left">
        <Paragraph fontWeight={600}>{formatMonto(account.balance || 0)}</Paragraph>
      </StyledTableCell>

      <StyledTableCell align="center">
        <Stack direction="row" spacing={1} justifyContent="center">
          <Tooltip title="Editar cuenta">
            <StyledIconButton onClick={() => setIsEditOpen(true)}>
              <Edit color="secondary" />
            </StyledIconButton>
          </Tooltip>

          <Tooltip title="Eliminar cuenta">
            <StyledIconButton onClick={() => setIsDeleteOpen(true)}>
              <Delete color="error" />
            </StyledIconButton>
          </Tooltip>
        </Stack>
      </StyledTableCell>

      <EditAccountModal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        account={account}
        year={year}
        onSuccess={onRefresh}
      />

      <DeleteAccountModal
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        accountCode={account.code}
      />
    </StyledTableRow>
  );
};

export default AccountRow;
