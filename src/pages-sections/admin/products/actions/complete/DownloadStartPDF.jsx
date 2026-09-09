import { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
} from '@mui/material';
import { PictureAsPdfOutlined } from '@mui/icons-material';
import { pdf, PDFViewer } from '@react-pdf/renderer';
import { useSnackbar } from 'notistack';
import { Paragraph } from 'components/Typography';
import { StyledIconButton } from 'pages-sections/admin';

import Acta from './StartPDF';

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

function DownloadStartPDF({ project }) {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const blob = await pdf(<Acta project={project} />).toBlob();
      const fileName = `acta_inicio_preview_${slugify(project?.nombre)}_${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`;
      downloadBlob(blob, fileName);
      enqueueSnackbar('Acta de inicio descargada', { variant: 'success' });
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
      <Paragraph>Descargar Acta de Inicio</Paragraph>
      <StyledIconButton onClick={handleOpen}>
        <PictureAsPdfOutlined />
      </StyledIconButton>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
        <DialogContent sx={{ p: 1.5 }}>
          <Box sx={{ width: '100%', height: '76vh', minHeight: 420 }}>
            <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }}>
              <Acta project={project} />
            </PDFViewer>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button
            variant="contained"
            onClick={handleDownload}
            disabled={downloading}
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

export default DownloadStartPDF;
