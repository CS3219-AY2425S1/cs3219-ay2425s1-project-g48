import React from "react";
import { Menu, MenuButton, MenuList, MenuItem, Button } from "@chakra-ui/react";
import { FaChevronDown } from "react-icons/fa6";

type DropdownButtonProps = {
  menuButtonProps: {
    w: string;
    h: string;
    defaultValue: string;
  };
  menuListProps: {
    options: string[];
    onSelect: (topic: string) => void;
  };
};

const DropdownButton: React.FC<DropdownButtonProps> = ({
  menuButtonProps,
  menuListProps,
}) => {
  return (
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<FaChevronDown />}
        w={menuButtonProps.w}
        h={menuButtonProps.h}
        bg="purple.500" // Set button background color
        color="white" // Set button text color
        _hover={{ bg: "purple.600" }} // Set hover color for the button
        _active={{ bg: "purple.700" }} // Set active/pressed color
      >
        {menuButtonProps.defaultValue}
      </MenuButton>
      
      <MenuList bg="purple.500" color="white"> {/* Set background and text color for dropdown */}
        {menuListProps.options.map((option, index) => (
          <MenuItem
            key={index}
            bg="purple.500" // Set background color for menu items
            color="white" // Set text color for menu items
            _hover={{ bg: "purple.600", color: "white" }} // Set hover color for menu items
            onClick={() => menuListProps.onSelect(option)} // Call onSelect when an option is clicked
          >
            {option}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default DropdownButton;
