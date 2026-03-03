"use client";

import { useState } from "react";
import {
  Button,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useApi } from "contexts/AxiosContext";

function DescargarMovimientosConModal({ id }) {
  const [open, setOpen] = useState(false);
  const [formato, setFormato] = useState("csv");
  const { api } = useApi();
  const { enqueueSnackbar } = useSnackbar();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleDownload = async () => {
    try {
      const response = await api.get(
        `/proyecto/${id}/movimientos/descargar?formato=${formato}`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `timeline_movimientos.${formato}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      handleClose(); // Cerrar modal después de descargar
    } catch (error) {
      if (error.response) {
        enqueueSnackbar(error.response.data.error || "Error al descargar", {
          variant: "error",
        });
      } else {
        enqueueSnackbar(error.message, { variant: "error" });
      }
    }
  };

  return (
    <Box>
      <Button variant="outlined" color="secondary" onClick={handleOpen}>
        Descargar Timeline
      </Button>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Descargar Timeline</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <Typography>
            Selecciona el formato para exportar la línea de tiempo financiera
            del proyecto:
          </Typography>
          <Select
            value={formato}
            onChange={(e) => setFormato(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="csv">CSV</MenuItem>
            <MenuItem value="json">JSON</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleClose} color="error">
            Cancelar
          </Button>
          <Button variant="outlined" onClick={handleDownload} color="success">
            Descargar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DescargarMovimientosConModal;
