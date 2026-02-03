import { Chip } from '@mui/material';
import { useApi } from 'contexts/AxiosContext';
import CompleteActivity from 'pages-sections/admin/products/actions/complete/CompleteActivity';

function ActivityStatus({ budget, onComplete }) {
    const { status } = budget;
    return (status === "finished" ?
        <Chip color="success" variant="outlined" label="completado" /> :
        <CompleteActivity budget={budget} onComplete={onComplete} />
    )
}

export default ActivityStatus;