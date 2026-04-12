import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Box,
  Chip,
  Divider,
  Tooltip,
} from "@mui/material";
import { H3, Span } from "components/Typography";
import { FlexBox } from "components/flex-box";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import { StyledIconButton } from "pages-sections/admin/StyledComponents";
import { currency } from "lib";
import { useApi } from "contexts/AxiosContext";
import { useSnackbar } from "notistack";
import { openDocumentAttachment } from "utils/documentAttachments";

export default function ShowDocument({ budgets }) {
  const [isOpen, setIsOpen] = useState(false);
  const { api } = useApi();
  const { enqueueSnackbar } = useSnackbar();
  const specificObjective =
    budgets?.specificObjective || budgets?.objetivo_especifico;
  const transferAmount =
    budgets?.transferAmount || budgets?.monto_transferencia;
  const accountCode = budgets?.accountCode || budgets?.cuenta_contable;
  const resultDescription =
    budgets?.resultados || budgets?.resultDescription || budgets?.description;
  const resultAttachments =
    budgets?.resultAttachments || budgets?.archivos_aprobado || [];
  const lineasAccion = budgets?.lineasAccion || budgets?.lineas_accion;
  const hasAdministrativeInfo =
    budgets?.status !== "new" &&
    (budgets?.referencia || transferAmount || budgets?.banco || accountCode);
  const statusLabel =
    budgets?.status === "finished"
      ? "Finalizada"
      : budgets?.status === "in_progress"
      ? "Cierre administrativo"
      : "Nueva";

  const handleDownload = async (archivo) => {
    try {
      const opened = await openDocumentAttachment(api, archivo);
      if (!opened) {
        enqueueSnackbar("No se encontró una URL válida para este archivo", {
          variant: "error",
        });
      }
    } catch (error) {
      enqueueSnackbar(
        error?.response?.data?.message ||
          error?.message ||
          "No se pudo abrir el archivo",
        { variant: "error" }
      );
    }
  };

  return (
    <>
      <StyledIconButton onClick={() => setIsOpen(true)}>
        <Tooltip title="Ver Actividad">
          <RemoveRedEyeIcon />
        </Tooltip>
      </StyledIconButton>
      <Dialog open={isOpen} fullWidth>
        <DialogTitle>
          <H3> Archivos de la actividad {budgets.descripcion} </H3>
        </DialogTitle>
        <DialogContent>
          <Box mt={2} mb={3}>
            <Chip
              label={statusLabel}
              color={budgets?.status === "finished" ? "success" : budgets?.status === "in_progress" ? "warning" : "default"}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            {specificObjective && (
              <FlexBox alignItems="center" gap={1} mb={2}>
                <Span color="grey.600" fontSize={14}>
                  Objetivo específico:
                </Span>
                <Span fontSize={14} fontWeight="bold">
                  {specificObjective}
                </Span>
              </FlexBox>
            )}

            <FlexBox alignItems="center" gap={1} mb={2}>
              <Span color="grey.600">Monto de la actividad:</Span>
              <H3 mt={0} mb={0}>
                {currency(budgets.monto)}
              </H3>
            </FlexBox>

            {hasAdministrativeInfo && (
                <Box mb={3}>
                  <Divider sx={{ mb: 2 }} />
                  <H3 mb={2}>Cierre administrativo</H3>

                  {budgets.referencia && (
                    <FlexBox alignItems="center" gap={1} mb={1}>
                      <Span color="grey.600">Referencia:</Span>
                      <Span fontWeight="bold">{budgets.referencia}</Span>
                    </FlexBox>
                  )}

                  {budgets.monto_aprobado && (
                    <FlexBox alignItems="center" gap={1} mb={1}>
                      <Span color="grey.600">Monto aprobado:</Span>
                      <Span fontWeight="bold">{currency(budgets.monto_aprobado)}</Span>
                    </FlexBox>
                  )}

                  {transferAmount && (
                    <FlexBox alignItems="center" gap={1} mb={1}>
                      <Span color="grey.600">Monto transferido:</Span>
                      <Span fontWeight="bold">{currency(transferAmount)}</Span>
                    </FlexBox>
                  )}

                  {budgets.banco && (
                    <FlexBox alignItems="center" gap={1} mb={1}>
                      <Span color="grey.600">Banco:</Span>
                      <Span fontWeight="bold">{budgets.banco}</Span>
                    </FlexBox>
                  )}

                  {accountCode && (
                    <FlexBox alignItems="center" gap={1}>
                      <Span color="grey.600">Partida:</Span>
                      <Span fontWeight="bold">{accountCode}</Span>
                    </FlexBox>
                  )}
                </Box>
              )}
          </Box>
          <Divider />
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {budgets?.archivos?.map((archivo) => (
                <TableRow key={archivo.nombre}>
                  <TableCell>{archivo.nombre}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      onClick={() => handleDownload(archivo)}
                    >
                      Descargar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Divider />
          {budgets.status === "finished" && (
            <Box>
              {resultDescription && (
                <>
                  <H3>Resultados:</H3>
                  <Span display="block" mb={2}>{resultDescription}</Span>
                </>
              )}
              {budgets?.logros && (
                <>
                  <H3>Logros:</H3>
                  <Span display="block" mb={2}>{budgets.logros}</Span>
                </>
              )}
              {budgets?.limitaciones && (
                <>
                  <H3>Limitaciones:</H3>
                  <Span display="block" mb={2}>{budgets.limitaciones}</Span>
                </>
              )}
              {budgets?.lecciones && (
                <>
                  <H3>Lecciones:</H3>
                  <Span display="block" mb={2}>{budgets.lecciones}</Span>
                </>
              )}
              {lineasAccion && (
                <>
                  <H3>Lineas de accion:</H3>
                  <Span display="block" mb={2}>{lineasAccion}</Span>
                </>
              )}
              <H3>Adjuntos del resultado:</H3>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resultAttachments.length ? (
                    resultAttachments.map((archivo) => (
                      <TableRow key={archivo.nombre}>
                        <TableCell>{archivo.nombre}</TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            onClick={() => handleDownload(archivo)}
                          >
                            Descargar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2}>No hay imagenes de resultado cargadas</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            color="error"
            onClick={() => setIsOpen(false)}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
