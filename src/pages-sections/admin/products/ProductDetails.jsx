import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Grid,
  Divider,
  Chip,
  Button,
  Tab
} from "@mui/material";
import { PictureAsPdfOutlined } from "@mui/icons-material";
import {
  TabContext,
  TabList,
  TabPanel,
} from "@mui/lab";
import Verify from "components/icons/Verify";
import TodoList from 'components/icons/duotone/TodoList';
import { formatSafeDate, formatMonto } from 'lib';
import { useRouter } from "next/router";
import { FlexBox } from "components/flex-box";
import { H3, H5, H6, Span } from "components/Typography";
import ProductUsers from "pages-sections/admin/products/ProductUsers";
import ProductMovements from "pages-sections/admin/products/ProductMovements";
import ProductLogs from "pages-sections/admin/products/ProductLogs";
import ProductBudget from "pages-sections/admin/products/ProductBudget";
import ProductReport from "pages-sections/admin/products/ProductReport";
import ProductAccounts from "pages-sections/admin/products/ProductAccounts";
import { useApi } from "contexts/AxiosContext";
import { useSnackbar } from 'notistack';
import AddFixedRules from "./actions/add/AddFixedRules";
import AddRules from "./actions/add/AddRules";
import FinishProject from "./actions/complete/FinishProject";
import DownloadStartPDF from './actions/complete/DownloadStartPDF';
import DownloadEndPDF from './actions/complete/DownloadEndPDF';
import DownloadProjectDocuments from './actions/download/DownloadProjectDocuments';

// ===================================================================

