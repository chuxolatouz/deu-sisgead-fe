import { Button } from "@mui/material";
import { useSnackbar } from "notistack";
import { useApi } from "contexts/AxiosContext";
import { normalizeMongoId } from "lib";
import {
  StatusWrapper,
  StyledTableCell,
  StyledTableRow,
} from "../StyledComponents";
import ShowRules from "./ShowRules";
import DeleteRule from "./DeleteRule";

// ========================================================================

// ========================================================================

const RequestRow = ({ request, fetchRequest }) => {
  const { nombre, reglas, status, _id } = request;
  const { api, user } = useApi();
  const { enqueueSnackbar } = useSnackbar();
  const requestId = normalizeMongoId(_id);
  const actorRole = user?.role || user?.rol || "";
  const canResolve = actorRole === "super_admin";

  const handleRequest = (resolution) => {
    if (!requestId) {
      enqueueSnackbar("No se pudo identificar la solicitud", {
        variant: "error",
      });
      return;
    }

    const value = {
      resolution: resolution === "accept" ? "completed" : "rejected",
    };
    api
      .post(`/completar_solicitud_regla_fija/${requestId}`, value)
      .then((response) => {
        enqueueSnackbar(response.data.message, { variant: "success" });
        fetchRequest();
      })
      .catch((error) => {
        enqueueSnackbar(
          error?.response?.data?.message ||
            error?.message ||
            "No se pudo actualizar la solicitud",
          { variant: "error" }
        );
      });
  };
  return (
    <StyledTableRow tabIndex={-1} role="checkbox">
      <StyledTableCell
        align="left"
        sx={{
          fontWeight: 400,
        }}
      >
        {nombre}
      </StyledTableCell>

      <StyledTableCell
        align="left"
        sx={{
          fontWeight: 400,
        }}
      >
        {reglas?.length || 0}
      </StyledTableCell>

      <StyledTableCell
        align="left"
        sx={{
          fontWeight: 400,
        }}
      >
        <StatusWrapper status={status}>{status}</StatusWrapper>
      </StyledTableCell>

      <StyledTableCell align="center">
        {status === "new" && canResolve && (
          <>
            <Button
              variant="outlined"
              color="success"
              onClick={() => handleRequest("accept")}
            >
              Aceptar
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleRequest("cancel")}
            >
              Rechazar
            </Button>
          </>
        )}
        <ShowRules nombre={nombre} reglas={reglas} />
        {status !== "assigned" && canResolve && (
          <DeleteRule id={requestId} fetchRequest={fetchRequest} />
        )}
      </StyledTableCell>
    </StyledTableRow>
  );
};
export default RequestRow;
