import React from "react";
import DropdownButton, {
  MenuButtonProps,
  MenuListProps,
} from "../../components/DropdownButton";

interface DropdownProps {
  setSelectedTopic: (topic: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ setSelectedTopic }) => {
  const menuButtonProps: MenuButtonProps = {
    w: "80%",
    h: "12",
    defaultValue: "Select a Topic",
  };

  const menuListProps: MenuListProps = {
    options: ["Arrays", "Hashmap", "Trees"],
  };

  const handleSelect = (option: string) => {
    setSelectedTopic(option);
  };

  return (
    <DropdownButton
      menuButtonProps={menuButtonProps}
      menuListProps={menuListProps}
      onSelect={handleSelect} 
    />
  );
};

export default Dropdown;
