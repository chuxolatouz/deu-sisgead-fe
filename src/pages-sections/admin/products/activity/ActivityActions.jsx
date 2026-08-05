import { Box, Tooltip } from "@mui/material"
import ShowActivities from "../actions/show/ShowActivities";
import DeleteActivity from "../actions/delete/DeleteActivity";
import { useApi } from "contexts/AxiosContext";
import EditActivityDialog from "./EditActivityDialog";

function BudgetActions({ budget, project, onChanged }) {
    const { user } = useApi()
    const resolvedRole = user?.role || user?.rol || "";
    const canDeleteActivity = ["admin", "super_admin", "admin_departamento"].includes(resolvedRole);
    const canEditActivity = Boolean(
        project?.canEdit || ["admin", "super_admin", "admin_departamento"].includes(resolvedRole)
    );
    return (
        <Box>
            <Tooltip title="Ver actividades">
                <ShowActivities budgets={budget} />
            </Tooltip>
            {budget?.status !== "finished" && canEditActivity && (
                <EditActivityDialog budget={budget} project={project} onChanged={onChanged} />
            )}
            {budget?.status === "new" && canDeleteActivity &&
                <Tooltip title="Eliminar actividad">
                    <DeleteActivity budget={budget} />
                </Tooltip>
            }
        </Box>
    )
}
export default BudgetActions;
