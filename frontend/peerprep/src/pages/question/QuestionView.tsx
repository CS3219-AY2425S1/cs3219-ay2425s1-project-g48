import React, { useState, useMemo } from "react";
//import { QueryObserverResult } from "@tanstack/react-query";
import { Question, Topic } from "./questionModel";
import { ColumnFilter, ColumnDef } from "@tanstack/react-table";
//import { useQuesApiContext } from "../../context/ApiContext";
import {
  Badge,
  Box,
  Text,
  Button,
  Icon,
  useDisclosure,
  ButtonGroup,
  IconButton,
  HStack,
} from "@chakra-ui/react";
import { FaEdit, FaTrash } from "react-icons/fa";
import Filters from "../../components/Filter";
import { COMPLEXITIES } from "../../constants/data";
import DataTable from "../../components/DataTable";
import QuestionModal from "../../components/QuestionModal";
import { toast } from "react-toastify"; // Import toast for notifications
import { LeetCodeModal } from "../../components/LeetCodeModal";
import QuestionDescriptionModal from "../../components/QuestionDescriptionModal";
import { useUserContext } from "../../context/UserContext"; // Import the user context


type QuestionViewProps = {
  questions: Question[];
  topics: Topic[];
  initialCF: ColumnFilter[];
  onAddQuestion: (newQuestion: {
    title: string;
    description: string;
    categories: string[];
    complexity: string;
    link: string;
  }) => Promise<void>;
  onAddLeetCodeQuestion: (newQuestion: { title: string }) => Promise<void>;
  onEditQuestion: (
    newQuestion: {
      title: string;
      description: string;
      categories: string[];
      complexity: string;
      link: string;
    },
    id: string
  ) => Promise<void>;
  onDeleteQuestion: (id: string) => Promise<void>;
};

