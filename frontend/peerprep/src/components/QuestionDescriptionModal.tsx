// src/components/QuestionDescriptionModal.tsx
import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Link,
  IconButton,
  HStack,
  Text,
} from '@chakra-ui/react';
import parse from 'html-react-parser';
import { Question } from '../pages/question/questionModel';
import { FaLink } from 'react-icons/fa';

interface QuestionDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question | null;
}

const QuestionDescriptionModal: React.FC<QuestionDescriptionModalProps> = ({
  isOpen,
  onClose,
  question,
}) => {
  let parsedDescription;

  try {
    // Attempt to parse the description
    parsedDescription = question?.Description ? parse(question.Description) : "No description available.";
  } catch (error) {
    // If an error occurs, use the raw description text
    console.error("Error parsing description:", error);
    parsedDescription = question?.Description || "No description available.";
  }

  // Function to capitalize the first letter of a string
  const toTitleCase = (string: string) => {
    return string
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent bg="#371F76">
        <ModalHeader color="white">
          <HStack align="center">
            <Text>{toTitleCase(question?.Title || '')}</Text>
            <IconButton
              as={Link}
              icon={<FaLink />}
              href={question?.Link}
              target="_blank"
              colorScheme="white"
              size="md"
              aria-label="Go to Leetcode question"
            />
          </HStack>
        </ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody 
          color="white" 
          overflowY={parsedDescription ? 'auto' : 'hidden'} // Only show scroll if content exists
          maxH="500px"
          maxW="fit-content"
          padding={5}
        >
          {parsedDescription}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default QuestionDescriptionModal;
