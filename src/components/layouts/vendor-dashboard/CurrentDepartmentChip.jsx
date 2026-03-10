import { useEffect, useState } from "react";
import { Chip, Tooltip } from "@mui/material";
import { Business } from "@mui/icons-material";
import { useApi } from "contexts/AxiosContext";

const CurrentDepartmentChip = () => {
  const { api, user } = useApi();
  const role = user?.role || "";
  const departmentId = user?.departmentId || user?.departamento_id || "";
  const [departmentName, setDepartmentName] = useState("");

  useEffect(() => {
    if (role === "super_admin") return;
    if (!departmentId) {
      setDepartmentName("");
      return;
    }

    let isMounted = true;
    api.get(`/departamentos/${departmentId}`)
      .then((response) => {
        if (!isMounted) return;
        setDepartmentName(response?.data?.nombre || "");
      })
      .catch(() => {
        if (!isMounted) return;
        setDepartmentName("");
      });

    return () => {
      isMounted = false;
    };
  }, [api, departmentId, role]);

  if (role === "super_admin") {
    return null;
  }

  if (!departmentId) {
    return (
      <Chip
        icon={<Business />}
        color="warning"
        variant="outlined"
        label="Departamento actual: sin asignar"
      />
    );
  }

  const label = `Departamento actual: ${departmentName || departmentId}`;
  return (
    <Tooltip title={departmentId}>
      <Chip
        icon={<Business />}
        color="info"
        variant="outlined"
        label={label}
      />
    </Tooltip>
  );
};

export default CurrentDepartmentChip;
