import React, { useState, useRef, useEffect, useContext } from "react";
import { io, Socket } from "socket.io-client";
import {
  UserContext,
  UserQuestion,
  useUserContext,
} from "../../context/UserContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuthApiContext, useQuesApiContext } from "../../context/ApiContext";
import { Question } from "../question/questionModel";
import EditorElement from "./EditorElement";
import QuestionDisplay from "./QuestionDisplay";
import GeminiChat from "./GeminiChat";
import { border, Box, Button } from "@chakra-ui/react";
import ChatBox from "./ChatBox";
import { addQuestionToUser } from "./updateQuestionController";

const EditorView: React.FC = () => {
  const navigate = useNavigate();
  const socketRef = useRef<Socket | null>(null);
  const [socketId, setSocketId] = useState<string | undefined>("");
  const [currentCode, setCurrentCode] = useState<string>("");
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const userContext = useContext(UserContext);
  const user = userContext?.user;

  const [searchParams] = useSearchParams();
  const [question, setQuestion] = useState<Question | null>(null);
  const authApi = useAuthApiContext();

  const roomId = searchParams.get("room");
  const questionId = searchParams.get("questionId");

  useEffect(() => {
    const disconnected = sessionStorage.getItem("disconnected");

    if (
      disconnected === "true" ||
      roomId === null ||
      roomId === "" ||
      !questionId
    ) {
      navigate("/dashboard");
      return;
    }

    const url = import.meta.env.VITE_COLLAB_API_URL;

    socketRef.current = io(url, {
      path: "/api",
      query: { roomId },
    });
    const socket = socketRef.current;

    if (socket === null) return;

    socket.on("connect", () => {
      console.log("connected");
      setSocketId(socket.id);
    });

    return () => {
      if (socketRef.current !== null) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const saveCode = (code: string) => {
    setCurrentCode(code);
    console.log("Code saved:", code);
  };

  const saveQuestion = (question: Question) => {
    setQuestion(question);
  };

  const handleQuestionUpdate = async (
    question: Question | null,
    currentCode: string
  ) => {
    if (question && currentCode && user) {
      const userQuestion = {
        questionId: question.ID,
        title: question.Title,
        description: question.Description,
        complexity: question.Complexity,
        categories: question.Categories,
        link: question.Link,
        attempt: currentCode,
      };
      console.log("Added Question:", userQuestion);
      await addQuestionToUser(user.id, userQuestion, authApi);
    }
    await userContext?.refetch();
  };

  const disconnectAndGoBack = async (
    question: Question | null,
    currentCode: string
  ) => {
    await handleQuestionUpdate(question, currentCode);
    socketRef.current?.disconnect();
    sessionStorage.setItem("disconnected", "true");
    sessionStorage.removeItem("reconnectUrl");
    navigate("/dashboard");
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          .editor-scrollbar::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          .editor-scrollbar::-webkit-scrollbar-track {
            background: #2e2e3e;
          }
          .editor-scrollbar::-webkit-scrollbar-thumb {
            background-color: #444;
            border-radius: 4px;
          }
          .editor-scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: #555;
          }
          .editor-scrollbar {
            scrollbar-color: #444 #2e2e3e;
            scrollbar-width: thin;
          }
        `}
      </style>
      <Box style={styles.leftSection}>
        <QuestionDisplay
          className="editor-scrollbar"
          questionId={questionId}
          styles={styles}
          onFetchQuestion={saveQuestion}
        />
      </Box>

      <Box style={styles.rightSection}>
        <Box style={styles.chatGeminiContainer}>
          <Box style={styles.geminiChatContainer}>
            <h2 style={styles.chatTitle}>GenAI Assistant</h2>{" "}
            {/* GenAI Assistant */}
            <GeminiChat socketRef={socketRef} />
          </Box>
          <Box style={styles.chatContainer}>
            <h2 style={styles.chatTitle}>User Chat</h2> {/* User Chat */}
            <ChatBox
              roomId={roomId}
              user={user ?? null}
              onEndSession={disconnectAndGoBack}
              question={question}
              currentCode={currentCode}
            />
          </Box>
        </Box>
        <Box style={styles.editorContainer} className="editor-scrollbar">
          {socketRef.current && (
            <EditorElement socket={socketRef.current} onCodeChange={saveCode} />
          )}
        </Box>
      </Box>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    backgroundColor: "#1e1e2e",
    padding: "10px",
    borderRadius: "8px",
  },
  leftSection: {
    display: "flex",
    flexDirection: "column" as const,
    width: "30%",
    padding: "20px",
  },
  chatTitle: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    color: "#82AAFF", // Matches the theme color
    marginBottom: "10px",
  },
  questionSection: {
    color: "#ffffff",
    backgroundColor: "#2e2e3e",
    borderRadius: "8px",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
    overflowY: "auto",
    padding: "5px",
  },
  questionTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#FFCB6B",
  },
  questionDetail: {
    fontSize: "1rem",
    marginBottom: "15px",
    lineHeight: "1.5",
  },
  questionSubheading: {
    fontSize: "1.1rem",
    fontWeight: "600",
    marginTop: "15px",
    marginBottom: "5px",
    color: "#82AAFF",
  },
  leetCodeLink: {
    color: "#89DDFF",
    textDecoration: "none",
    fontWeight: "bold",
    marginTop: "10px",
    display: "inline-block",
  },
  rightSection: {
    display: "flex",
    flexDirection: "column" as const,
    width: "70%",
    padding: "10px",
  },
  topSection: {
    display: "flex",
    marginBottom: "15px",
  },
  chatGeminiContainer: {
    display: "flex",
    flexDirection: "row" as const, // Arrange GeminiChat and ChatBox side-by-side
    marginBottom: "15px",
    gap: "10px", // Adds space between GeminiChat and ChatBox
  },
  geminiChatContainer: {
    flex: 1, // Makes GeminiChat take up half the space
    display: "flex",
    flexDirection: "column" as const,
    padding: "10px",
    backgroundColor: "#2e2e3e",
    borderRadius: "8px",
    overflowY: "auto",
  },
  chatContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    padding: "15px",
    backgroundColor: "#2e2e3e",
    borderRadius: "8px",
    color: "#ffffff",
    overflowY: "auto",
  },
  editorContainer: {
    backgroundColor: "#1e1e2e",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
    overflowY: "auto",
    outerWidth: "auto",
  },
};

export default EditorView;
