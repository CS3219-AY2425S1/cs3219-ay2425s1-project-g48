import React, { useState, useEffect, useRef, useContext } from "react";
import { Button, Spinner, Box, Text } from "@chakra-ui/react";
import Timer from "./Timer";
import { useNavigate, useSearchParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { useUserContext } from "../../context/UserContext";

const MatchingView: React.FC = () => {
  const navigate = useNavigate();
  const socketRef = useRef<Socket | null>(null);
  const [queueStatus, setQueueStatus] = useState<string>("loading"); // loading, matched, timeout
  // const [isMatched, setIsMatched] = useState<boolean>(false);
  // const [isTimeout, setIsTimeout] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0); // Track elapsed time
  const [status, setStatus] = useState<string>("");

  const [searchParams] = useSearchParams();
  const topic = searchParams.get("topic");
  const difficulty = searchParams.get("difficulty");

  const user = useUserContext().user;

  const timerRef = useRef<number | null>(null);

  // Timeout handler
  // const handleTimeout = (timeTaken: number) => {
  //   setElapsedTime(timeTaken); // Capture the elapsed time
  //   setIsLoading(false);
  //   // setIsTimeout(true); // Trigger timeout logic when time runs out
  // };

  // Success handler for match found
  const handleMatchFound = (room: string) => {
    setQueueStatus("matched");
    // setIsMatched(true); // Set match status
    setTimeout(() => {
      // Redirect to the collaboration room
      navigate(
        `/collaboration?topic=${topic}&difficulty=${difficulty}&room=${room}`
      );
    }, 1000);
  };

  const handleStartTimer = () => {
    timerRef.current = window.setInterval(() => {
      setElapsedTime((prevTime) => prevTime + 1);
    }, 1000);
  };

  const handleStopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setElapsedTime(0);
  };

  useEffect(() => {
    if (topic === null || difficulty === null) {
      navigate("/dashboard");
      return;
    }

    setStatus("Starting Ccnnection...");

    // Initialize the WebSocket connection
    socketRef.current = io("http://localhost:3000/");
    const socket = socketRef.current;

    if (socket === null) {
      return;
    }

    // Start the loading and matching process

    // Start a timer that increments every second
    // timerRef.current = window.setInterval(() => {
    //   setElapsedTime((prevTime) => prevTime + 1);
    // }, 1000);

    // Join the queue when connected
    socket.on("connect", () => {
      setStatus("Connected to the server, joining queue...");

      socket.emit("joinQueue", {
        username: user.username,
        topic: topic,
        difficulty: difficulty,
      });
    });

    // Listen for a queueEntered event from the server
    socket.on("queueEntered", (data: { message: string }) => {
      console.log("queue entered", data);
      setStatus(data.message);
      // set timer
      handleStartTimer();
    });

    // Listen for a match success from the server
    socket.on("matched", (data: { message: string; room: string }) => {
      console.log("Matched and assigned to room:", data.room);
      setStatus(data.message);

      handleStopTimer();
      handleMatchFound(data.room); // Handle match found with the room name
    });

    // Listen for a match failure from the server
    socket.on("matchFailed", (data: { error: string }) => {
      console.log("Match failed:", data.error);
      setStatus(data.error);
      setQueueStatus("timeout");

      handleStopTimer();

      // if (timerRef.current) {
      //   clearInterval(timerRef.current); // Stop the timer on failure
      //   handleTimeout(elapsedTime); // Call handleTimeout with the elapsed time
      // }
    });

    return () => {
      if (socketRef.current !== null) {
        socketRef.current.disconnect();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current); // Clean up the timer
      }
    };
  }, []); // Add elapsedTime to dependencies

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
      <Text fontSize="2xl" fontWeight="bold">
        Selected Topic: {topic}
      </Text>
      <Text fontSize="2xl" fontWeight="bold" mb={4}>
        Selected Difficulty: {difficulty}
      </Text>

      <Timer elapsedTime={elapsedTime} />

      {queueStatus === "loading" && (
        <Box textAlign="center" mt={4}>
          <Spinner size="xl" color="purple.600" />
          <Text fontSize="lg" mt={2}>
            Matching in progress... Do not refresh page!
          </Text>
          <Text fontSize="lg" mt={2}>
            Status: {status}
          </Text>
          <Button
            mt={4}
            colorScheme="red"
            onClick={() => navigate("/dashboard")}
          >
            Cancel
          </Button>
        </Box>
      )}

      {queueStatus === "matched" && (
        <Box
          textAlign="center"
          mt={4}
          bg="green.600"
          p={4}
          borderRadius="md"
          color="white"
        >
          <Text fontSize="lg" fontWeight="bold">
            Successfully matched! Redirecting...
          </Text>
        </Box>
      )}

      {queueStatus === "timeout" && (
        <Box
          textAlign="center"
          mt={4}
          bg="red.600"
          p={4}
          borderRadius="md"
          color="white"
        >
          <Text fontSize="lg" fontWeight="bold">
            Failed to find a match!
          </Text>
          <Button
            mt={4}
            colorScheme="purple"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default MatchingView;
