import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Avatar, Text, Box, Flex, VStack, HStack } from "@chakra-ui/react";
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

    console.log("Stored URL:", storedUrl);
    console.log("Stored User ID:", storedUserId);
    console.log("Current User ID:", user.id);

    if (storedUrl && storedUserId === user.id) {
        setReconnectUrl(storedUrl);
        setIsReconnectValid(true);
        console.log("Reconnect valid:", true);
    } else {
        setIsReconnectValid(false);
        sessionStorage.removeItem('reconnectUrl');
        sessionStorage.removeItem('userId');
        console.log("Reconnect valid:", false);
    }
}, [user.id]);

  // Function to fetch topics
  const fetchTopics = async () => {
    try {
      const response = await api.get<{ message: string; topics: { topic: string; difficulties: string[] }[] }>(
        "/questions/topics"
      );
      setTopics(response.data.topics);
      console.log(response)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error: ", error.response?.data || error.message);
      } else {
        console.error("Unknown error: ", error);
      }
    }
  };

  // Fetch topics on component mount
  useEffect(() => {
    fetchTopics();
  }, []);

  // Update filtered difficulties when topic changes
  useEffect(() => {
    console.log("Selected Topic:", selectedTopic);
    console.log("Topics Array:", topics);

    const selectedTopicObject = topics.find(
      (topicObj) => topicObj.topic.toLowerCase() === selectedTopic.toLowerCase()
    );

    if (!selectedTopicObject) {
      console.warn("No match found for selected topic:", selectedTopic);
    } else {
      console.log("Found Topic Object:", selectedTopicObject);
    }

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
              12/20
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
            onClick={() => navigate("/questions")}
          >
            View
          </Button>
        </Flex>
      </Flex>
      
      {/* Topic and Difficulty Section */}
      <Flex justify="space-between">
        {/* Topic Selection */}
        <Box w="30%">
          <Text fontSize="2xl" mb={4}>Select Topic: </Text>
          <Dropdown 
            topics={topics.map((t) => t.topic)} 
            onSelect={(topic) => setSelectedTopic(topic)} 
          />
        </Box>

        {/* Difficulty Selection */}
        <Box w="30%">
          <Text fontSize="2xl" mb={4}>Select Difficulty:</Text>
          <VStack spacing={6}>
            {COMPLEXITIES.map((value, ind) => (
              <Button
                key={ind}
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
            ))}
          </VStack>
        </Box>

        {/* Action Buttons */}
        <VStack w="30%" spacing={6} align="center">
          {services.map((value, ind) => (
            <Button
              key={ind}
              w="100%"
              h="14"
              bgColor="purple.500"
              color="white"
              fontSize="lg"
              _hover={{ bgColor: "purple.600" }}
              rightIcon={<FaArrowRight />}
              isDisabled={value === "Let's Match" && (!selectedTopic || !selectedDifficulty)}
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
          ))}
          {(!selectedDifficulty || !selectedTopic) && (
            <Text fontWeight="bold" color="red.300" fontSize="lg">
              Select a topic and difficulty before matching
            </Text>
          )}
        </VStack>
      </Flex>

      {/* Reconnect Button */}
      <Flex justify="center" mt={10}>
        {isReconnectValid && reconnectUrl ? (
          <Button
            colorScheme="teal"
            onClick={() => {
              if (reconnectUrl) {
                navigate(reconnectUrl);
              } else {
                console.warn("No reconnect URL available.");
              }
            }}
          >
            Reconnect
          </Button>
        ) : (
          <Text fontWeight="bold" color="red.300" fontSize="lg">
            No valid session to reconnect.
          </Text>
        )}
      </Flex>
    </Flex>
  );
};

export default DashboardView;