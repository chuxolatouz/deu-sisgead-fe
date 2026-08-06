import { useState } from "react";
import { Button, Stack, CircularProgress } from "@mui/material";
import { useSnackbar } from "notistack";
import { pdf } from "@react-pdf/renderer";

import { useApi } from "contexts/AxiosContext";
import ActaInicioPDF from "./ActaInicioPDF";

const formatDate = () => new Date().toISOString().slice(0, 10);

const slugify = (text) => {
  const value = (text || "proyecto").toString().trim().toLowerCase();
  const normalized = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const safe = normalized.replace(/[^a-z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
  return safe || "proyecto";
};

const downloadBlob = (blobData, filename) => {
  const url = window.URL.createObjectURL(blobData);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

function DownloadProjectDocuments({ project }) {
  const { api } = useApi();
  const { enqueueSnackbar } = useSnackbar();
  const [loadingActa, setLoadingActa] = useState(false);

  const projectName = slugify(project?.nombre);
  const projectDepartmentId = project?.departmentId || project?.departamento_id;

  const handleDownloadActa = async () => {
    setLoadingActa(true);
    try {
      // Fetch departamento name
      let departamentoNombre = "N/A";
      if (projectDepartmentId) {
        try {
          const deptResponse = await api.get(
            `/departamentos/${projectDepartmentId}`
          );
          departamentoNombre = deptResponse.data?.nombre || "N/A";
        } catch (err) {
          console.warn("Could not fetch department name:", err);
        }
      }

      // Fetch recursos (documentos)
      let recursos = [];
      try {
        const recursosResponse = await api.get(`/proyecto/${project._id}/fin`);
        const documentos = recursosResponse.data?.documentos || [];
        recursos = documentos.map((doc) => {
          let monto = doc.monto_aprobado ?? doc.monto ?? 0;
          if (typeof monto === "number") {
            monto = monto / 100;
          }
          return {
            cuenta: doc.accountCode || doc.cuenta_contable || "N/A",
            descripcion: doc.descripcion || "N/A",
            monto: monto,
          };
        });
      } catch (err) {
        console.warn("Could not fetch recursos:", err);
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
      enqueueSnackbar("Acta de inicio descargada exitosamente", {
        variant: "success",
      });
    } catch (error) {
      console.error("Error generating acta de inicio:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "No se pudo generar el acta de inicio";
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setLoadingActa(false);
    }
  };

  return (
    <Stack spacing={1.5}>
      <Button
        variant="outlined"
        onClick={handleDownloadActa}
        disabled={loadingActa || !project?._id}
      >
        {loadingActa ? (
          <CircularProgress size={18} />
        ) : (
          "Descargar Acta de Inicio (PDF)"
        )}
      </Button>
    </Stack>
  );
}

export default DownloadProjectDocuments;
