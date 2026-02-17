import { useState } from "react";
import { Chip, IconButton, Tooltip, Box } from "@mui/material";
import { RemoveRedEye, Edit, ToggleOff, ToggleOn } from "@mui/icons-material";
import {
  StyledIconButton,
  StyledTableCell,
  StyledTableRow,
} from "../StyledComponents";
import { useApi } from "contexts/AxiosContext";

// ========================================================================

// ========================================================================

const AccountRow = ({ account, onView, onEdit, onToggleStatus }) => {
  const { _id, code, name, description, departments = [], active } = account;
  const [isActive, setIsActive] = useState(active);
  const { user } = useApi();
  const isSuperAdmin = user?.role === 'super_admin';

  const handleToggle = async () => {
    try {
      await onToggleStatus(_id, !isActive);
      setIsActive(!isActive);
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  };

  return (
    <StyledTableRow tabIndex={-1}>
      <StyledTableCell align="left">{code}</StyledTableCell>

      <StyledTableCell align="left">{name}</StyledTableCell>

      <StyledTableCell align="left">
        <Tooltip title={description || "Sin descripción"} arrow>
          <span
            style={{
              display: "block",
              maxWidth: "300px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {description || "-"}
          </span>
        </Tooltip>
      </StyledTableCell>

      <StyledTableCell align="left">
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, maxWidth: 200 }}>
          {departments && departments.length > 0 ? (
            departments.slice(0, 3).map((dept, index) => (
              <Chip
                key={index}
                label={dept}
                size="small"
                variant="outlined"
                color="primary"
                sx={{ fontSize: "0.7rem" }}
              />
            ))
          ) : (
            <Chip
              label="Todos"
              size="small"
              variant="outlined"
              color="default"
              sx={{ fontSize: "0.7rem" }}
            />
          )}
          {departments && departments.length > 3 && (
            <Tooltip title={departments.slice(3).join(", ")} arrow>
              <Chip
                label={`+${departments.length - 3}`}
                size="small"
                variant="outlined"
                color="info"
                sx={{ fontSize: "0.7rem" }}
              />
            </Tooltip>
          )}
        </Box>
      </StyledTableCell>

      <StyledTableCell align="center">
        <Chip
          label={isActive ? "Activo" : "Inactivo"}
          color={isActive ? "success" : "default"}
          size="small"
          sx={{ minWidth: 80 }}
        />
      </StyledTableCell>

      <StyledTableCell align="center">
        <Tooltip title="Ver Detalles" arrow>
          <StyledIconButton onClick={() => onView(account)}>
            <RemoveRedEye />
          </StyledIconButton>
        </Tooltip>

        {isSuperAdmin && (
          <>
            <Tooltip title="Editar" arrow>
              <StyledIconButton onClick={() => onEdit(account)}>
                <Edit />
              </StyledIconButton>
            </Tooltip>

            <Tooltip title={isActive ? "Desactivar" : "Activar"} arrow>
              <StyledIconButton onClick={handleToggle}>
                {isActive ? <ToggleOff /> : <ToggleOn />}
              </StyledIconButton>
            </Tooltip>
          </>
        )}
      </StyledTableCell>
    </StyledTableRow>
  );
};

export default AccountRow;



