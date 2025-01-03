import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  FormControl,
  FormLabel,
  Textarea,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Checkbox,
  Select,
  HStack,
  Box,
  CloseButton,
} from "@chakra-ui/react";
import { Question } from "../pages/question/questionModel";
import { CATEGORIES, COMPLEXITIES } from "../constants/data";

type QuestionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (question: {
    title: string;
    description: string;
    categories: string[];
    complexity: string;
    link: string;
  }) => void;
  initialQuestion?: Question | null; // Pass initial question if editing, or null if adding
};

const QuestionModal: React.FC<QuestionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialQuestion,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]); // To track selected categories
  const [complexity, setComplexity] = useState("");
  const [link, setLink] = useState("");
  const [inputCategory, setInputCategory] = useState("");

  // Populate fields with initial question data if editing
  useEffect(() => {
    if (isOpen && initialQuestion) {
      setTitle(initialQuestion.Title);
      setDescription(initialQuestion.Description);
      setSelectedCategories(initialQuestion.Categories); // Assuming Categories is a comma-separated string
      setComplexity(initialQuestion.Complexity);
      setLink(initialQuestion.Link);
    } else {
      setTitle("");
      setDescription("");
      setSelectedCategories([]);
      setComplexity("");
      setLink("");
    }
  }, [isOpen, initialQuestion]);

  const handleSave = () => {
    onSave({
      title,
      description,
      categories: selectedCategories,
      complexity,
      link,
    }); // Concatenate categories
    setTitle("");
    setDescription("");
    setSelectedCategories([]);
    setComplexity("");
    setLink("");
    onClose(); // Close the modal after saving
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((cat) => cat !== category)
        : [...prev, category]
    );
  };

  const addCategory = (cat: string) => {
    if (cat === "") {
      return;
    }

    cat = cat.toLowerCase();

    if (!selectedCategories.includes(cat)) {
      setSelectedCategories([...selectedCategories, cat]);
    }

    setInputCategory("");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {initialQuestion ? "Edit Question" : "Add Question"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <FormLabel>Title</FormLabel>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter question title"
            />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Description</FormLabel>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter question description"
            />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Categories</FormLabel>
            <Menu>
              <HStack pb={2}>
                {selectedCategories.map((cat, ind) => (
                  <div
                    key={ind}
                    className="flex flex-row p-1 space-x-2 border-2 border-purple-500 rounded-md capitalize"
                  >
                    <span>{cat}</span>
                    <CloseButton
                      variant="outline"
                      onClick={() =>
                        setSelectedCategories(
                          selectedCategories.filter((x) => x !== cat)
                        )
                      }
                    />
                  </div>
                ))}
              </HStack>
              <Input
                value={inputCategory}
                onChange={(e) => setInputCategory(e.target.value)}
                placeholder="Enter category"
              />
              <Button mt={2} onClick={() => addCategory(inputCategory)}>
                Add Category
              </Button>

              {/* <MenuButton
                as={Button}
                rightIcon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 12.5l-5-5h10l-5 5z" />
                  </svg>
                }
              >
                {selectedCategories.length > 0
                  ? selectedCategories.join(", ")
                  : "Select Categories"}
              </MenuButton> */}
              <MenuList>
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat.id}>
                    <Checkbox
                      isChecked={selectedCategories.includes(cat.id)}
                      onChange={(e) => {
                        e.preventDefault();
                        toggleCategory(cat.id);
                      }}
                    >
                      {cat.id}
                    </Checkbox>
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Complexity</FormLabel>
            <Select
              value={complexity || ""} // Ensure value is an empty string if complexity is not set
              onChange={(e) => setComplexity(e.target.value)}
            >
              <option value="" disabled>
                Select complexity
              </option>{" "}
              {/* Placeholder option */}
              {COMPLEXITIES.map((comp) => (
                <option key={comp.id} value={comp.id}>
                  {comp.id}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Link</FormLabel>
            <Textarea
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Enter question link"
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSave}>
            {initialQuestion ? "Save Changes" : "Add Question"}
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default QuestionModal;
