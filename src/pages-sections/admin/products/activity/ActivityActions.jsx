import { Box, Tooltip } from "@mui/material"
import ShowActivities from "../actions/show/ShowActivities";
import DeleteActivity from "../actions/delete/DeleteActivity";
import { useApi } from "contexts/AxiosContext";

function BudgetActions({ budget }) {
    const { user } = useApi()
    const resolvedRole = user?.role || user?.rol || "";
    const canDeleteActivity = ["admin", "super_admin", "admin_departamento"].includes(resolvedRole);
    return (
        <Box>
            <Tooltip title="Ver actividades">
                <ShowActivities budgets={budget} />
            </Tooltip>
            {budget?.status === "new" && canDeleteActivity &&
                <Tooltip title="Eliminar actividad">
                    <DeleteActivity budget={budget} />
                </Tooltip>
            }
        </Box>
    )
}
export default BudgetActions;
