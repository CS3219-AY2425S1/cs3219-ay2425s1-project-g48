import React, { useContext } from "react";
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  Box,
  Button,
  useToast,
} from "@chakra-ui/react";
import { FiLogOut } from "react-icons/fi";
import logo from "/peerprep_logo.png";
import { menuItems } from "../../constants/data";
import { useNavigate } from "react-router-dom";

type MenuDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  setAuth: React.Dispatch<React.SetStateAction<boolean>>;
};

/**
 * Navigation drawer component
 */
const MenuDrawer: React.FC<MenuDrawerProps> = ({
  isOpen,
  onClose,
  setAuth,
}) => {
  const drawerBgColor = "#141A67";
  const buttonTextColor = "white";
  const navigate = useNavigate();
  // const api = useApiContext();
  const toast = useToast();

  const handleLogOut = async () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (!confirmLogout) return;

    try {
      // await api.post("/logout");
      localStorage.removeItem("token");
      setAuth(false);
      navigate("/login");
      toast({
        title: "Logged out.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: "Logout failed.",
        description: error.message || "Unable to log out.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent bg={drawerBgColor} color={buttonTextColor}>
        <DrawerCloseButton marginTop={2} _hover={{ borderColor: "white" }} />
        <DrawerHeader marginTop={2}>
          <div className="flex items-center">
            <img src={logo} alt="Peerprep Logo" className="w-10 h-10 mr-1" />
            <span className="text-3xl text-white">PeerPrep</span>
          </div>
        </DrawerHeader>

        <DrawerBody>
          <Box mb={4}>
            {menuItems.map((item, index) => (
              <Button
                key={index}
                variant="link"
                width="100%"
                p={5}
                mb={2}
                justifyContent="start"
                leftIcon={<item.icon />}
                _hover={{ borderColor: "white" }}
                color={buttonTextColor}
                onClick={() => navigate(item.route)}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </DrawerBody>

        <Box position="absolute" bottom="0" width="100%" p={4}>
          <Button
            onClick={handleLogOut}
            aria-label="Logout"
            p={5}
            bg="#141A67"
            color={buttonTextColor}
            leftIcon={<FiLogOut />}
            _hover={{ borderColor: "white" }}
            width="100%"
          >
            Log Out
          </Button>
        </Box>
      </DrawerContent>
    </Drawer>
  );
};

export default MenuDrawer;
