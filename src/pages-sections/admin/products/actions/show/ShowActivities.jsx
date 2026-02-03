import { useState } from 'react';
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
  Tooltip
} from '@mui/material';
import { H3, Span } from "components/Typography";
import { FlexBox } from "components/flex-box";
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { StyledIconButton } from "pages-sections/admin/StyledComponents";
import { currency } from 'lib';

export default function ShowDocument({ budgets }) {
  const [isOpen, setIsOpen] = useState(false);


  const handleDownload = async (archivo) => {
    if (archivo.download_url) {
      window.open(archivo.download_url, '_blank');
    } else if (archivo.url) {
      window.open(archivo.url, '_blank');
    } else if (archivo.public_id) {
      window.open(`https://f005.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId=${archivo.public_id}`, '_blank');
    } else {
      alert("No se encontró una URL válida para este archivo");
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
            {budgets?.objetivo_especifico && (
              <FlexBox alignItems="center" gap={1} mb={2}>
                <Span color="grey.600" fontSize={14}>
                  Objetivo específico:
                </Span>
                <Span fontSize={14} fontWeight="bold">
                  {budgets.objetivo_especifico}
                </Span>
              </FlexBox>
            )}

            <FlexBox alignItems="center" gap={1} mb={2}>
              <Span color="grey.600">Monto presupuestado:</Span>
              <H3 mt={0} mb={0}>{currency(budgets.monto)}</H3>
            </FlexBox>

            {budgets.status === "finished" && (budgets.referencia || budgets.monto_transferencia || budgets.banco || budgets.cuenta_contable) && (
              <Box mb={3}>
                <Divider sx={{ mb: 2 }} />
                <H3 mb={2}>Información de Transferencia</H3>

                {budgets.referencia && (
                  <FlexBox alignItems="center" gap={1} mb={1}>
                    <Span color="grey.600">Referencia:</Span>
                    <Span fontWeight="bold">{budgets.referencia}</Span>
                  </FlexBox>
                )}

                {budgets.monto_transferencia && (
                  <FlexBox alignItems="center" gap={1} mb={1}>
                    <Span color="grey.600">Monto Transferido:</Span>
                    <Span fontWeight="bold">{currency(budgets.monto_transferencia)}</Span>
                  </FlexBox>
                )}

                {budgets.banco && (
                  <FlexBox alignItems="center" gap={1} mb={1}>
                    <Span color="grey.600">Banco:</Span>
                    <Span fontWeight="bold">{budgets.banco}</Span>
                  </FlexBox>
                )}

                {budgets.cuenta_contable && (
                  <FlexBox alignItems="center" gap={1}>
                    <Span color="grey.600">Cuenta Contable:</Span>
                    <Span fontWeight="bold">{budgets.cuenta_contable}</Span>
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
                    <Button variant="outlined" onClick={() => handleDownload(archivo)}>Descargar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Divider />
          {budgets.status === "finished" && <Box>
            <H3>Justificantes:</H3>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {budgets?.archivos_aprobado?.map((archivo) => (
                  <TableRow key={archivo.nombre}>
                    <TableCell>{archivo.nombre}</TableCell>
                    <TableCell>
                      <Button variant="outlined" onClick={() => handleDownload(archivo)}>Descargar</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>}
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="error" onClick={() => setIsOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
