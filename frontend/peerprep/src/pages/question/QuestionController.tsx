import React from "react";
import QuestionView from "./QuestionView";
import { LeetCodeQuestionRequest, Question, QuestionRequest } from "./questionModel";
import { useQuesApiContext } from "../../context/ApiContext";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";

const QuestionController: React.FC = () => {
  const api = useQuesApiContext();

  const fetchQuestions = async (): Promise<Question[]> => {
    try {
      const response = await api.get<Question[]>("/questions");
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error: ", error.response?.data || error.message);
        throw new Error(
          error.response?.data?.message || "An error occurred while fetching questions"
        );
      } else {
        console.error("Unknown error: ", error);
        throw new Error("An unexpected error occurred");
      }
    }
  };

  const { data: questions, refetch: refetchQuestions } = useQuery({
    queryKey: ["questions"],
    queryFn: fetchQuestions,
    placeholderData: keepPreviousData,
  });

  if (!questions) {
    return <div>Fetching...</div>;
  }

  // Add question
  const handleAdd = async (newQuestion: {
    title: string;
    description: string;
    categories: string;
    complexity: string;
    link: string;
  }): Promise<void> => {
    const newQuestionWithId: QuestionRequest = {
      Title: newQuestion.title,
      Description: newQuestion.description,
      Categories: newQuestion.categories,
      Complexity: newQuestion.complexity,
      Link: newQuestion.link,
    };

    try {
      await api.post("/questions", newQuestionWithId);
      await refetchQuestions();
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error(`Failed to add question: ${error.response.data.error || "Invalid data provided"}`);
      } else {
        throw new Error("Failed to add question.");
      }
    }
  };

  // Add LeetCode question
  const handleLeetCodeAdd = async (newQuestion: { title: string }): Promise<void> => {
    const newQuestionWithTitle: LeetCodeQuestionRequest = { Title: newQuestion.title };

    try {
      await api.post("/questions/leetcode", newQuestionWithTitle);
      await refetchQuestions();
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error(`Failed to add LeetCode question: ${error.response.data.error || "Invalid data provided"}`);
      } else if (error.response?.status === 409) {
        throw new Error("A question with this title already exists.");
      } else {
        throw new Error("Failed to add LeetCode question.");
      }
    }
  };

  // Edit question
  const handleEdit = async (
    updatedQuestion: {
      title: string;
      description: string;
      categories: string;
      complexity: string;
      link: string;
    },
    id: string
  ): Promise<void> => {
    const newQuestionWithId: Question = {
      ID: id,
      Title: updatedQuestion.title,
      Description: updatedQuestion.description,
      Categories: updatedQuestion.categories,
      Complexity: updatedQuestion.complexity,
      Link: updatedQuestion.link,
    };

    try {
      await api.put(`/questions`, newQuestionWithId);
      await refetchQuestions();
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error(`Failed to edit question: ${error.response.data.error || "Invalid data provided"}`);
      } else {
        throw new Error("Failed to edit question.");
      }
    }
  };

  // Delete question
  const handleDelete = async (id: string): Promise<void> => {
    try {
      await api.delete(`/questions?id=${id}`);
      await refetchQuestions();
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error(`Failed to delete question: ${error.response.data.error || "Invalid data provided"}`);
      } else {
        throw new Error("Failed to delete question.");
      }
    }
  };

  return (
    <QuestionView
      questions={questions}
      refetchQuestions={refetchQuestions}
      onAddQuestion={handleAdd}
      onAddLeetCodeQuestion={handleLeetCodeAdd}
      onDeleteQuestion={handleDelete}
      onEditQuestion={handleEdit}
    />
  );
};

export default QuestionController;