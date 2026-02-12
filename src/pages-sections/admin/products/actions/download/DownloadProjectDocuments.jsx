import { useState } from 'react';
import { Button, Stack, CircularProgress } from '@mui/material';
import { useSnackbar } from 'notistack';
import { pdf } from '@react-pdf/renderer';

import { useApi } from 'contexts/AxiosContext';
import ActaInicioPDF from './ActaInicioPDF';
import InformeActividadPDF from './InformeActividadPDF';

const formatDate = () => new Date().toISOString().slice(0, 10);

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

function DownloadProjectDocuments({ project }) {
  const { api } = useApi();
  const { enqueueSnackbar } = useSnackbar();
  const [loadingActa, setLoadingActa] = useState(false);
  const [loadingInforme, setLoadingInforme] = useState(false);

  const projectName = slugify(project?.nombre);

  const handleDownloadActa = async () => {
    setLoadingActa(true);
    try {
      // Fetch departamento name
      let departamentoNombre = 'N/A';
      if (project?.departamento_id) {
        try {
          const deptResponse = await api.get(`/departamentos/mostrar_departamento/${project.departamento_id}`);
          departamentoNombre = deptResponse.data?.nombre || 'N/A';
        } catch (err) {
          console.warn('Could not fetch department name:', err);
        }
      }

      // Fetch recursos (documentos)
      let recursos = [];
      try {
        const recursosResponse = await api.get(`/proyecto/${project._id}/fin`);
        const documentos = recursosResponse.data?.documentos || [];
        recursos = documentos.map(doc => {
          let monto = doc.monto_aprobado ?? doc.monto ?? 0;
          if (typeof monto === 'number') {
            monto = monto / 100;
          }
          return {
            cuenta: doc.cuenta_contable || 'N/A',
            descripcion: doc.descripcion || 'N/A',
            monto: monto,
          };
        });
      } catch (err) {
        console.warn('Could not fetch recursos:', err);
      }

      // Generate PDF
      const blob = await pdf(
        <ActaInicioPDF
          project={project}
          departamento={departamentoNombre}
          recursos={recursos}
        />
      ).toBlob();

      const fileName = `acta_inicio_${projectName}_${formatDate()}.pdf`;
      downloadBlob(blob, fileName);
      enqueueSnackbar('Acta de inicio descargada exitosamente', { variant: 'success' });
    } catch (error) {
      console.error('Error generating acta de inicio:', error);
      const message = error?.response?.data?.message || error?.message || 'No se pudo generar el acta de inicio';
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setLoadingActa(false);
    }
  };

  const handleDownloadInforme = async () => {
    setLoadingInforme(true);
    try {
      // Generate PDF with default data
      const blob = await pdf(
        <InformeActividadPDF
          project={project}
          data={{}}
        />
      ).toBlob();

      const fileName = `informe_actividad_${projectName}_${formatDate()}.pdf`;
      downloadBlob(blob, fileName);
      enqueueSnackbar('Informe de actividad descargado exitosamente', { variant: 'success' });
    } catch (error) {
      console.error('Error generating informe de actividad:', error);
      const message = error?.response?.data?.message || error?.message || 'No se pudo generar el informe de actividad';
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setLoadingInforme(false);
    }
  };

  return (
    <Stack spacing={1.5}>
      <Button
        variant="outlined"
        onClick={handleDownloadActa}
        disabled={loadingActa || !project?._id}
      >
        {loadingActa ? <CircularProgress size={18} /> : 'Descargar Acta de Inicio (PDF)'}
      </Button>
      <Button
        variant="outlined"
        color="secondary"
        onClick={handleDownloadInforme}
        disabled={loadingInforme || !project?._id}
      >
        {loadingInforme ? <CircularProgress size={18} /> : 'Descargar Informe de Actividad (PDF)'}
      </Button>
    </Stack>
  );
}

export default DownloadProjectDocuments;
