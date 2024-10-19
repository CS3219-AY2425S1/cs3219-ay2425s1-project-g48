import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Box, Spinner, Text, Button } from "@chakra-ui/react";

const MatchingComponent: React.FC = () => {
  const location = useLocation();
  const { topic, difficulty } = location.state as { topic: string; difficulty: string };

  const [isLoading, setIsLoading] = useState(false);
  const [matchFound, setMatchFound] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [matchedUser, setMatchedUser] = useState("");

  const handleMatchStart = () => {
    setIsSearching(true);
    setIsLoading(true);
  };

  useEffect(() => {
    const matchTimeout = setTimeout(() => {
      if (isSearching) {
        setIsLoading(false);
        setMatchFound(false);
      }
    }, 10000);

    const matchSimulation = setTimeout(() => {
      if (isSearching) {
        setIsLoading(false);
        setMatchFound(true);
        setMatchedUser("User123");
      }
    }, 5000);

    return () => {
      clearTimeout(matchTimeout);
      clearTimeout(matchSimulation);
    };
  }, [isSearching]);

  const cancelMatching = () => {
    setIsSearching(false);
    setIsLoading(false);
    setMatchFound(false);
    setMatchedUser("");
  };

  const acceptMatch = () => {
    console.log("Match accepted!");
  };

  const declineMatch = () => {
    console.log("Match declined!");
    cancelMatching();
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      height="100vh"
      bgGradient="linear(to-br, #1D004E, #141A67)"
      color="white"
      p={4}
    >
      {!isSearching ? (
        <>
          <Text fontSize="2xl" fontWeight="bold">
            Selected Topic: {topic}
          </Text>
          <Text fontSize="2xl" fontWeight="bold" mb={4}>
            Selected Difficulty: {difficulty}
          </Text>
          <Button colorScheme="purple" onClick={handleMatchStart}>
            Start Matching
          </Button>
        </>
      ) : isLoading ? (
        <>
          <Spinner size="xl" color="purple.500" mb={4} />
          <Text fontSize="2xl" fontWeight="bold">
            Finding match...
          </Text>
          <Button mt={4} colorScheme="red" onClick={cancelMatching}>
            Cancel
          </Button>
        </>
      ) : matchFound ? (
        <>
          <Text fontSize="2xl" fontWeight="bold">
            Match found! You are matched with {matchedUser}.
          </Text>
          <Text fontSize="lg">Topic: {topic}</Text>
          <Text fontSize="lg">Difficulty: {difficulty}</Text>
          <Button mt={4} colorScheme="purple" onClick={acceptMatch}>
            Accept
          </Button>
          <Button mt={4} colorScheme="red" onClick={declineMatch}>
            Decline
          </Button>
        </>
      ) : (
        <>
          <Text fontSize="2xl" fontWeight="bold">
            No matches found. Do you want to keep searching?
          </Text>
          <Button mt={4} colorScheme="gray" onClick={cancelMatching}>
            Cancel
          </Button>
        </>
      )}
    </Box>
  );
};

export default MatchingComponent;
