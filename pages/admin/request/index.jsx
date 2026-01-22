import {useEffect, useState } from "react";
import { Box, Card, Stack, Table, TableContainer } from "@mui/material";
import TableBody from "@mui/material/TableBody";
import TableHeader from "components/data-table/TableHeader";
import TablePagination from "components/data-table/TablePagination";
import VendorDashboardLayout from "components/layouts/vendor-dashboard";
import { H3 } from "components/Typography";
import Scrollbar from "components/Scrollbar";
import { RequestRow } from "pages-sections/admin";
import { useSnackbar } from "notistack";
import { useApi } from 'contexts/AxiosContext';
// TABLE HEADING DATA LIST
const tableHeading = [
  {
    id: "nombre",
    label: "Nombre",
    align: "left",
  },
  {
    id: "reglas",
    label: "Reglas",
    align: "left",
  },
  {
    id: "status",
    label: "status",
    align: "left",
  },
  // {
  //   id: "categoria",
  //   label: "Categoria",
  //   align: "left",
  // },
  {
    id: "action",
    label: "Accion",
    align: "center",
  },
];

// =============================================================================
RequestList.getLayout = function getLayout(page) {
  return <VendorDashboardLayout>{page}</VendorDashboardLayout>;
};
// =============================================================================

// =============================================================================

export default function RequestList() {
  const [rules, setRules] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState({
    skip: 0,
    page: 0,
    limit: 10
  });

  const { api } = useApi();
  const { enqueueSnackbar } = useSnackbar();
  const fetchRequest = () => api.get(
    `/mostrar_solicitudes?page=${pagination.page}&limit=${pagination.limit}`,
  ).then((respon) => {
    setTotalCount(respon.data.count || 0);
    setRules(respon.data.request_list || []);
  }).catch((error) => {
    if (error.response) {
      enqueueSnackbar(error.response.data.message, { variant: 'error'});
    } else {
      enqueueSnackbar(error.message, { variant: 'error'});
    }
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: pagination es la única dependencia necesaria
  useEffect(() => {
    fetchRequest();
  }, [pagination]);

  const handleChangePage = (_, page) => {
    // MUI Pagination es 1-indexed, convertir a 0-indexed para el backend
    const pageIndex = page - 1;
    setPagination((prevPagination) => ({
      ...prevPagination,
      skip: pageIndex * prevPagination.limit,
      page: pageIndex
    }));
  };
  return (
    <Box py={4}>
      <H3 mb={2}>Lista de Solicitudes</H3>
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
                rowCount={rules.length}                
              />

              <TableBody>
                {rules.map((rule) => {
                  const ruleId = rule._id?.$oid || rule._id || (rule.nombre ? `${rule.nombre}-${rule.status}` : undefined);
                  return ruleId ? (
                    <RequestRow request={rule} key={ruleId} fetchRequest={fetchRequest} />
                  ) : null;
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <Stack alignItems="center" my={4}>
          <TablePagination
            onChange={handleChangePage}
            page={pagination.page + 1}  // MUI Pagination es 1-indexed
            count={Math.ceil(totalCount / pagination.limit) || 1}  // Total de páginas, no items
          />
        </Stack>
      </Card>
    </Box>
  );
}
