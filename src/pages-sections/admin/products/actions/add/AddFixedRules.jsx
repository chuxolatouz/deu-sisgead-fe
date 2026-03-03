import { useEffect, useMemo, useState } from "react";
import Router from "next/router";
import { useApi } from "contexts/AxiosContext";
import { useSnackbar } from "notistack";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";

import TodoList from "components/icons/duotone/TodoList";
import AccountSelector from "components/accounting/AccountSelector";
import { formatMonto } from "lib";

function AddFixedRules({ id }) {
  const [rules, setRules] = useState([]);
  const [selectedRuleId, setSelectedRuleId] = useState("");
  const [open, setOpen] = useState(false);
  const [accountMappings, setAccountMappings] = useState({});
  const { api } = useApi();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    api
      .get("/mostrar_reglas_fijas")
      .then((response) => {
        setRules(response.data.request_list || []);
      })
      .catch((error) => {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "No se pudieron cargar las reglas fijas";
        enqueueSnackbar(message, { variant: "error" });
      });
  }, [api, enqueueSnackbar]);

  const selectedRule = useMemo(
    () => rules.find((rule) => rule._id.$oid === selectedRuleId),
    [rules, selectedRuleId]
  );

  const canSubmit =
    selectedRule &&
    selectedRule.reglas.every((_, index) => accountMappings[index]);

  const handleAddRule = () => {
    api
      .post("/asignar_regla_fija/", {
        ruleId: selectedRuleId,
        projectId: id,
        accountMappings: Object.entries(accountMappings).map(
          ([itemIndex, accountCode]) => ({
            itemIndex: Number(itemIndex),
            accountCode,
          })
        ),
      })
      .then(() => {
        Router.reload();
      })
      .catch((error) => {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "No se pudo asignar la regla fija";
        enqueueSnackbar(message, { variant: "error" });
      });
  };

  return (
    <Grid container alignItems="center" gap={2}>
      <Grid item alignItems="center">
        <TodoList sx={{ verticalAlign: "middle" }} />
      </Grid>
      <Grid item>
        <Button variant="text" onClick={() => setOpen(true)}>
          <Typography fontSize="14px" color="grey.600">
            Reglas Fijas
          </Typography>
        </Button>
      </Grid>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Asignar regla fija a partidas</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="rule-select-label">Regla fija</InputLabel>
              <Select
                labelId="rule-select-label"
                value={selectedRuleId}
                onChange={(event) => {
                  setSelectedRuleId(event.target.value);
                  setAccountMappings({});
                }}
                label="Regla fija"
              >
                {rules.map((rule) => (
                  <MenuItem key={rule._id.$oid} value={rule._id.$oid}>
                    {rule.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedRule && (
              <>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Cada ítem monetario de la regla debe imputarse a una partida
                  del proyecto.
                </Alert>
                {selectedRule.reglas.map((item, index) => (
                  <Box key={`${item.nombre_regla}-${index}`} sx={{ mb: 3 }}>
                    <Typography variant="subtitle2">
                      {item.nombre_regla}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {`Monto: ${formatMonto((item.monto || 0) / 100)}`}
                    </Typography>
                    <AccountSelector
                      label={`Partida para "${item.nombre_regla}"`}
                      value={accountMappings[index] || null}
                      group="EGRESO"
                      year={2025}
                      allowHeaders={false}
                      scopeType="project"
                      scopeId={id}
                      assignedOnly
                      includeZero={false}
                      optionBalanceLabel="Disponible"
                      onChange={(accountCode) => {
                        setAccountMappings((prev) => ({
                          ...prev,
                          [index]: accountCode || "",
                        }));
                      }}
                    />
                  </Box>
                ))}
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            color="error"
            variant="outlined"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            color="success"
            variant="outlined"
            onClick={handleAddRule}
            disabled={!canSubmit}
          >
            Agregar Regla
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}

export default AddFixedRules;
