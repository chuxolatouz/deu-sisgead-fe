import { useRouter } from "next/router";
import { Edit, RemoveRedEye } from "@mui/icons-material";
import { Box, Tooltip } from "@mui/material";
import { FlexBox } from "components/flex-box";
import { Paragraph } from "components/Typography";
import { currency, formatSafeDate } from "lib";
import {
  StyledTableRow,
  StyledTableCell,
  StyledIconButton,
} from "../StyledComponents";
import DeleteProduct from 'pages-sections/admin/products/actions/delete/DeleteProduct';
import CircularProgress from "components/circular-progress/CircularProgress";
import { useApi } from "contexts/AxiosContext";

// ========================================================================

// ========================================================================

const ProductRow = ({ product, fetchProducts }) => {

  const { nombre, balance, fecha_inicio, fecha_fin, _id, status } = product;

  const router = useRouter();
  const { user } = useApi();
  return (
    // biome-ignore lint/a11y/useSemanticElements: <explanation>
    <StyledTableRow tabIndex={-1} role="checkbox">
      <StyledTableCell align="left">
        <FlexBox alignItems="center" gap={1.5}>
          {/* <Avatar
            src={image}
            sx={{
              borderRadius: "8px",
            }}
          /> */}
          <Box>
            <Paragraph>{nombre}</Paragraph>
            {/* <Small color="grey.600">#{id.split("-")[0]}</Small> */}
          </Box>
        </FlexBox>
      </StyledTableCell>
      <StyledTableCell>
        <Paragraph>{formatSafeDate(fecha_inicio)}</Paragraph>
      </StyledTableCell>
      <StyledTableCell>
        <Paragraph>{formatSafeDate(fecha_fin)}</Paragraph>
      </StyledTableCell>


      {/* <StyledTableCell align="left">
        <Avatar
          src={brand}
          sx={{
            width: 55,
            height: "auto",
            borderRadius: 0,
          }}
        />
      </StyledTableCell> */}

      <StyledTableCell align="left">{currency(balance)}</StyledTableCell>

      {/* <StyledTableCell align="left">
        <BazaarSwitch
          color="info"
          checked={productPulish}
          onChange={() => setProductPublish((state) => !state)}
        />
      </StyledTableCell> */}

      <StyledTableCell align="left">
        <CircularProgress status={status} />
      </StyledTableCell>

      <StyledTableCell align="center">
        {(user.role === "admin" && !status?.finished) && <StyledIconButton
          onClick={() => router.push(`/admin/products/edit/${_id.$oid}`)}
        >
          <Tooltip title="Editar info de Proyecto">
            <Edit />
          </Tooltip>
        </StyledIconButton>}

        <StyledIconButton
          onClick={() => router.push(`/admin/products/${_id.$oid}`)}
        >
          <Tooltip title="Ver detalles de Proyecto">
            <RemoveRedEye />
          </Tooltip>
        </StyledIconButton>
        {user.role === "admin" && <DeleteProduct product={product} fetchProducts={fetchProducts} />}
      </StyledTableCell>

    </StyledTableRow>
  );
};
export default ProductRow;
