import React, { useState, useEffect } from "react";
import { Box, Text } from "@chakra-ui/react";

interface TimerProps {
  elapsedTime: number; // Elapsed time in seconds
  // timeLimit: number; // Maximum time in seconds (e.g., 60 seconds)

  // onTimeout: (timeTaken: number) => void; // Callback when timer reaches time limit

  // onMatchFound: () => void; // Callback when a match is found (if match is found)

  // isMatched: boolean; // Whether the user has found a match
}

const Timer: React.FC<TimerProps> = ({ elapsedTime }) => {
  // const [elapsedTime, setElapsedTime] = useState<number>(0);

  // useEffect(() => {
  //   // If user finds a match before time limit, trigger the match callback
  //   if (isMatched) {
  //     onMatchFound();
  //     return;
  //   }

  //   // If time reaches the limit, trigger the timeout callback
  //   if (elapsedTime >= timeLimit) {
  //     onTimeout(elapsedTime);
  //     return;
  //   }

  //   // Increment the elapsed time every second
  //   const intervalId = setInterval(() => {
  //     setElapsedTime((prev) => prev + 1);
  //   }, 1000);

  //   // Clean up the interval when the component unmounts or time reaches limit
  //   return () => clearInterval(intervalId);
  // }, [elapsedTime, timeLimit, isMatched, onTimeout, onMatchFound]);

  // Format time to MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  };

  return (
    <Box
      bg="purple.600"
      p={4}
      borderRadius="md"
      textAlign="center"
      color="white"
    >
      <Text fontSize="xl" fontWeight="bold">
        Time in Queue: {formatTime(elapsedTime)}
      </Text>
    </Box>
  );
};

export default Timer;
