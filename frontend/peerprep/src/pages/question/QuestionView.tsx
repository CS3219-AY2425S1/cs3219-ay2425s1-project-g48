import React, { useState, useMemo } from "react";
import { QueryObserverResult } from "@tanstack/react-query";

import { Question, QuestionRequest } from "./questionService";
import { ColumnFilter, ColumnDef } from "@tanstack/react-table";
import { useQuesApiContext } from "../../context/ApiContext";
import {
  Badge,
  Box,
  Text,
  Button,
  Icon,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ButtonGroup,
  IconButton,
} from "@chakra-ui/react";
import { FaEdit, FaTrash } from "react-icons/fa";
import MenuDrawer from "../../components/layout/MenuDrawer";
import Filters from "../../components/Filter";
import { COMPLEXITIES, CATEGORIES } from "../../constants/data";
import DataTable from "../../components/DataTable";
import QuestionModal from "../../components/QuestionModal";
import { toast } from "react-toastify";

type QuestionViewProps = {
  questions: Question[];
  refetchQuestions: () => Promise<QueryObserverResult<Question[], Error>>;
  // onDeleteQuestion: (title: string) => void;
};

const QuestionView: React.FC<QuestionViewProps> = ({
  questions,
  refetchQuestions,
}) => {
  const [columnFilters, setColumnFilter] = useState<ColumnFilter[]>([]);
  const {
    isOpen: isMenuOpen,
    onOpen: onMenuOpen,
    onClose: onMenuClose,
  } = useDisclosure();
  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure();
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  ); // State for the selected question
  const {
    isOpen: isQuestionModalOpen,
    onOpen: onQuestionModalOpen,
    onClose: onQuestionModalClose,
  } = useDisclosure();

  const api =  useQuesApiContext();

  // Handle Add Function
  const handleAdd = async (newQuestion: {
    title: string;
    description: string;
    categories: string;
    complexity: string;
    link: string;
  }) => {
    // Create the new question object with incremented ID
    const newQuestionWithId: QuestionRequest = {
      // ID: lastQuestionId + 1,
      Title: newQuestion.title,
      Description: newQuestion.description,
      Categories: newQuestion.categories,
      Complexity: newQuestion.complexity,
      Link: newQuestion.link,
    };

    try {
      const response = await api.post("/questions", newQuestionWithId);
      if (response.status === 200) {
        toast.success("Question added successfully");
      }
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        // Backend-specific error handling for 400 Bad Request
        toast.error(
          `Failed to add question: ${
            error.response.data.error || "Invalid data provided"
          }`
        );
      } else {
        // General error handling
        toast.error("Failed to add question.");
      }
      console.error("Error adding question:", error);
    }

    await refetchQuestions();
    onQuestionModalClose(); // Close the modal after adding
  };

  const handleEdit = async (updatedQuestion: {
    title: string;
    description: string;
    categories: string;
    complexity: string;
    link: string;
  }) => {
    if (selectedQuestion) {
      const newQuestionWithId: Question = {
        ID: selectedQuestion.ID,
        Title: updatedQuestion.title,
        Description: updatedQuestion.description,
        Categories: updatedQuestion.categories,
        Complexity: updatedQuestion.complexity,
        Link: updatedQuestion.link,
      };
      // Logic to save the edited question
      try {
        const response = await api.put("/questions", newQuestionWithId);
        if (response.status === 200) {
          toast.success("Question updated successfully");
        }
      } catch (error: any) {
        if (error.response && error.response.status === 400) {
          // Backend-specific error handling for 400 Bad Request
          toast.error(
            `Failed to add question: ${
              error.response.data.error || "Invalid data provided"
            }`
          );
        } else {
          // General error handling
          toast.error("Failed to add question.");
        }
        console.error("Error adding question:", error);
      }
      await refetchQuestions();
      setSelectedQuestion(null);
      onQuestionModalClose();
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await api.delete(`/questions?id=${id}`);
      if (response.status === 200) {
        toast.success("Question deleted successfully");
      }
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        // Backend-specific error handling for 400 Bad Request
        toast.error(
          `Failed to delete question: ${
            error.response.data.error || "Invalid data provided"
          }`
        );
      } else {
        // General error handling
        toast.error("Failed to delete question.");
      }
    }

    await refetchQuestions();
  };

  const getComplexityColor = (complexity: string) => {
    if (!complexity) return "white"; // Default color for undefined complexity
    const found = COMPLEXITIES.find(
      (c) => c.id.toLowerCase() === complexity.toLowerCase()
    );
    return found ? found.color : "white";
  };

  const getCategoryColor = (category: string) => {
    if (!category) return "white"; // Default color for undefined category
    const found = CATEGORIES.find(
      (c) => c.id.toLowerCase() === category.toLowerCase()
    );
    return found ? found.color : "white";
  };

  const columns: ColumnDef<Question>[] = useMemo(
    () => [
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
          const category = getValue<string>();
          const color = getCategoryColor(category);
          return (
            <Text color={color} fontWeight="bold" mb={1}>
              {category}
            </Text>
          );
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
        enableSorting: true, // Enable sorting on this column
      },
      {
        header: "Question",
        accessorKey: "Question",
        cell: ({ row }) => {
          return (
            <Button
              onClick={() => {
                setSelectedQuestion(row.original); // Set the selected question data
                onModalOpen(); // Open the modal
                onMenuClose(); // Close the menu if it is open
              }}
              colorScheme="blue"
              variant="link"
            >
              View
            </Button>
          );
        },
      },
      {
        header: "Link",
        accessorKey: "Link",
        cell: ({ getValue }) => {
          const link = getValue<string>();
          return (
            <Button
              as="a"
              href={link}
              target="_blank"
              colorScheme="blue"
              variant="link"
            >
              Go To Link
            </Button>
          );
        },
      },
      {
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
            {/* Delete Button */}
            <IconButton
              icon={<Icon as={FaTrash} />}
              aria-label="Delete"
              colorScheme="red"
              onClick={() => {
                handleDelete(row.original.ID);
                // onDeleteQuestion(row.original.Title); // Call the delete handler
              }}
            />
          </ButtonGroup>
        ),
      },
    ],
    [onModalOpen, onMenuClose]
  );
  return (
    <Box
      className="flex flex-col min-h-screen bg-gradient-to-br from-[#1D004E] to-[#141A67]"
      p={4}
    >
      {/* Drawer for menu */}
      {/* <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => {
          onMenuClose();
          onModalClose(); // Ensure modal closes if menu closes
        }}
        setAuth={se}
      /> */}

      <Box className="flex-col justify-center items-center p-2">
        {/* Search Filter Input */}
        <h2 className="flex justify-center text-white text-3xl font-semibold">
          Questions
        </h2>
        <Box className="flex justify-between">
          <Filters
            columnFilters={columnFilters}
            setColumnFilters={setColumnFilter}
          />
          <Button
            colorScheme="purple"
            onClick={() => {
              setSelectedQuestion(null);
              onQuestionModalOpen();
            }}
          >
            Add Question
          </Button>
        </Box>
        {/* Table Display */}
        <DataTable
          columns={columns}
          data={questions}
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilter}
        />

        {/* Modal for Question Details */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            onModalClose(); // Close modal
            onMenuClose(); // Ensure menu closes if modal closes
          }}
          isCentered
        >
          <ModalOverlay />
          <ModalContent bg="#371F76">
            <ModalHeader color="white">{selectedQuestion?.Title}</ModalHeader>{" "}
            {/* Set text color to white */}
            <ModalCloseButton />
            <ModalBody>
              <Text color="white">{selectedQuestion?.Description}</Text>{" "}
              {/* Set text color to white */}
              <br /> {/* Add a line break for spacing */}
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Single Question Modal for both Add and Edit */}
        <QuestionModal
          isOpen={isQuestionModalOpen}
          onClose={onQuestionModalClose}
          onSave={selectedQuestion ? handleEdit : handleAdd}
          initialQuestion={selectedQuestion}
        />
      </Box>
    </Box>
  );
};

export default QuestionView;
