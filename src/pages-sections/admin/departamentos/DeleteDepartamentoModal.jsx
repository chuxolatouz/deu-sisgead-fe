import { Dialog, DialogContent, DialogActions, Button, Box } from "@mui/material";
import { H3, Paragraph } from "components/Typography";

const DeleteDepartamentoModal = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <Box textAlign="center">
          <H3 mb={2}>¿Está seguro de eliminar este departamento?</H3>
          <Paragraph>
            Esta acción no se puede deshacer. El departamento será eliminado permanentemente.
          </Paragraph>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Cancelar
        </Button>
        <Button onClick={onConfirm} variant="contained" color="error">
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDepartamentoModal;

