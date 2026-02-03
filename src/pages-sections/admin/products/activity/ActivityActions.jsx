import { Box, Tooltip } from "@mui/material"
import ShowActivities from "../actions/show/ShowActivities";
import DeleteActivity from "../actions/delete/DeleteActivity";
import { useApi } from "contexts/AxiosContext";

function BudgetActions({ budget }) {
    const { user } = useApi()
    return (
        <Box>
            <Tooltip title="Ver actividades">
                <ShowActivities budgets={budget} />
            </Tooltip>
            {budget?.status !== "finished" && user.role === "admin" &&
                <Tooltip title="Eliminar actividad">
                    <DeleteActivity budget={budget} />
                </Tooltip>
            }
        </Box>
    )
}
export default BudgetActions;