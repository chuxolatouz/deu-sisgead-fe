import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import TablePagination from "components/data-table/TablePagination";
import { useApi } from "contexts/AxiosContext";
import { useSnackbar } from "notistack";
import {
  loadDocumentAttachmentPreview,
  openDocumentAttachment,
} from "utils/documentAttachments";

const normalizeProjectId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value.$oid) return value.$oid;
  return "";
};

export default function ProductResults({ projectId }) {
  const normalizedProjectId = useMemo(
    () => normalizeProjectId(projectId),
    [projectId]
  );
  const [results, setResults] = useState([]);
  const [count, setCount] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedResult, setSelectedResult] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const { api } = useApi();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (!normalizedProjectId) return;
    setLoading(true);
    setError("");

    api
      .get(
        `/proyecto/${normalizedProjectId}/documentos?page=${
          page - 1
        }&limit=10&status=finished`
      )
      .then((response) => {
        setResults(response.data?.request_list || []);
        setCount(response.data?.count || 1);
      })
      .catch((err) => {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "No se pudieron cargar los resultados";
        setError(message);
        enqueueSnackbar(message, { variant: "error" });
      })
      .finally(() => setLoading(false));
  }, [api, enqueueSnackbar, normalizedProjectId, page]);

  useEffect(() => {
    if (!selectedResult) {
      setPreviewImages([]);
      setPreviewLoading(false);
      return undefined;
    }

    let active = true;
    const revokers = [];
    const attachments = selectedResult?.resultAttachments || [];

    if (!attachments.length) {
      setPreviewImages([]);
      setPreviewLoading(false);
      return undefined;
    }

    setPreviewLoading(true);
    Promise.all(
      attachments.map(async (attachment) => {
        const preview = await loadDocumentAttachmentPreview(api, attachment);
        revokers.push(preview.revoke);
        return {
          name: attachment.nombre || "Adjunto",
          url: preview.url,
          attachment,
        };
      })
    )
      .then((items) => {
        if (!active) return;
        setPreviewImages(items.filter((item) => item.url));
      })
      .catch((err) => {
        if (!active) return;
        enqueueSnackbar(
          err?.response?.data?.message ||
            err?.message ||
            "No se pudieron cargar las imágenes",
          { variant: "error" }
        );
      })
      .finally(() => {
        if (active) {
          setPreviewLoading(false);
        }
      });

    return () => {
      active = false;
      revokers.forEach((revoke) => revoke?.());
    };
  }, [api, enqueueSnackbar, selectedResult]);

  const handleOpenModal = (result) => {
    setSelectedResult(result);
  };

  const handleCloseModal = () => {
    setSelectedResult(null);
  };

  const handleOpenAttachment = async (attachment) => {
    try {
      await openDocumentAttachment(api, attachment);
    } catch (err) {
      enqueueSnackbar(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudo abrir la imagen adjunta",
        { variant: "error" }
      );
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography color="text.secondary">
          Cargando resultados de actividades...
        </Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  if (!results.length) {
    return (
      <Alert severity="info" variant="outlined">
        No hay resultados publicados para este proyecto.
      </Alert>
    );
  }

  return (
    <>
      <Stack spacing={2}>
        {results.map((result) => {
          const attachments = result?.resultAttachments || [];
          return (
            <Paper key={result?._id?.$oid || result?.descripcion} variant="outlined" sx={{ p: 2.5 }}>
              <Stack spacing={1.5}>
                <Typography variant="subtitle1" fontWeight={700}>
                  {result.descripcion || "Actividad sin nombre"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {result.resultDescription || "Sin descripción final."}
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Button
                    variant="outlined"
                    onClick={() => handleOpenModal(result)}
                    disabled={!attachments.length}
                  >
                    {attachments.length
                      ? `Ver imágenes (${attachments.length})`
                      : "Sin imágenes adjuntas"}
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          );
        })}
      </Stack>

      <Stack alignItems="center" my={4}>
        <TablePagination
          onChange={(_, nextPage) => setPage(nextPage)}
          page={page}
          count={count || 1}
        />
      </Stack>

      <Dialog
        open={Boolean(selectedResult)}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Imágenes del resultado: {selectedResult?.descripcion || "Actividad"}
        </DialogTitle>
        <DialogContent dividers>
          {previewLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={28} />
            </Box>
          ) : !previewImages.length ? (
            <Alert severity="info" variant="outlined">
              Esta actividad no tiene imágenes adjuntas.
            </Alert>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 2,
              }}
            >
              {previewImages.map((item) => (
                <Paper key={`${item.name}-${item.url}`} variant="outlined" sx={{ p: 1.5 }}>
                  <Box
                    component="img"
                    src={item.url}
                    alt={item.name}
                    sx={{
                      width: "100%",
                      maxHeight: 320,
                      objectFit: "contain",
                      borderRadius: 1,
                      bgcolor: "grey.100",
                    }}
                  />
                  <Stack
                    mt={1.5}
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Typography variant="body2">{item.name}</Typography>
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => handleOpenAttachment(item.attachment)}
                    >
                      Abrir
                    </Button>
                  </Stack>
                </Paper>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} variant="outlined">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
