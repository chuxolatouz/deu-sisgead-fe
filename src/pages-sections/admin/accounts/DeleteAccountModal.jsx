import { Dialog, DialogContent, DialogActions, Button, Box } from '@mui/material';
import { H3, Paragraph } from 'components/Typography';

const DeleteAccountModal = ({ open, onClose, onConfirm, accountCode }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <Box textAlign="center">
          <H3 mb={2}>¿Eliminar cuenta contable?</H3>
          <Paragraph>
            Se eliminará la cuenta <strong>{accountCode}</strong> si no tiene hijos ni movimientos.
          </Paragraph>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">Cancelar</Button>
        <Button onClick={onConfirm} variant="contained" color="error">Eliminar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteAccountModal;
