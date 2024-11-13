import React from "react";
import { Box, Button, Icon, useDisclosure } from "@chakra-ui/react";
import { FiAlignJustify } from "react-icons/fi";
import logo from "/peerprep_logo.png";

import MenuDrawer from "./MenuDrawer";

const Navbar = ({
  setAuth,
}: {
  setAuth: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <div>
      <div className="flex justify-start items-center p-4 bg-gradient-to-br from-[#1D004E] to-[#141A67]">
        <Button
          onClick={onOpen}
          border="2px solid"
          borderColor="white"
          bg="transparent"
          _hover={{ bg: "purple" }}
          className="mr-4"
        >
          <Icon as={FiAlignJustify} color="white" className="bg-opacity-0" />
        </Button>
        <img src={logo} alt="Peerprep Logo" className="w-10 h-10" />
        <span className="text-4xl text-white">PeerPrep</span>
      </div>
      <MenuDrawer isOpen={isOpen} onClose={onClose} setAuth={setAuth} />
    </div>
  );
};

export default Navbar;
