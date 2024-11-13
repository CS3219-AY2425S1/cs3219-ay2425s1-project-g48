import React from "react";
import QuestionView from "./QuestionView";
import {
  LeetCodeQuestionRequest,
  Question,
  QuestionRequest,
  Topic,
} from "./questionModel";
import { useQuesApiContext } from "../../context/ApiContext";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

const QuestionController: React.FC = () => {
  const api = useQuesApiContext();
  const [searchParams] = useSearchParams();
  const topic = searchParams.get("topic");
  const difficulty = searchParams.get("difficulty");
  
  const initialCF = React.useMemo(() => {
    const filters = [];
    if (topic) {
      filters.push({
        id: 'Categories',
        value: topic,
      });
    }
    if (difficulty) {
      filters.push({
        id: 'Complexity',
        value: difficulty,
      });
    }
    console.log(filters);
    return filters;
  }, [topic, difficulty]);

  // Function to assign random colors to each topic
  const assignColorsToTopics = (topics: { topic: string; difficulties: string[] }[]): Topic[] => {
  if (!Array.isArray(topics)) {
    console.error("Expected an array but received:", topics);
    return []; // Return an empty array if topics is not valid
  }

  return topics.map((topicObj, ind) => ({
    id: topicObj.topic,
    difficulties: topicObj.difficulties,
    color: ind % 2 == 0 ? "purple.700" : "purple.300",
    // color: generateRandomColor(), // Optionally use a random color generator
  }));
};

  const fetchQuestions = async (): Promise<Question[]> => {
    try {
      const response = await api.get<Question[]>("/questions");
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error: ", error.response?.data || error.message);
        throw new Error(
          error.response?.data?.message ||
            "An error occurred while fetching questions"
        );
      } else {
        console.error("Unknown error: ", error);
        throw new Error("An unexpected error occurred");
      }
    }
  };

  const fetchTopics = async (): Promise<Topic[]> => {
    try {
      const response = await api.get<{ message: string; topics: { topic: string; difficulties: string[] }[] }>(
        "/questions/topics"
      );
      return assignColorsToTopics(response.data.topics);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error: ", error.response?.data || error.message);
        throw new Error(
          error.response?.data?.message ||
            "An error occurred while fetching topics"
        );
      } else {
        console.error("Unknown error: ", error);
        throw new Error("An unexpected error occurred");
      }
    }
  };

  const {
    data: questions = [],
    isLoading: questionsLoading,
    refetch: refetchQuestions,
  } = useQuery({
    queryKey: ["questions"],
    queryFn: fetchQuestions,
    placeholderData: keepPreviousData,
  });

  const {
    data: topics = [],
    isLoading: topicsLoading,
    refetch: refetchTopics,
  } = useQuery({
    queryKey: ["topics"],
    queryFn: fetchTopics,
    placeholderData: keepPreviousData,
  });

  if (questionsLoading || topicsLoading) {
    return <div>Fetching...</div>;
  }

  const refetchAll = async () => {
    await Promise.all([refetchQuestions(), refetchTopics()]);
  };

  // Add question
  const handleAdd = async (newQuestion: {
    title: string;
    description: string;
    categories: string[];
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

    console.log("new question", newQuestionWithId);

    try {
      await api.post("/questions", newQuestionWithId);
      await refetchAll();
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error(
          `Failed to add question: ${
            error.response.data.error || "Invalid data provided"
          }`
        );
      } else {
        throw new Error("Failed to add question.");
      }
    }
  };

  // Add LeetCode question
  const handleLeetCodeAdd = async (newQuestion: {
    title: string;
  }): Promise<void> => {
    const newQuestionWithTitle: LeetCodeQuestionRequest = {
      Title: newQuestion.title,
    };

    try {
      await api.post("/questions/leetcode", newQuestionWithTitle);
      await refetchAll();
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error(
          `Failed to add LeetCode question: ${
            error.response.data.error || "Invalid data provided"
          }`
        );
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
      categories: string[];
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
      await refetchAll();
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error(
          `Failed to edit question: ${
            error.response.data.error || "Invalid data provided"
          }`
        );
      } else {
        throw new Error("Failed to edit question.");
      }
    }
  };

  // Delete question
  const handleDelete = async (id: string): Promise<void> => {
    try {
      await api.delete(`/questions?id=${id}`);
      await refetchAll();
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error(
          `Failed to delete question: ${
            error.response.data.error || "Invalid data provided"
          }`
        );
      } else {
        throw new Error("Failed to delete question.");
      }
    }
  };
  
  return (
    <QuestionView
      questions={questions}
      topics={topics}
      initialCF={initialCF}
      onAddQuestion={handleAdd}
      onAddLeetCodeQuestion={handleLeetCodeAdd}
      onDeleteQuestion={handleDelete}
      onEditQuestion={handleEdit}
    />
  );
};

export default QuestionController;
