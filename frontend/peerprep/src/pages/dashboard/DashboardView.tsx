import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Avatar, Text, Box, Flex, VStack, HStack, Tooltip } from "@chakra-ui/react";
import { FaArrowRight } from "react-icons/fa";
import { useUserContext } from "../../context/UserContext";
import { COMPLEXITIES } from "../../constants/data";
import Dropdown from "./Dropdown";
import { useQuesApiContext } from "../../context/ApiContext";
import axios from "axios";

const DashboardView = () => {
  const navigate = useNavigate();
  const api = useQuesApiContext();
  const user = useUserContext().user;

  const services: string[] = ["View Questions", "Let's Match"];
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [topics, setTopics] = useState<{ topic: string; difficulties: string[] }[]>([]);
  const [filteredDifficulties, setFilteredDifficulties] = useState<string[]>([]);

  const [reconnectUrl, setReconnectUrl] = useState('');
  const [isReconnectValid, setIsReconnectValid] = useState(false);

  useEffect(() => {
    const storedUrl = sessionStorage.getItem('reconnectUrl');
    const storedUserId = sessionStorage.getItem('userId');

    if (storedUrl && storedUserId === user.id) {
        setReconnectUrl(storedUrl);
        setIsReconnectValid(true);
    } else {
        setIsReconnectValid(false);
        sessionStorage.removeItem('reconnectUrl');
        sessionStorage.removeItem('userId');
    }
  }, [user.id]);

  const fetchTopics = async () => {
    try {
      const response = await api.get<{ message: string; topics: { topic: string; difficulties: string[] }[] }>(
        "/questions/topics"
      );
      setTopics(response.data.topics);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error: ", error.response?.data || error.message);
      } else {
        console.error("Unknown error: ", error);
      }
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  useEffect(() => {
    const selectedTopicObject = topics.find(
      (topicObj) => topicObj.topic.toLowerCase() === selectedTopic.toLowerCase()
    );

    setFilteredDifficulties(selectedTopicObject ? selectedTopicObject.difficulties : []);
    setSelectedDifficulty(""); // Reset difficulty when topic changes
  }, [selectedTopic, topics]);

  return (
    <Flex direction="column" p={10} w="full" h="200vh">
      {/* Header Section */}
      <Flex justify="space-between" align="center" mb={10}>
        <HStack spacing={8}>
          <Avatar size="2xl" src="" />
          <Text fontSize="6xl" fontWeight="bold">
            Welcome back, {user.username}!
          </Text>
        </HStack>
        <Flex className="bg-white bg-opacity-10" align="center" justify="space-between" px={20} py={10} borderRadius="xl">
          <Flex direction="column" mr={10}>
            <Text fontSize="5xl" fontWeight="bold" textAlign="center">
              {user.questions.length}
            </Text>
            <Text fontSize="3xl" fontWeight="bold" textAlign="center">
              questions
            </Text>
          </Flex>
          <Button
            mt={6}
            borderColor="purple.300"
            borderWidth={2}
            borderRadius="full"
            size="lg"
            variant="outline"
            color="purple.300"
            _hover={{ bgColor: "purple.50" }}
            onClick={() => navigate("/history")}
          >
            View
          </Button>
        </Flex>
      </Flex>

      <Flex justify="flex-start" gap={14} w="full">
        {/* Step 1: Topic Selection */}
        <Box flex="1" maxW="600px">
          <Text fontSize="2xl" mb={4}>Step 1: Select Topic</Text>
          <Dropdown 
            placeholder="Choose a topic to begin"
            topics={topics.map((t) => t.topic)}
            onSelect={(topic) => setSelectedTopic(topic)}
            style={{
              width: "100%",
              height: "56px",
              backgroundColor: "#6B46C1",
              color: "white",
              borderRadius: "8px",
            }}
          />
        </Box>

        {/* Step 2: Difficulty Selection */}
        <Box flex="1" maxW="600px">
          <Text fontSize="2xl" mb={4}>Step 2: Select Difficulty</Text>
          <VStack spacing={6}>
            {COMPLEXITIES.map((value, ind) => (
              <Tooltip
                key={ind}
                label={!selectedTopic ? "Select a topic first" : ""}
                hasArrow
                placement="top"
              >
                <Button
                  w="100%"
                  h="14"
                  bgColor={selectedDifficulty === value.id ? "purple.600" : "purple.500"}
                  color="white"
                  fontSize="lg"
                  border="2px"
                  borderColor={selectedDifficulty === value.id ? "white" : "transparent"}
                  _hover={{ bgColor: selectedDifficulty === value.id ? "purple.700" : "purple.600" }}
                  isDisabled={!selectedTopic || !filteredDifficulties.includes(value.id.toLowerCase())}
                  onClick={() => setSelectedDifficulty(value.id)}
                >
                  {value.id}
                </Button>
              </Tooltip>
            ))}
          </VStack>
        </Box>

        {/* Step 3: Action Buttons */}
        <VStack flex="1" maxW="600px" spacing={6} align="flex-start">
          <Text fontSize="2xl" mb={4} textAlign="left">Step 3: Choose an Action</Text>
          {services.map((value, ind) => (
            <Tooltip
              key={ind}
              label={
                value === "View Questions"
                  ? selectedTopic ? "View available questions based on your selection" : "Select a topic first"
                  : selectedTopic && selectedDifficulty
                  ? "Find a match based on your selection"
                  : "Select both a topic and difficulty before matching"
              }
              hasArrow
              placement="top"
            >
              <Button
                w="100%"
                h="14"
                bgColor="purple.500"
                color="white"
                fontSize="lg"
                _hover={{ bgColor: "purple.600" }}
                rightIcon={<FaArrowRight />}
                isDisabled={
                  value === "Let's Match" && (!selectedTopic || !selectedDifficulty) ||
                  (value === "View Questions" && !selectedTopic)
                }
                onClick={() => {
                  if (value === "View Questions") {
                    navigate(`/questions?topic=${selectedTopic}&difficulty=${selectedDifficulty}`);
                  }
                  if (value === "Let's Match") {
                    navigate(`/matching?topic=${selectedTopic}&difficulty=${selectedDifficulty}`);
                  }
                }}
              >
                {value}
              </Button>
            </Tooltip>
          ))}

          {/* Centered Reconnect Message */}
          <Flex w="100%" justifyContent="center"> {/* Centering container */}
            <Text color={isReconnectValid ? "teal.500" : "green.300"} fontSize="lg" textAlign="center" pt={1}>
              {isReconnectValid ? (
                <Button colorScheme="teal" onClick={() => navigate(reconnectUrl)}>Reconnect</Button>
              ) : (
                "No active session to reconnect."
              )}
            </Text>
          </Flex>
        </VStack>
      </Flex>
    </Flex>
  );
};

export default DashboardView;
