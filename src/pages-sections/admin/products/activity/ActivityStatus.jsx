import { Chip } from '@mui/material';
import { useApi } from 'contexts/AxiosContext';
import CompleteActivity from 'pages-sections/admin/products/actions/complete/CompleteActivity';
import FinalizeActivity from 'pages-sections/admin/products/actions/complete/FinalizeActivity';

function ActivityStatus({ budget, onComplete, year }) {
    const { user } = useApi();
    const { status } = budget;
    const resolvedRole = user?.role || user?.rol || "";
    const canAdministrativeClose = ["admin", "super_admin", "admin_departamento"].includes(resolvedRole);

    if (status === "finished") {
        return <Chip color="success" variant="outlined" label="Finalizada" />;
    }

    if (status === "in_progress") {
        return <FinalizeActivity budget={budget} onComplete={onComplete} />;
    }

    if (status === "new" && canAdministrativeClose) {
        return <CompleteActivity budget={budget} onComplete={onComplete} year={year} />;
    }

    return <Chip color="default" variant="outlined" label="Nueva" />;
}

export default ActivityStatus;
