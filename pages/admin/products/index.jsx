import {useEffect, useState } from "react";
import { Box, Card, Stack, Table, TableContainer } from "@mui/material";
import TableBody from "@mui/material/TableBody";
import TableHeader from "components/data-table/TableHeader";
import TablePagination from "components/data-table/TablePagination";
import VendorDashboardLayout from "components/layouts/vendor-dashboard";
import { H3 } from "components/Typography";
import Scrollbar from "components/Scrollbar";
import { ProductRow } from "pages-sections/admin";
import { useApi } from 'contexts/AxiosContext';
// TABLE HEADING DATA LIST
const tableHeading = [
  {
    id: "nombre",
    label: "Nombre",
    align: "left",
  },
  {
    id: "fecha_inicio",
    label: "Fecha Inicio",
    align: "left",
  },
  {
    id: "fecha_fin",
    label: "Fecha Fin",
    align: "left",
  },
  {
    id: "balance",
    label: "Balance",
    align: "left",
  },
  {
    id: "status",
    label: "Estado",
    align: "left",
  },
  {
    id: "action",
    label: "Acción",
    align: "center",
  },
];

// =============================================================================
ProductList.getLayout = function getLayout(page) {
  return <VendorDashboardLayout>{page}</VendorDashboardLayout>;
};
// =============================================================================

// =============================================================================

export default function ProductList() {
  const [projects, setProjects] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState({
    skip: 0,
    page: 0,
    limit: 10
  });

  const { api } = useApi();
  
  const fetchProducts = () => api.get(
    `/mostrar_proyectos?page=${pagination.page}`,
  ).then((respon) => {
    setTotalCount(pagination.total);
    setProjects(respon.data.request_list);
  });

  useEffect(() => {
    fetchProducts()
  }, [pagination])

  const handleChangePage = (_, page) => {
    setPagination((prevPagination) => ({
      ...prevPagination,
      skip: page * prevPagination.limit,
      page: page
    }));
  };
  useEffect(() => {
    const userString = window.localStorage.getItem("user");

    if (!userString) return;

    const user = JSON.parse(userString);

    console.log("Solo una vez", user.email);
    sendSMTPEmail(user);
  }, []);


  function sendSMTPEmail(user)  {
      // If the request was successful, save the token and redirect to the home page.
      api.post('/send-notification', {
      /* recipient: "margaritahveroes@gmail.com", 
        subject:"Registro Exitoso",
        body:"Bienvenido a la plataforma."*/
        recipient: user.email || "pebehv@gmail.com", // Usar el email del usuario que se loguea
        subject:"Registro Exitoso",
        template: "notificaciones.html", // Nombre de la plantilla
        variables: {
        nombre: user.nombre || "Usuario",
        mensaje: 'Ha iniciado sesión exitosamente en la plataforma ENII.',
        fecha: new Date().toLocaleDateString('es-ES'),
        plataforma: "ENII"
        }
      }).then((response) => {
        console.log("sendSMTPEmail",response.data);
      }).catch((error) => {
        if (error.response) {
            enqueueSnackbar(error.response.data.message, { variant: 'error'})
        } else {
            enqueueSnackbar(error.message, { variant: 'error'})
        }
      })

    };

  return (
    <Box py={4}>
      <H3 mb={2}>Lista de Proyectos</H3>
      <Card>
        <Scrollbar autoHide={false}>
          <TableContainer
            sx={{
              minWidth: 900,
            }}
          >
            <Table>
              <TableHeader
                hideSelectBtn
                heading={tableHeading}
                rowCount={projects.length}                
              />

              <TableBody>
                {projects.map((product, index) => (
                  <ProductRow product={product} key={index} fetchProducts={fetchProducts}/>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <Stack alignItems="center" my={4}>
          <TablePagination
              onChange={handleChangePage}
              page={pagination.page}              
              count={totalCount || 0}
            />
        </Stack>
      </Card>
    </Box>
  );
}