const ProductDetails = ({ product }) => {
  const router = useRouter();
  const [tab, setTab] = useState("0");
  const [categories, setCategories] = useState([]);
  const { api } = useApi();
  const { enqueueSnackbar } = useSnackbar();

  const handleChange = (_, newValue) => {
    setTab(newValue);
  };


  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    // Solo al montar el componente: si hay tab en query, lo usamos
    if (router.query.tab) {
      setTab(router.query.tab);
    }
  }, []);


  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    api.get('/mostrar_categorias')
      .then((response) => {
        setCategories(response.data);
      }).catch((error) => {
        console.log(error)
        if (error.response) {
          enqueueSnackbar(error.response.data.message, { variant: 'error' })
        } else {
          enqueueSnackbar(error.message, { variant: 'error' })
        }
      })
  }, [])

  const findCategory = (catValue) => {
    const category = categories.find((c) => c.value === catValue);
    if (!category) {
      return catValue; // Return the original value if not found
    }
    // Return the name of the category if found
    return category.nombre
  }


  return (
    <Grid container spacing={3}>
      <Grid item md={3} xs={12}>
        <Card
          sx={{
            p: 3,
          }}
        >
          <FlexBox alignItems="center" gap={4}>
            <H5 mt={0} mb={2}>
              Detalles
            </H5>
          </FlexBox>
          <Divider
            sx={{
              my: 2,
            }}
          />
          <FlexBox alignItems="left" gap={4}>
            <Span gap={4} color="grey.600">Saldo actual:</Span>
          </FlexBox>
          <FlexBox alignItems="left" gap={4}>
            <H3 mt={0} mb={2}>
              {formatMonto(product.balance)}
            </H3>
          </FlexBox>
          <FlexBox alignItems="left" gap={4}>
            <Span gap={4} color="grey.600">Saldo inicial:</Span>
          </FlexBox>
          <FlexBox alignItems="left" gap={4}>

            <H5 mt={0} mb={2}>
              {formatMonto(product.balance_inicial)}
            </H5>
          </FlexBox>

          <Divider
            sx={{
              my: 2,
            }}
          />
          <FlexBox alignItems="left" gap={4}>
            <Span gap={4} color="grey.600">Fecha de inicio:</Span>
          </FlexBox>
          {product.fecha_inicio && (<FlexBox alignItems="left" gap={4}>
            <H6 mt={0} mb={2}>
              {formatSafeDate(product?.fecha_inicio)}
            </H6>
          </FlexBox>)}

          <FlexBox alignItems="left" gap={4}>
            <Span gap={4} color="grey.600">Fecha de fin:</Span>
          </FlexBox>
          {product.fecha_fin && (<FlexBox alignItems="left" gap={4}>

            <H6 mt={0} mb={2}>
              {formatSafeDate(product?.fecha_fin)}
            </H6>
          </FlexBox>)}
          <FlexBox alignItems="left" gap={4}>
            <Span gap={4} color="grey.600">Descripción:</Span>
          </FlexBox>
          <FlexBox alignItems="left" gap={4}>
            <H6 mt={0} mb={2}>
              {product.descripcion}

            </H6>
          </FlexBox>
          <FlexBox alignItems="left" gap={4}>
            <Span gap={4} color="grey.600">Categoría:</Span>
          </FlexBox>
          <FlexBox alignItems="left" gap={4}>
            {product.categoria ? <Chip label={findCategory(product.categoria)} /> : null}
          </FlexBox>
          <Divider
            sx={{
              my: 2,
            }}
          />
          <FlexBox alignItems="left" gap={2} sx={{ height: '33px' }}>
            {product.status?.completado?.includes(1) ? <Verify /> : <TodoList />}
            <Span gap={4} color={product.status?.completado?.includes(1) ? 'green' : 'grey.600'}>Agregar Balance</Span>
          </FlexBox>
          <FlexBox alignItems="left" gap={2} sx={{ height: '33px' }}>
            {product.status?.completado?.includes(2) ? <Verify /> : <TodoList />}
            <Span gap={4} color={product.status?.completado?.includes(2) ? 'green' : 'grey.600'}>Usuarios</Span>
          </FlexBox>
          <FlexBox alignItems="left" gap={2} sx={{ height: '33px' }}>
            {product.status?.completado?.includes(3) ? <Verify /> : <TodoList />}
            <Span gap={4} color={product.status?.completado?.includes(3) ? 'green' : 'grey.600'}>Líder Proyecto</Span>
          </FlexBox>
          <FlexBox alignItems="left" gap={2} sx={{ height: '33px' }}>
            {product.status?.completado?.includes(4) ?
              <>
                <Verify />
                <Span gap={4} color={'green'}>Reglas de Distribución</Span>
              </>
              :
              <AddRules id={product._id} />
            }
          </FlexBox>
          <FlexBox alignItems="left" gap={2} sx={{ height: '33px' }}>
            {product.status?.completado?.includes(5) ?
              <>
                <Verify />
                <Span gap={4} color={'green'}>Reglas Fijas</Span>
              </>
              :
              <AddFixedRules id={product._id} />
            }
          </FlexBox>
          <Divider
            sx={{
              my: 2,
            }}
          />
          <DownloadProjectDocuments project={product} />
          <Divider
            sx={{
              my: 2,
            }}
          />
          {product.status?.completado.length === 5 && (
            <FlexBox alignItems="center" gap={2}>
              {product?.acta_inicio?.documento_url ? (
                <Button
                  variant="outlined"
                  href={product.acta_inicio.documento_url}
                  target="_blank"
                  rel="noopener"
                  startIcon={<PictureAsPdfOutlined />}
                >
                  Descargar Acta de Inicio
                </Button>
              ) : (
                <DownloadStartPDF project={product} />
              )}
            </FlexBox>
          )}
          {product.status?.completado.length === 5 && (
            <Divider
              sx={{
                my: 2,
              }}
            />
          )}
          {!product.status?.finished && (<FlexBox alignItems="center" gap={2}><FinishProject project={product} /></FlexBox>)}
          {product.status?.finished && (
            <>
              <FlexBox alignItems="center" gap={2}>
                <DownloadEndPDF project={product} />
              </FlexBox>

              {product?.acta_finalizacion?.documento_url && (
                <Button
                  variant="outlined"
                  color="primary"
                  sx={{ mt: 2 }}
                  onClick={() => window.open(product.acta_finalizacion.documento_url, '_blank')}
                >
                  Descargar versión oficial
                </Button>
              )}
            </>
          )}
        </Card>
      </Grid>
      <Grid item md={9} xs={12}>
        <Card
          sx={{
            p: 3,
          }}
        >
          <TabContext value={tab}>
            <TabList onChange={handleChange} centered>
              <Tab value="0" label="Detalles" />
              <Tab value="1" label="Usuarios" />
              <Tab value="2" label="Movimientos" />
              <Tab value="3" label="Actividades" />
              <Tab value="4" label="Logs" />
              <Tab value="5" label="Cuentas contables" />
            </TabList>
            <Box>
              <TabPanel value="0">
                <ProductReport id={product._id} />
              </TabPanel>
              <TabPanel value="1">
                <ProductUsers id={product._id} users={product.miembros} />
              </TabPanel>
              <TabPanel value="2">
                <ProductMovements id={product._id} />
              </TabPanel>
              <TabPanel value="3">
                <ProductBudget project={product} />
              </TabPanel>
              <TabPanel value="4">
                <ProductLogs id={product._id} />
              </TabPanel>
              <TabPanel value="5">
                <ProductAccounts projectId={product._id} />
              </TabPanel>
            </Box>
          </TabContext>
        </Card>
      </Grid>
      {/* <Grid item md={3} xs={12}>
        <Card
          sx={{
            p: 3,
          }}
        >
          <FlexBox alignItems="center" gap={4}>
            <Paragraph>
              <Span color="grey.600">Order ID:</Span> {order.id}
            </Paragraph>

            <Paragraph>
              <Span color="grey.600">Placed on:</Span>{" "}
              {format(new Date(order.createdAt), "dd MMM, yyyy")}
            </Paragraph>
          </FlexBox>

          <FlexBox
            gap={3}
            my={3}
            flexDirection={{
              sm: "row",
              xs: "column",
            }}
          >
            <TextField
              fullWidth
              color="info"
              size="medium"
              variant="outlined"
              label="Add Product"
              placeholder="Type product name"
            />

            <TextField
              select
              fullWidth
              color="info"
              size="medium"
              defaultValue={order.status}
              label="Order Status"
              inputProps={{
                IconComponent: () => (
                  <KeyboardArrowDown
                    sx={{
                      color: "grey.600",
                      mr: 1,
                    }}
                  />
                ),
              }}
            >
              <MenuItem value="Processing">Processing</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Delivered">Delivered</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </TextField>
          </FlexBox>

          {order.items.map((item, index) => (
            <Box
              my={2}
              gap={2}
              key={index}
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  md: "1fr 1fr",
                  xs: "1fr",
                },
              }}
            >
              <FlexBox flexShrink={0} gap={1.5} alignItems="center">
                <Avatar
                  src={item.product_img}
                  sx={{
                    height: 64,
                    width: 64,
                    borderRadius: "8px",
                  }}
                />

                <Box>
                  <H6 mb={1}>{item.product_name}</H6>

                  <FlexBox alignItems="center" gap={1}>
                    <Paragraph fontSize={14} color="grey.600">
                      {currency(item.product_price)} x
                    </Paragraph>

                    <Box maxWidth={60}>
                      <TextField
                        defaultValue={item.product_quantity}
                        type="number"
                        fullWidth
                      />
                    </Box>
                  </FlexBox>
                </Box>
              </FlexBox>

              <FlexBetween flexShrink={0}>
                <Paragraph color="grey.600">
                  Product properties: Black, L
                </Paragraph>

                <IconButton>
                  <Delete
                    sx={{
                      color: "grey.600",
                      fontSize: 22,
                    }}
                  />
                </IconButton>
              </FlexBetween>
            </Box>
          ))}
        </Card>
      </Grid>

      <Grid item md={9} xs={12}>
        <Card
          sx={{
            px: 3,
            py: 4,
          }}
        >
          <TextField
            rows={5}
            multiline
            fullWidth
            color="info"
            variant="outlined"
            label="Shipping Address"
            defaultValue={order.shippingAddress}
            sx={{
              mb: 4,
            }}
          />

          <TextField
            rows={5}
            multiline
            fullWidth
            color="info"
            variant="outlined"
            label="Customer’s Note"
            defaultValue="Please deliver ASAP."
          />
        </Card>
      </Grid> */}
    </Grid>
  );
};
export default ProductDetails;
