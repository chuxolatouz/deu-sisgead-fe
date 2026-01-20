import { Breadcrumbs, Box, styled } from "@mui/material";
import { NavigateNext } from "@mui/icons-material";
import { NavLink } from "components/nav-link";
import { H5 } from "components/Typography";

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  "& .MuiBreadcrumbs-separator": {
    color: theme.palette.grey[400],
  },
}));

const BreadcrumbLink = styled(NavLink)(({ theme }) => ({
  color: theme.palette.grey[600],
  textDecoration: "none",
  fontSize: "14px",
  fontWeight: 500,
  "&:hover": {
    color: theme.palette.primary.main,
    textDecoration: "underline",
  },
}));

const BreadcrumbText = styled(Box)(({ theme }) => ({
  color: theme.palette.grey[900],
  fontSize: "14px",
  fontWeight: 600,
}));

const BazaarBreadcrumb = ({ items }) => {
  return (
    <StyledBreadcrumbs
      separator={<NavigateNext fontSize="small" />}
      aria-label="breadcrumb"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        if (isLast) {
          return <BreadcrumbText key={index}>{item.label}</BreadcrumbText>;
        }
        
        return (
          <BreadcrumbLink key={index} href={item.href}>
            {item.label}
          </BreadcrumbLink>
        );
      })}
    </StyledBreadcrumbs>
  );
};

export default BazaarBreadcrumb;

