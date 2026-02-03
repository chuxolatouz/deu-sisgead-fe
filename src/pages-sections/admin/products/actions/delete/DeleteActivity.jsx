import { useState } from "react";
import { useSnackbar } from "notistack";
import { useApi } from "contexts/AxiosContext";
import {
    Dialog,
    DialogTitle,
    DialogActions,
    Button,
    Tooltip
} from "@mui/material"
import Router from 'next/router';
import DeleteIcon from '@mui/icons-material/Delete';
import { StyledIconButton } from "pages-sections/admin";

const DeleteBudget = ({ budget }) => {
    const [open, setOpen] = useState(false);
    const { api } = useApi();
    const { enqueueSnackbar } = useSnackbar();

    const handleDeleteModal = () => {
        setOpen(true);
    }
    const handleCancelDelete = () => {
        setOpen(false);
    }
    const handleDelete = () => {
        const values = {
            project_id: budget.project_id.$oid,
            budget_id: budget._id.$oid
        }
        api.post('/documento_eliminar', values).then((response) => {

            enqueueSnackbar(response.data.message, { variant: "success" })
            Router.reload();
        }).catch((error) => {
            if (error.response) {
                enqueueSnackbar(error.response.data.message, { variant: 'error' })
            } else {
                enqueueSnackbar(error.message, { variant: 'error' })
            }
        })
    }

    return (
        <>
            <Tooltip title="Eliminar Actividad">
                <StyledIconButton onClick={handleDeleteModal}>
                    <DeleteIcon color="error" />
                </StyledIconButton>
            </Tooltip>
            <Dialog open={open} onClose={handleCancelDelete}>
                <DialogTitle>¿Estás seguro de que quieres eliminar este presupuesto?</DialogTitle>
                <DialogActions>
                    <Button color="error" onClick={handleCancelDelete}>Cancelar</Button>
                    <Button color="secondary" onClick={handleDelete}>Eliminar</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default DeleteBudget;