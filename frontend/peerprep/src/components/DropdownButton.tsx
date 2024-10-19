import React from "react";
import { Menu, MenuButton, MenuList, MenuItem, Button } from "@chakra-ui/react";
import { FaChevronDown } from "react-icons/fa6";

export type MenuButtonProps = {
  w?: string;
  h?: string;
  defaultValue?: string;
};

export type MenuListProps = {
  options: string[];
};

type DropdownButtonProps = {
  menuButtonProps: MenuButtonProps;
  menuListProps: MenuListProps;
  onSelect?: (option: string) => void; 
};

const DropdownButton = ({
  menuButtonProps,
  menuListProps,
  onSelect,
}: DropdownButtonProps) => {
  return (
    <Menu>
      {({ isOpen }) => (
        <>
          <MenuButton
            isActive={isOpen}
            as={Button}
            rightIcon={<FaChevronDown />}
            w={menuButtonProps.w}
            h={menuButtonProps.h}
            bgColor="purple.500"
            color="white"
            _hover={{ bgColor: "purple.600" }}
            _active={{ bgColor: "purple.600" }}
          >
            {menuButtonProps.defaultValue}
          </MenuButton>
          <MenuList bgColor="purple.500">
            {menuListProps.options.map((option, ind) => (
              <MenuItem
                bgColor="purple.500"
                key={ind}
                onClick={() => {
                  if (onSelect) {
                    onSelect(option); 
                  }
                }}
              >
                {option}
              </MenuItem>
            ))}
          </MenuList>
        </>
      )}
    </Menu>
  );
};

export default DropdownButton;
