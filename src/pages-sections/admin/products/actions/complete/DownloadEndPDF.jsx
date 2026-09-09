import { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
} from '@mui/material';
import { PictureAsPdfOutlined } from '@mui/icons-material';
import { pdf, PDFViewer } from '@react-pdf/renderer';
import { useSnackbar } from 'notistack';
import { Paragraph } from 'components/Typography';
import { useApi } from 'contexts/AxiosContext';
import { StyledIconButton } from 'pages-sections/admin';

import ActaFin from './EndPDF';

const slugify = (text) => {
  const value = (text || 'proyecto').toString().trim().toLowerCase();
  const normalized = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const safe = normalized.replace(/[^a-z0-9_-]+/g, '_').replace(/^_+|_+$/g, '');
  return safe || 'proyecto';
};

const downloadBlob = (blobData, filename) => {
  const url = window.URL.createObjectURL(blobData);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

function DownloadEndPDF({ project }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [movements, setMovements] = useState([]);
  const [logs, setLogs] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loadError, setLoadError] = useState('');
  const { api } = useApi();
  const { enqueueSnackbar } = useSnackbar();

  const handleOpen = async () => {
    setOpen(true);
    setLoading(true);
    setLoadError('');
    try {
      const response = await api.get(`/proyecto/${project._id}/fin`);
      setLogs(response?.data?.logs || []);
      setBudgets(response?.data?.documentos || []);
      setMovements(response?.data?.movimientos || []);
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'No se pudo cargar el acta';
      setLoadError(message);
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setLoadError('');
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const blob = await pdf(
        <ActaFin
          project={project}
          movements={movements}
          logs={logs}
          budgets={budgets}
        />
      ).toBlob();
      const fileName = `acta_finalizacion_preview_${slugify(project?.nombre)}_${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`;
      downloadBlob(blob, fileName);
      enqueueSnackbar('Acta de finalizacion descargada', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(error?.message || 'No se pudo descargar el PDF', {
        variant: 'error',
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <Paragraph>Descargar Acta de Finalización</Paragraph>
      <StyledIconButton onClick={handleOpen}>
        <PictureAsPdfOutlined />
      </StyledIconButton>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
        <DialogContent sx={{ p: 1.5 }}>
          {loading ? (
            <Box
              sx={{
                width: '100%',
                height: '45vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CircularProgress color="success" />
            </Box>
          ) : loadError ? (
            <Box sx={{ p: 2 }}>
              <Typography color="error" variant="body2">
                {loadError}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ width: '100%', height: '76vh', minHeight: 420 }}>
              <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }}>
                <ActaFin
                  project={project}
                  movements={movements}
                  logs={logs}
                  budgets={budgets}
                />
              </PDFViewer>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button
            variant="contained"
            onClick={handleDownload}
            disabled={loading || !!loadError || downloading}
          >
            {downloading ? <CircularProgress color="inherit" size={18} /> : 'Descargar'}
          </Button>
          <Button color="error" onClick={handleClose}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default DownloadEndPDF;
