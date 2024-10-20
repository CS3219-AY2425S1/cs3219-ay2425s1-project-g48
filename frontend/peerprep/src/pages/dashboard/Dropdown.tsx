import React from "react";
import DropdownButton from "../../components/DropdownButton";

type DropdownProps = {
  onSelect: (topic: string) => void;
};

const Dropdown: React.FC<DropdownProps> = ({ onSelect }) => {
  const menuButtonProps = {
    w: "80%",
    h: "12",
    defaultValue: "Select a Topic",
  };

  const menuListProps = {
    options: ["Arrays", "Hashmap", "Trees"],
    onSelect,
  };

  return <DropdownButton menuButtonProps={menuButtonProps} menuListProps={menuListProps} />;
};

export default Dropdown;
