import React, { useState } from "react";
import DropdownButton from "../../components/DropdownButton";

type DropdownProps = {
  topics: string[];
  onSelect: (topic: string) => void;
};

const Dropdown: React.FC<DropdownProps> = ({ topics, onSelect }) => {
  const [selectedTopic, setSelectedTopic] = useState<string>("");

  const menuButtonProps = {
    w: "100%",
    h: "14",
    topic: selectedTopic? selectedTopic : "Select a Topic",
  };

  const menuListProps = {
    options: topics,
    onSelect: (topic: string) => {
      setSelectedTopic(topic); // Update selected topic state
      onSelect(topic);
    },
  };

  return <DropdownButton menuButtonProps={menuButtonProps} menuListProps={menuListProps} />;
};

export default Dropdown;
