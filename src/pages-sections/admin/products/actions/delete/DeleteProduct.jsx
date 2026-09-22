import { useState } from "react";
import { Delete } from "@mui/icons-material";
import {
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  Tooltip,
} from "@mui/material";
import { useSnackbar } from "notistack";
import Router from "next/router";
import { StyledIconButton } from "pages-sections/admin/StyledComponents";
import { useApi } from "contexts/AxiosContext";
import { normalizeMongoId } from "lib";

const DeleteProduct = ({ product, fetchProducts }) => {
  const [open, setOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { api } = useApi();

  const handleDelete = () => {
    setOpen(true);
  };

  const handleConfirmDelete = () => {
    const projectId = normalizeMongoId(product);
    if (!projectId) {
      enqueueSnackbar("No se pudo identificar el proyecto", {
        variant: "error",
      });
      return;
    }
    const data = {
      projectId,
    };
    api
      .post("/eliminar_proyecto", data)
      .then((response) => {
        fetchProducts();
        enqueueSnackbar(response.data.message, { variant: "success" });
        setOpen(false);
      })
      .catch((error) => {
        if (error.response) {
          enqueueSnackbar(error.response.data.message, { variant: "error" });
        } else {
          enqueueSnackbar(error.message, { variant: "error" });
        }
      });
  };

  const handleCancelDelete = () => {
    // Cierra el cuadro de diálogo de confirmación.
    setOpen(false);
  };

  return (
    <>
      {product.status.finished ||
        (!product.status?.completado?.includes(1) && (
          <StyledIconButton onClick={handleDelete} color="error">
            <Tooltip title="Eliminar Proyecto">
              <Delete color="error" />
            </Tooltip>
          </StyledIconButton>
        ))}
      <Dialog open={open} onClose={handleCancelDelete}>
        <DialogTitle>
          ¿Estás seguro de que quieres eliminar este Proyecto?
        </DialogTitle>
        <DialogActions>
          <Button color="error" onClick={handleCancelDelete}>
            Cancelar
          </Button>
          <Button color="secondary" onClick={handleConfirmDelete}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeleteProduct;