const QuestionView: React.FC<QuestionViewProps> = ({
  questions,
  topics,
  initialCF,
  onAddQuestion,
  onAddLeetCodeQuestion,
  onEditQuestion,
  onDeleteQuestion,
}) => {
  const { user } = useUserContext();
  const [columnFilters, setColumnFilter] = useState<ColumnFilter[]>(initialCF);

  const {
    //isOpen: isMenuOpen,
    //onOpen: onMenuOpen,
    onClose: onMenuClose,
  } = useDisclosure();
  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure();
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const {
    isOpen: isQuestionModalOpen,
    onOpen: onQuestionModalOpen,
    onClose: onQuestionModalClose,
  } = useDisclosure();
  const {
    isOpen: isLeetCodeModalOpen,
    onOpen: onLeetCodeModalOpen,
    onClose: onLeetCodeModalClose,
  } = useDisclosure();

  // Check if the user can edit/delete a question

  const canEditDelete = (questionOwnerId: string) => {

    return user.isAdmin;
  }
  
  // Handle Add LeetCode Question
  const handleLeetCodeAdd = async (newQuestion: { title: string }) => {
    try {
      await onAddLeetCodeQuestion(newQuestion);
      toast.success("LeetCode Question added successfully!");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to add LeetCode Question.");
    }
    onLeetCodeModalClose();
  };

  // Handle Add Custom Question
  const handleAdd = async (newQuestion: {
    title: string;
    description: string;
    categories: string[];
    complexity: string;
    link: string;
  }) => {
    try {
      await onAddQuestion(newQuestion);
      toast.success("Question added successfully!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
    onQuestionModalClose();
  };

  // Handle Edit Question
  const handleEdit = async (updatedQuestion: {
    title: string;
    description: string;
    categories: string[];
    complexity: string;
    link: string;
  }) => {
    if (selectedQuestion) {
      try {
        console.log(selectedQuestion.ID);
        await onEditQuestion(updatedQuestion, selectedQuestion.ID);
        toast.success("Question updated successfully!");
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
      }
    }
    setSelectedQuestion(null);
    onQuestionModalClose();
  };

  // Handle Delete Question
  const handleDelete = async (id: string) => {
    try {
      await onDeleteQuestion(id);
      toast.success("Question deleted successfully!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  // Function to get the color for complexity
  const getComplexityColor = (complexity: string) => {
    if (!complexity) return "grey";
    const found = COMPLEXITIES.find(
      (c) => c.id.toLowerCase() === complexity.toLowerCase()
    );
    return found ? found.color : "white";
  };

  // Define the table columns
  const columns: ColumnDef<Question>[] = useMemo(() => {
  const baseColumns: ColumnDef<Question>[] = [
    {
      header: "#",
      accessorFn: (_, rowIndex) => rowIndex + 1,
      id: "rowNumber",
      cell: ({ getValue }) => getValue<number>(),
    },
    { header: "Title", accessorKey: "Title" },
    {
      header: "Topic",
      accessorKey: "Categories",
      cell: ({ getValue }) => {
        const categories = getValue<string[]>();

        return (
          <HStack spacing={1}>
            {categories.map((category) => (
              <Badge
                key={category}
                borderRadius="lg"
                px="4"
                py="2"
                bg="purple.500"
                color="white"
              >
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
      accessorKey: "Complexity",
      cell: ({ getValue }) => {
        const complexity = getValue<string>();
        const color = getComplexityColor(complexity);
        return (
          <Badge borderRadius="lg" px="5" py="2" bg={color}>
            <Text color={"whitesmoke"}>{complexity}</Text>
          </Badge>
        );
      },
      enableSorting: true,
    },
    {
      header: "Question",
      accessorKey: "Question",
      cell: ({ row }) => (
        <Button
          onClick={() => {
            setSelectedQuestion(row.original);
            onModalOpen();
            onMenuClose();
          }}
          colorScheme="blue"
          variant="link"
        >
          View
        </Button>
      ),
    },
  ];

  // Add the "Actions" column only if the user is an admin
  if (user.isAdmin) {
    baseColumns.push({
      header: "Actions",
      cell: ({ row }) => (
        <ButtonGroup size="sm" isAttached>
          <IconButton
            icon={<Icon as={FaEdit} />}
            aria-label="Edit"
            colorScheme="purple"
            onClick={() => {
              setSelectedQuestion(row.original);
              onQuestionModalOpen();
              onMenuClose();
            }}
          />
          <IconButton
            icon={<Icon as={FaTrash} />}
            aria-label="Delete"
            colorScheme="red"
            onClick={() => handleDelete(row.original.ID)}
          />
        </ButtonGroup>
      ),
    });
  }

  return baseColumns;
}, [onModalOpen, onMenuClose, user]);



  return (
    <Box
      className="flex flex-col min-h-screen bg-gradient-to-br from-[#1D004E] to-[#141A67]"
      p={4}
    >
      <h2 className="flex justify-center text-white text-3xl font-semibold">
        Questions
      </h2>
      <Box className="flex-col justify-center items-center p-2">
        {/* Search Filter Input */}
        <Box className="flex justify-between">
          <Filters
            columnFilters={columnFilters}
            setColumnFilters={setColumnFilter}
            topics={topics}
          />
          {user.isAdmin && (
            <HStack mb={6} spacing={4} align="center">
              <Button colorScheme="purple" onClick={onLeetCodeModalOpen}>
                Add LeetCode Question
              </Button>
              <Button
                colorScheme="purple"
                onClick={() => {
                  setSelectedQuestion(null);
                  onQuestionModalOpen();
                }}
              >
                Add Question
              </Button>
            </HStack>
          )}
        </Box>

        {/* Table Display */}
        <DataTable
          columns={columns}
          data={questions}
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilter}
        />

        {/* Modal for Question Details */}
        <QuestionDescriptionModal
          isOpen={isModalOpen}
          onClose={() => {
            onModalClose();
            onMenuClose();
          }}
          question={selectedQuestion}
        />
        {/* Modal for Question Edit */}
        <QuestionModal
          isOpen={isQuestionModalOpen}
          onClose={onQuestionModalClose}
          onSave={selectedQuestion ? handleEdit : handleAdd}
          initialQuestion={selectedQuestion}
        />
        {/* Modal for LeetCode Question */}
        <LeetCodeModal
          isOpen={isLeetCodeModalOpen}
          onClose={onLeetCodeModalClose}
          onSave={handleLeetCodeAdd}
        />
      </Box>
    </Box>
  );
};

export default QuestionView;