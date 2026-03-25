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
  const resultDescription = budgets?.resultDescription || budgets?.description;
  const resultAttachments =
    budgets?.resultAttachments || budgets?.archivos_aprobado || [];

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
              <Span color="grey.600">Monto presupuestado:</Span>
              <H3 mt={0} mb={0}>
                {currency(budgets.monto)}
              </H3>
            </FlexBox>

            {budgets.status === "finished" &&
              (budgets.referencia ||
                transferAmount ||
                budgets.banco ||
                accountCode) && (
                <Box mb={3}>
                  <Divider sx={{ mb: 2 }} />
                  <H3 mb={2}>Información de Transferencia</H3>

                  {budgets.referencia && (
                    <FlexBox alignItems="center" gap={1} mb={1}>
                      <Span color="grey.600">Referencia:</Span>
                      <Span fontWeight="bold">{budgets.referencia}</Span>
                    </FlexBox>
                  )}

                  {transferAmount && (
                    <FlexBox alignItems="center" gap={1} mb={1}>
                      <Span color="grey.600">Monto Transferido:</Span>
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
                  <H3>Resultado:</H3>
                  <Span display="block" mb={2}>{resultDescription}</Span>
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
                  {resultAttachments.map((archivo) => (
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
