import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import DropZone from "components/DropZone";
import { useApi } from "contexts/AxiosContext";
import { useSnackbar } from "notistack";

function FinalizeActivity({ budget, onComplete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [resultados, setResultados] = useState("");
  const [logros, setLogros] = useState("");
  const [limitaciones, setLimitaciones] = useState("");
  const [lecciones, setLecciones] = useState("");
  const [lineasAccion, setLineasAccion] = useState("");
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const { api } = useApi();
  const { enqueueSnackbar } = useSnackbar();
  const resolvedProjectId = budget?.projectId || budget?.project_id?.$oid;

  const handleOpen = () => {
    if (budget.status === "in_progress") {
      setIsOpen(true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setResultados("");
    setLogros("");
    setLimitaciones("");
    setLecciones("");
    setLineasAccion("");
    setFiles([]);
  };

  const handleFinalize = () => {
    if (!resultados.trim()) {
      enqueueSnackbar("Debes agregar los resultados de la actividad", {
        variant: "error",
      });
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("projectId", resolvedProjectId || "");
    formData.append("docId", budget._id.$oid);
    formData.append("resultados", resultados.trim());
    formData.append("logros", logros.trim());
    formData.append("limitaciones", limitaciones.trim());
    formData.append("lecciones", lecciones.trim());
    formData.append("lineasAccion", lineasAccion.trim());

    files.forEach((file) => {
      formData.append("files", file);
    });

    api
      .post("/documento_finalizar", formData)
      .then((response) => {
        handleClose();
        enqueueSnackbar(response.data.mensaje, { variant: "success" });
        onComplete?.();
      })
      .catch((error) => {
        if (error.response) {
          enqueueSnackbar(
            error.response.data.error || error.response.data.mensaje,
            { variant: "error" }
          );
        } else {
          enqueueSnackbar(
            error.message || "Error al finalizar la actividad",
            { variant: "error" }
          );
        }
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const fileList = files.map((file) => (
    <Box key={file.path}>{`${file.path}-${file.size}bytes`}</Box>
  ));

  return (
    <Box>
      <Chip
        color="warning"
        onClick={handleOpen}
        clickable
        variant="outlined"
        label="Finalizar actividad"
      />
      <Dialog open={isOpen} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Finalizar actividad: {budget.descripcion}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
            <InputLabel id="resultados">Resultados</InputLabel>
            <OutlinedInput
              label="Resultados"
              value={resultados}
              onChange={(e) => setResultados(e.target.value)}
              multiline
              minRows={3}
            />
          </FormControl>

          <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
            <InputLabel id="logros">Logros</InputLabel>
            <OutlinedInput
              label="Logros"
              value={logros}
              onChange={(e) => setLogros(e.target.value)}
              multiline
              minRows={3}
            />
          </FormControl>

          <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
            <InputLabel id="limitaciones">Limitaciones</InputLabel>
            <OutlinedInput
              label="Limitaciones"
              value={limitaciones}
              onChange={(e) => setLimitaciones(e.target.value)}
              multiline
              minRows={3}
            />
          </FormControl>

          <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
            <InputLabel id="lecciones">Lecciones</InputLabel>
            <OutlinedInput
              label="Lecciones"
              value={lecciones}
              onChange={(e) => setLecciones(e.target.value)}
              multiline
              minRows={3}
            />
          </FormControl>

          <FormControl fullWidth variant="outlined" sx={{ mt: 2, mb: 2 }}>
            <InputLabel id="lineas-accion">Lineas de accion</InputLabel>
            <OutlinedInput
              label="Lineas de accion"
              value={lineasAccion}
              onChange={(e) => setLineasAccion(e.target.value)}
              multiline
              minRows={3}
            />
          </FormControl>

          <DropZone
            onChange={(file) => {
              setFiles(file);
            }}
            title="Arrastra las imagenes del resultado aqui"
            imageSize="Solo imagenes JPG, JPEG, PNG o GIF"
            accept={{
              "image/*": [".png", ".gif", ".jpeg", ".jpg"],
            }}
          />
          <aside>
            <h4>Imagenes</h4>
            <ul>{fileList}</ul>
          </aside>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="error" onClick={handleClose}>
            Cancelar
          </Button>
          <LoadingButton
            variant="outlined"
            color="secondary"
            onClick={handleFinalize}
            loading={submitting}
          >
            Finalizar actividad
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default FinalizeActivity;
