import React, { useState, useEffect } from 'react';
import {
  Button,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItemOption,
  MenuOptionGroup,
  MenuDivider,
  Flex,
} from "@chakra-ui/react";
import { ColumnFilter } from "@tanstack/react-table";
import { FaCaretDown } from 'react-icons/fa';

interface FilterOption {
  id: string;
  color: string;
}

interface DropdownFilterProps {
  label: string;
  filters: FilterOption[];
  columnFilters: ColumnFilter[];
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  filterKey: string;
  color: string;
}

const DropdownFilter: React.FC<DropdownFilterProps> = ({
  filters,
  columnFilters,
  setColumnFilters,
  filterKey,
  color = "purple",
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [buttonText, setButtonText] = useState<string>("ALL");
  const [textColor, setTextColor] = useState<string>("white")

  const handleFilterChange = (selectedFilter: string) => {
    setSelectedFilter(selectedFilter);

    if (selectedFilter === "all") {
      setTextColor("white")
      setButtonText("ALL");
      setColumnFilters((prev) => prev.filter((filter) => filter.id !== filterKey));
    } else {
      const selectedOption = filters.find((filter) => filter.id === selectedFilter);
      setButtonText(selectedOption ? selectedOption.id : "ALL");
      setTextColor(selectedOption ? selectedOption.color : "white");

      setColumnFilters((prev) => {
        const existingFilter = prev.find((filter) => filter.id === filterKey);

        if (existingFilter) {
          return prev.map((filter) =>
            filter.id === filterKey
              ? { ...filter, value: selectedFilter }
              : filter
          );
        }

        return prev.concat({
          id: filterKey,
          value: selectedFilter,
        });
      });
    }
  };

  return (
    <Flex>
      <Menu closeOnSelect={false}>
        <MenuButton
          as={Button}
          size="md"
          bg="gray.700"
          color={textColor}
          rightIcon={<Icon as={FaCaretDown} fontSize={14} />}
          _hover={{ bg: "gray.600" }}
          _active={{ bg: "gray.600" }}
          borderRadius="md"
          px={6}
        >
          {`${buttonText}`}
        </MenuButton>
        <MenuList minWidth="auto" p="4" bg="gray.800" borderColor="gray.700">
          <MenuOptionGroup
            type="radio"
            value={selectedFilter || "all"}
            onChange={(value) => handleFilterChange(value as string)}
          >
            {/* Add an "ALL" option to clear the selection */}
            <MenuItemOption
              key="all"
              value="all"
              color={"black"}
              _hover={{ bg: "gray.700", color: "white" }}
              _checked={{ bg: color, color: "white" }}
            >
              ALL
            </MenuItemOption>
            {filters.map((filter) => (
              <MenuItemOption
                key={filter.id}
                value={filter.id}
                marginTop={2}
                bgColor={filter.color}
                _hover={{ bg: "gray.700", color: filter.color }}
                _checked={{ bg: filter.color, color: "white" }}
              >
                {filter.id}
              </MenuItemOption>
            ))}
          </MenuOptionGroup>
          <MenuDivider />
        </MenuList>
      </Menu>
    </Flex>
  );
};

export default DropdownFilter;