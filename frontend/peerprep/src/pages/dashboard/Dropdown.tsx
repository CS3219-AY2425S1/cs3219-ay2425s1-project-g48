import React from "react";

import DropdownButton, {
  MenuButtonProps,
  MenuListProps,
} from "../../components/DropdownButton";

const Dropdown = () => {
  const menuButtonProps: MenuButtonProps = {
    w: "80%",
    h: "12",
    defaultValue: "Select a Topic",
  };

  const menuListProps: MenuListProps = {
    options: ["Arrays", "Hashmap", "Trees"],
  };
  return (
    <DropdownButton
      menuButtonProps={menuButtonProps}
      menuListProps={menuListProps}
    />
  );
};

export default Dropdown;
