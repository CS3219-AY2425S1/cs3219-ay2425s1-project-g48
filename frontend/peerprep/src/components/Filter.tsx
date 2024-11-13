import React from "react";
import {
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
} from "@chakra-ui/react";
import { ColumnFilter } from "@tanstack/react-table";
import { FaSearch } from "react-icons/fa";
import { COMPLEXITIES } from "../constants/data"; // Assuming data exists for both
import DropdownFilter from "./DropdownFilter";
import { Topic } from "../pages/question/questionModel";

interface FiltersProps {
  columnFilters: ColumnFilter[];
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  topics: Topic[];
}

const Filters: React.FC<FiltersProps> = ({
  columnFilters,
  setColumnFilters,
  topics,
}) => {
  const filteredTitle = columnFilters.filter((x) => x.id === "Title");

  const onFilterChange = (id: string, value: string) => {
    setColumnFilters((prev) =>
      prev
        .filter((f) => f.id !== id)
        .concat({
          id,
          value,
        })
    );
  };

  return (
    <HStack mb={6} spacing={4} align="center">
      <InputGroup size="lg" maxW="16rem" boxShadow="sm">
        <InputLeftElement pointerEvents="none">
          <Icon as={FaSearch} color={"white"} boxSize={5} />
        </InputLeftElement>
        <Input
          type="text"
          variant="filled"
          placeholder="Search by Title"
          textColor={"white"}
          bg={"rgba(255, 255, 255, 0.1)"}
          _hover={{
            bg: "rgba(255, 255, 255, 0.2)",
            boxShadow: "white",
          }}
          _focus={{
            bg: "purple",
            textColor: "white",
            borderColor: "white",
            boxShadow: "white",
          }}
          _placeholder={{ color: "gray" }}
          borderRadius={8}
          value={
            filteredTitle.length === 0 ? "" : String(filteredTitle[0].value)
          }
          onChange={(e) => onFilterChange("Title", e.target.value)}
        />
      </InputGroup>
      <Text textColor={"white"} size={"lg"}>
        COMPLEXITY
      </Text>
      <DropdownFilter
        label="Difficulty"
        filters={COMPLEXITIES}
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
        filterKey={"Complexity"}
        color="purple.300"
      />
      <Text textColor={"white"} size={"lg"}>
        TOPIC
      </Text>
      <DropdownFilter
        label="Topics"
        filters={topics}
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
        filterKey={"Categories"}
        color="purple.300"
      />
    </HStack>
  );
};

export default Filters;
