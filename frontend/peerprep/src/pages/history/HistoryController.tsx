import React from "react";
import HistoryView from "./HistoryView";
import { useQuesApiContext } from "../../context/ApiContext";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { Topic } from "../question/questionModel";
import { useUserContext } from "../../context/UserContext";

const HistoryController: React.FC = () => {
  const api = useQuesApiContext();
  const [searchParams] = useSearchParams();
  const topic = searchParams.get("topic");
  const difficulty = searchParams.get("difficulty");
  const user = useUserContext();
  
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
  }));
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
    data: topics = [],
    isLoading: topicsLoading,
    refetch: refetchTopics,
  } = useQuery({
    queryKey: ["topics"],
    queryFn: fetchTopics,
    placeholderData: keepPreviousData,
  });

  
  return (
    <HistoryView
      questions={user?.user.questions || []}
      topics={topics}
      initialCF={initialCF}
    />
  );
};

export default HistoryController;
