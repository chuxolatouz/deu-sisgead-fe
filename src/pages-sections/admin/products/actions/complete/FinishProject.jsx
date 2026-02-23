import { Button } from "@mui/material";
import { useApi } from "contexts/AxiosContext";
import Router from "next/router"
import { useSnackbar } from "notistack";

function FinishProject({ project }) {
    const { api } = useApi();
    const { enqueueSnackbar } = useSnackbar();
    const handleFinish = () => {
        const values = {
            projectId: project._id
        }
        console.log(values);
        api.post('/finalizar_proyecto',values)
        .then((response) => {
            Router.reload();
          })
        .catch((error) => {
            console.log(error);
            if (error?.response?.data) {
                enqueueSnackbar(error.response.data.message, { variant: 'error'})
            } else {
                enqueueSnackbar(error.message, { variant: 'error'})
            }
        })

    }

    return (
        <Button onClick={handleFinish}> Finalizar Proyecto</Button>
    )
}

export default FinishProject;
