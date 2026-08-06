import { useState } from "react";
import { CircularProgress, Tooltip } from "@mui/material";
import { PictureAsPdf } from "@mui/icons-material";
import { pdf } from "@react-pdf/renderer";
import { useSnackbar } from "notistack";
import { formatMonto } from "lib";
import { StyledIconButton } from "pages-sections/admin/StyledComponents";
import InformeActividadPDF from "./InformeActividadPDF";

const statusLabels = {
  new: "Nueva",
  partial_admin_closed: "Cierre administrativo parcial",
  in_progress: "En progreso",
  finished: "Finalizada",
};

const dateValue = (value) => {
  const raw = value?.$date || value;
  if (!raw) return "";
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime())
    ? ""
    : parsed.toLocaleDateString("es-VE");
};

const safeSlug = (value) => {
  const normalized = String(value || "actividad")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return (
    normalized
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "actividad"
  );
};

const attachmentNames = (attachments) =>
  (attachments || [])
    .map((attachment) => attachment?.nombre)
    .filter(Boolean)
    .join(", ");

function DownloadActivityReport({ budget, project }) {
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleDownload = async () => {
    setLoading(true);
    try {
      const items = Array.isArray(budget?.items) ? budget.items : [];
      const objectives =
        budget?.specificObjectives || budget?.objetivos_especificos || [];
      const amountInCents = Number(
        budget?.monto_aprobado ?? budget?.monto ?? 0
      );
      const activityData = {
        fecha: dateValue(
          budget?.finalizedAt || budget?.finalized_at || budget?.created_at
        ),
        nombre_actividad: budget?.descripcion,
        objetivo: Array.isArray(objectives)
          ? objectives.join("\n")
          : objectives,
        descripcion: budget?.descripcion,
        linea_estrategica: statusLabels[budget?.status] || budget?.status,
        recursos: items
          .map((item) => {
            const amount = formatMonto(
              (Number(item?.montoAprobado ?? item?.monto ?? 0) || 0) / 100
            );
            const account = item?.accountCode || item?.cuenta_contable;
            return `${item?.nombre || "Item"}: ${amount}${
              account ? ` | Cuenta: ${account}` : ""
            }`;
          })
          .join("\n"),
        resultados:
          budget?.resultados ||
          budget?.resultDescription ||
          budget?.description,
        logros: budget?.logros,
        limitaciones: budget?.limitaciones,
        lecciones: budget?.lecciones,
        lineas_accion: budget?.lineasAccion || budget?.lineas_accion,
        registro_fotografico: attachmentNames(
          budget?.resultAttachments || budget?.archivos_aprobado
        ),
        factura: attachmentNames(budget?.administrativeAttachments),
        presupuesto: formatMonto(amountInCents / 100),
      };
      const blob = await pdf(
        <InformeActividadPDF project={project} data={activityData} />
      ).toBlob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `informe_actividad_${safeSlug(budget?.descripcion)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      enqueueSnackbar("Informe de actividad descargado", {
        variant: "success",
      });
    } catch (error) {
      enqueueSnackbar(error?.message || "No se pudo generar el informe", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tooltip title="Descargar informe de actividad">
      <span>
        <StyledIconButton onClick={handleDownload} disabled={loading}>
          {loading ? <CircularProgress size={20} /> : <PictureAsPdf />}
        </StyledIconButton>
      </span>
    </Tooltip>
  );
}

export default DownloadActivityReport;
