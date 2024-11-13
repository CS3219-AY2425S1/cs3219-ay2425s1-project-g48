// src/components/AttemptDetailsModal.tsx
import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Box,
  Text,
  HStack,
  IconButton,
  Link,
  VStack,
  Code,
} from '@chakra-ui/react';
import { UserQuestion } from '../context/UserContext'; // Adjust the import according to your project structure
import { FaLink } from 'react-icons/fa';
import parse from 'html-react-parser';

interface AttemptDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: UserQuestion | null;
}

const AttemptDetailsModal: React.FC<AttemptDetailsModalProps> = ({
  isOpen,
  onClose,
  question,
}) => {
  let parsedDescription;

  try {
    parsedDescription = question?.description ? parse(question.description) : "No description available.";
  } catch (error) {
    console.error("Error parsing description:", error);
    parsedDescription = question?.description || "No description available.";
  }

  // Function to capitalize the first letter of a string
  const toTitleCase = (string: string) => {
    return string
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

    // Format the date to Singapore format (day-month-year and 24-hour time)
    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return "Date not available";
    
        try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) throw new Error("Invalid date");
        return new Intl.DateTimeFormat('en-SG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: false, // 24-hour format
        }).format(date);
        } catch (error) {
        console.error("Error parsing date:", error);
        return "Invalid date";
        }
    };
    

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader color="black">
          <HStack align="center">
            <Text>{toTitleCase(question?.title || '')}</Text>
            <IconButton
              as={Link}
              icon={<FaLink />}
              href={question?.link}
              target="_blank"
              color="black"
              size="md"
              aria-label="Go to question link"
            />
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
        <Text fontWeight="bold" mb={4}>Attempt Details:</Text>
          <VStack spacing={4}>
            {question?.attempt === '' ? (
              <Text>No attempts available for this question.</Text>
            ) : (
              <Box p={4} borderWidth={1} borderRadius="md" w="full">
                <Text fontWeight="bold">Code:</Text>
                <Code
                  whiteSpace="pre-wrap"
                  display="block"
                  p={4}
                  borderRadius="md"
                  w="full"
                  colorScheme="blackAlpha"
                >
                  {question?.attempt}
                </Code>
                <Text fontWeight="bold">Date Attempted:</Text>
                <Text>{formatDate(question?.completionDate)}</Text>
              </Box>
            )}
          </VStack>
          <Text fontWeight="bold" my={4}>Question Description:</Text>
          <Box
            borderWidth={1} 
            borderRadius="md"
            color="black"
            overflowY={parsedDescription ? 'auto' : 'hidden'}
            maxH="500px"
            maxW="fit-content"
            padding={5}
          >
            {parsedDescription}
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AttemptDetailsModal;