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
} from "@chakra-ui/react";

type LeetCodeModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (title: {
      title: string;
    }) => void;
}

export const LeetCodeModal : React.FC<LeetCodeModalProps> = ({
    isOpen,
    onClose,
    onSave,
    }) => {
    const [title, setTitle] = useState("");

    const handleSave = () => {
        onSave({
          title,
        }); 
        setTitle("");
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent bg="#371F76">
            <ModalHeader color="white">Add LeetCode Question</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
            <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter LeetCode question title"
                color="white"
                mb={4}
            />
            </ModalBody>
            <ModalFooter>
            <Button colorScheme="purple" onClick={handleSave}>
                Add Question
            </Button>
            </ModalFooter>
        </ModalContent>
        </Modal>
    )
};