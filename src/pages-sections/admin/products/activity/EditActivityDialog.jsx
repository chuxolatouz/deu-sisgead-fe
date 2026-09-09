import { useEffect, useState } from "react";
import { EditOutlined } from "@mui/icons-material";
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useSnackbar } from "notistack";
import { useApi } from "contexts/AxiosContext";
import { StyledIconButton } from "pages-sections/admin/StyledComponents";

const getDocumentId = (budget) => budget?._id?.$oid || budget?._id || "";

const getSelectedObjectives = (budget) => {
  const objectives =
    budget?.specificObjectives || budget?.objetivos_especificos;
  if (Array.isArray(objectives)) return objectives;

  const legacyObjective =
    budget?.specificObjective || budget?.objetivo_especifico;
  return legacyObjective ? [legacyObjective] : [];
};

const getSelectedRequirements = (budget) =>
  (budget?.requerimientos || [])
    .map((requirement) => requirement.requirementId)
    .filter(Boolean);

function EditActivityDialog({ budget, project, onChanged }) {
  const { api } = useApi();
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [projectObjectives, setProjectObjectives] = useState([]);
  const [selectedObjectives, setSelectedObjectives] = useState([]);
  const [selectedRequirements, setSelectedRequirements] = useState([]);
  const [isSponsored, setIsSponsored] = useState(false);
  const [sponsoredEnabled, setSponsoredEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDescription(budget?.descripcion || "");
    setSelectedObjectives(getSelectedObjectives(budget));
    setSelectedRequirements(getSelectedRequirements(budget));
    setIsSponsored(Boolean(budget?.isSponsored || budget?.patrocinada));
    setProjectObjectives(
      Array.isArray(project?.objetivos_especificos)
        ? project.objetivos_especificos
        : []
    );
    api
      .get("/actividades/configuracion")
      .then((response) =>
        setSponsoredEnabled(Boolean(response.data?.sponsoredEnabled))
      )
      .catch(() => setSponsoredEnabled(false));
  }, [open, budget, project, api]);

  const handleSave = () => {
    if (!description.trim()) {
      enqueueSnackbar("La descripción de la actividad es requerida", {
        variant: "error",
      });
      return;
    }

    setSaving(true);
    api
      .put(`/documentos/${getDocumentId(budget)}`, {
        descripcion: description.trim(),
        specificObjectives: selectedObjectives,
        requirementIds: selectedRequirements,
        patrocinada: isSponsored,
      })
      .then((response) => {
        enqueueSnackbar(response.data.message, { variant: "success" });
        setOpen(false);
        onChanged?.();
      })
      .catch((error) => {
        enqueueSnackbar(error?.response?.data?.message || error.message, {
          variant: "error",
        });
      })
      .finally(() => setSaving(false));
  };

  return (
    <>
      <Tooltip title="Editar actividad">
        <StyledIconButton onClick={() => setOpen(true)}>
          <EditOutlined />
        </StyledIconButton>
      </Tooltip>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Editar actividad</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <TextField
              label="Descripción"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              multiline
              minRows={2}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel id="editar-objetivos-especificos">
                Objetivos específicos
              </InputLabel>
              <Select
                multiple
                labelId="editar-objetivos-especificos"
                label="Objetivos específicos"
                value={selectedObjectives}
                onChange={(event) => {
                  const value = event.target.value;
                  setSelectedObjectives(
                    typeof value === "string" ? value.split(",") : value
                  );
                }}
                renderValue={(selected) =>
                  selected.length === 1
                    ? selected[0]
                    : `${selected.length} objetivos seleccionados`
                }
              >
                {projectObjectives.map((objective) => (
                  <MenuItem key={objective} value={objective}>
                    <Checkbox
                      checked={selectedObjectives.includes(objective)}
                    />
                    <ListItemText primary={objective} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {(project?.requerimientos || []).length > 0 && (
              <FormControl fullWidth>
                <InputLabel id="editar-requerimientos">
                  Requerimientos
                </InputLabel>
                <Select
                  multiple
                  labelId="editar-requerimientos"
                  label="Requerimientos"
                  value={selectedRequirements}
                  onChange={(event) => {
                    const value = event.target.value;
                    setSelectedRequirements(
                      typeof value === "string" ? value.split(",") : value
                    );
                  }}
                  renderValue={(selected) =>
                    `${selected.length} requerimiento(s) seleccionado(s)`
                  }
                >
                  {(project?.requerimientos || []).map((requirement) => (
                    <MenuItem
                      key={requirement.requirementId}
                      value={requirement.requirementId}
                    >
                      <Checkbox
                        checked={selectedRequirements.includes(
                          requirement.requirementId
                        )}
                      />
                      <ListItemText
                        primary={requirement.nombre}
                        secondary={`${requirement.accountCode} · Nivel ${
                          requirement.account?.level || "-"
                        }`}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <FormControlLabel
              control={
                <Checkbox
                  checked={isSponsored}
                  disabled={
                    budget?.status !== "new" ||
                    (!isSponsored && !sponsoredEnabled)
                  }
                  onChange={(event) => setIsSponsored(event.target.checked)}
                />
              }
              label="Patrocinada"
            />
            {!sponsoredEnabled && !isSponsored && (
              <Alert severity="warning" variant="outlined">
                No se puede activar el patrocinio hasta configurar su cuenta
                institucional.
              </Alert>
            )}
            {budget?.status !== "new" && (
              <Alert severity="info" variant="outlined">
                El patrocinio no puede cambiarse después de iniciar el cierre
                administrativo.
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            color="error"
            onClick={() => setOpen(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <LoadingButton
            variant="contained"
            onClick={handleSave}
            loading={saving}
          >
            Guardar
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default EditActivityDialog;
