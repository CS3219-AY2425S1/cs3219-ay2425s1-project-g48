import React, { useState, useMemo } from "react";
import { UserQuestion } from "../../context/UserContext";
import { ColumnFilter, ColumnDef } from "@tanstack/react-table";
import {
  Badge,
  Box,
  Text,
  Button,
  useDisclosure,
  HStack,
} from "@chakra-ui/react";
import Filters from "../../components/Filter";
import { COMPLEXITIES } from "../../constants/data";
import DataTable from "../../components/DataTable";
import AttemptDetailsModal from "../../components/AttemptDetailsModal";
import { Topic } from "../question/questionModel";

type HistoryViewProps = {
  questions: UserQuestion[];
  topics: Topic[];
  initialCF: ColumnFilter[];
};

const HistoryView: React.FC<HistoryViewProps> = ({
  questions,
  topics,
  initialCF,
}) => {
  const [columnFilters, setColumnFilter] = useState<ColumnFilter[]>(initialCF);
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
  const { isOpen: isAttemptModalOpen, onOpen: onAttemptModalOpen, onClose: onAttemptModalClose } = useDisclosure();
  const [selectedQuestion, setSelectedQuestion] = useState<UserQuestion | null>(null);

  const getComplexityColor = (complexity: string) => {
    if (!complexity) return "grey";
    const found = COMPLEXITIES.find((c) => c.id.toLowerCase() === complexity.toLowerCase());
    return found ? found.color : "white";
  };

  const columns: ColumnDef<UserQuestion>[] = useMemo(
    () => [
      {
        header: "#",
        accessorFn: (_, rowIndex) => rowIndex + 1,
        id: "rowNumber",
        cell: ({ getValue }) => getValue<number>(),
      },
      { header: "Title", 
        accessorFn: (row) => row.title, 
        id: "Title", 
      },
      {
        header: "Topic",
        accessorFn: (row) => row.categories,
        id: "Categories", 
        cell: ({ getValue }) => {
          const categories = getValue<string[]>();
          return (
            <HStack spacing={1}>
              {categories.map((category) => (
                <Badge key={category.toLowerCase()} borderRadius="lg" px="4" py="2" bg="purple.500" color="white">
                  {category}
                </Badge>
              ))}
            </HStack>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const cat = row.getValue<string[]>(columnId);
          return cat.includes(filterValue);
        },
      },      
      {
        header: "Complexity",
        accessorFn: (row) => row.complexity, 
        id: "Complexity", 
        cell: ({ getValue }) => {
          const complexity = getValue<string>();
          const color = getComplexityColor(complexity);
          return (
            <Badge borderRadius="lg" px="5" py="2" bg={color}>
              <Text color={"whitesmoke"}>{complexity}</Text>
            </Badge>
          );
        },
      },      
      {
        header: "Attempts",
        accessorKey: "attempts",
        cell: ({ row }) => {
          return (
            <Button
              onClick={() => {
                setSelectedQuestion(row.original);
                onAttemptModalOpen();
              }}
              colorScheme="blue"
              variant="link"
            >
              View Attempt
            </Button>
          );
        },
      },
    ],
    [onModalOpen, onAttemptModalOpen]
  );

  return (
    <Box className="flex flex-col min-h-screen bg-gradient-to-br from-[#1D004E] to-[#141A67]" p={4}>
      <h2 className="flex justify-center text-white text-3xl font-semibold">Your History</h2>
      <Box className="flex-col justify-center items-center p-2">
        <Box className="flex justify-between">
          <Filters columnFilters={columnFilters} setColumnFilters={setColumnFilter} topics={topics} />
        </Box>
        <DataTable columns={columns} data={questions} columnFilters={columnFilters} setColumnFilters={setColumnFilter} />
        {/* Modal for Attempt Details */}
        <AttemptDetailsModal
          isOpen={isAttemptModalOpen}
          onClose={onAttemptModalClose}
          question={selectedQuestion}
        />
      </Box>
    </Box>
  );
};

export default HistoryView;