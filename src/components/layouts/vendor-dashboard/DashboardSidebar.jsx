import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { Avatar, Box, useMediaQuery } from "@mui/material";
import LayoutDrawer from "../LayoutDrawer";
import Scrollbar from "components/Scrollbar";
import { FlexBetween } from "components/flex-box";
import { getNavigations } from "./NavigationList";
import { useDepartment } from "contexts/DepartmentContext";
import SidebarAccordion from "./SidebarAccordion";
import {
  ListLabel,
  BadgeValue,
  StyledText,
  BulletIcon,
  NavWrapper,
  ExternalLink,
  NavItemButton,
  SidebarWrapper,
  ChevronLeftIcon,
  ListIconWrapper,
} from "./LayoutStyledComponents";
const TOP_HEADER_AREA = 70;

// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------

const DashboardSidebar = (props) => {
  const {
    sidebarCompact,
    showMobileSideBar,
    setShowMobileSideBar,
    setSidebarCompact,
  } = props;
  const router = useRouter();
  const [onHover, setOnHover] = useState(false);
  const [navigations, setNavigations] = useState([]);
  const downLg = useMediaQuery((theme) => theme.breakpoints.down("lg"));
  const { usandoContexto } = useDepartment();

  // Load navigations based on user role and department context
  // This will update when the department context changes
  useEffect(() => {
    setNavigations(getNavigations());
  }, [usandoContexto, router.pathname]); // Update when context or route changes

  // side hover when side bar is compacted
  const COMPACT = sidebarCompact && !onHover ? 1 : 0;
  // handle active current page
  const activeRoute = (path) => (router.pathname === path ? 1 : 0);

  // handle navigate to another route and close sidebar drawer in mobile device
  const handleNavigation = (path) => {
    router.push(path);
    setShowMobileSideBar();
  };

  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem("token");

    // Redirect to the login page
    router.push("/login");
  };

  const renderLevels = (data) => {
    return data.map((item, index) => {
      if (item.type === "label") {
        return (
          <ListLabel key={index} compact={sidebarCompact ? 1 : 0}>
            {item.label}
          </ListLabel>
        );
      }

      if (item.children) {
        return (
          <SidebarAccordion key={index} item={item} sidebarCompact={sidebarCompact}>
            {renderLevels(item.children)}
          </SidebarAccordion>
        );
      }

      if (item.type === "action") {
        // For Logout button or other custom actions
        return (
          <NavItemButton
            key={index}
            onClick={handleLogout} // Call the logout handler
          >
            {item.icon && (
              <ListIconWrapper>
                <item.icon />
              </ListIconWrapper>
            )}
            <StyledText compact={sidebarCompact ? 1 : 0}>{item.name}</StyledText>
          </NavItemButton>
        );
      }

      return (
        <NavItemButton
          key={index}
          onClick={() => router.push(item.path)} // Navigate to the path
        >
          {item.icon && (
            <ListIconWrapper>
              <item.icon />
            </ListIconWrapper>
          )}
          <StyledText compact={sidebarCompact ? 1 : 0}>{item.name}</StyledText>
        </NavItemButton>
      );
    });
  };
  const content = (
    <Scrollbar
      autoHide
      clickOnTrack={false}
      sx={{
        overflowX: "hidden",
        maxHeight: `calc(100vh - ${TOP_HEADER_AREA}px)`,
      }}
    >
      <NavWrapper compact={sidebarCompact}>
        {renderLevels(navigations)}
      </NavWrapper>
    </Scrollbar>
  );
  if (downLg) {
    return (
      <LayoutDrawer
        open={showMobileSideBar ? true : false}
        onClose={setShowMobileSideBar}
      >
        <Box p={2} maxHeight={TOP_HEADER_AREA}>
          <Image
            alt="Logo"
            width={105}
            height={50}
            src="/assets/images/logo-enii.png"
            style={{
              marginLeft: 8,
            }}
          />
        </Box>

        {content}
      </LayoutDrawer>
    );
  }
  return (
    <SidebarWrapper
      compact={sidebarCompact ? 1 : 0}
      onMouseEnter={() => setOnHover(true)}
      onMouseLeave={() => sidebarCompact && setOnHover(false)}
    >
      <FlexBetween
        p={2}
        maxHeight={TOP_HEADER_AREA}
        justifyContent={COMPACT ? "center" : "space-between"}
      >
        <Avatar
          src={
            COMPACT
              ? "/assets/images/logo-reducido.png"
              : "/assets/images/logo-enii.png"
          }
          sx={{
            borderRadius: 0,
            width: "auto",
            marginLeft: COMPACT ? 0 : 1,
          }}
        />

        <ChevronLeftIcon
          color="disabled"
          compact={COMPACT}
          onClick={setSidebarCompact}
          sidebarcompact={sidebarCompact ? 1 : 0}
        />
      </FlexBetween>

      {content}
    </SidebarWrapper>
  );
};
export default DashboardSidebar;
