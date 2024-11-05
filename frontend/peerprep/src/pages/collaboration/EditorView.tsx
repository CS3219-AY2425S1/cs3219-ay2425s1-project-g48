import React, { useState, useRef, useEffect, useContext } from "react";
import { io, Socket } from "socket.io-client";
import { UserContext } from "../../context/UserContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import EditorElement from "./EditorElement";
import QuestionDisplay from "./QuestionDisplay";
import Chat from "./Chat";
import GeminiChat from "./GeminiChat"; 
import { Box } from "@chakra-ui/react";

const EditorView: React.FC = () => {
  const navigate = useNavigate();
  const socketRef = useRef<Socket | null>(null);
  const [socketId, setSocketId] = useState<string | undefined>("");
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const userContext = useContext(UserContext);
  const user = userContext?.user;

  const [searchParams] = useSearchParams();

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

    socketRef.current = io("http://localhost:3004/", {
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

  const disconnectAndGoBack = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    sessionStorage.setItem("disconnected", "true");
    sessionStorage.removeItem("reconnectUrl");
    navigate("/dashboard");
  };

  console.log(socketRef.current);

  return (
    <div style={styles.container}>
      {/* Inline CSS for dark scrollbars */}
      <style>
        {`
          /* Custom dark scrollbar styling */
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
          /* Firefox-specific scrollbar styling */
          .editor-scrollbar {
            scrollbar-color: #444 #2e2e3e;
            scrollbar-width: thin;
          }
        `}
      </style>
      <Box style={styles.leftSection}>
        {/* Question Section */}
        
        {/* Question Section */}
        <QuestionDisplay questionId={questionId} styles={styles} />
        {/* GeminiChat Section */}
        <GeminiChat socketRef={socketRef} />
      </Box>
  
      {/* Editor and Chat Section */}
      <div style={styles.rightSection}>
        <Chat
          socketRef={socketRef}
          // socketId={socketId}
          styles={styles}
          chatBoxRef={chatBoxRef}
        />
        {/* Editor Section */}
        <div style={styles.editorContainer} className="editor-scrollbar">
          {socketRef.current && <EditorElement socket={socketRef.current} />}
        </div>
        <div style={styles.disconnectButtonContainer}>
          <button onClick={disconnectAndGoBack} style={styles.disconnectButton}>
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  leftSection: {
    display: "flex",
    flexDirection: "column" as const,
    width: "30%",
    padding: "20px",
  },
  questionSection: {
    color: "#ffffff",
    overflowY: "auto",
    backgroundColor: "#2e2e3e",
    borderRadius: "8px",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
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

  container: {
    display: "flex",
    height: "100vh",
    backgroundColor: "#1e1e2e",
  },

  rightSection: {
    display: "flex",
    flexDirection: "column" as const,
    width: "70%",
    padding: "10px",
    overflow: "auto", // Prevent right section overflow
  },
  topRight: {
    display: "flex",
    flex: "0 0 50%", // Allocating 50% height to video and chat
    marginBottom: "10px",
  },
  videoContainer: {
    flex: 1,
    marginRight: "10px",
    border: "1px solid #333",
    borderRadius: "8px",
    backgroundColor: "#2e2e3e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  videoPlaceholder: {
    color: "#ffffff",
    fontSize: "18px",
    textAlign: "center",
  },
  chatContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    padding: "10px",
    border: "1px solid #333",
    borderRadius: "8px",
    backgroundColor: "#2e2e3e",
    color: "#ffffff",
    overflowY: "auto", // Enable scroll for chat container
  },
  chatBox: {
    flex: 1,
    overflowY: "auto",
    backgroundColor: "#1e1e2e",
    border: "1px solid #444",
    borderRadius: "8px",
    padding: "10px",
    color: "#ffffff",
  },
  socketIdDisplay: {
    padding: "5px",
    backgroundColor: "#333",
    textAlign: "center",
    color: "#70a4a7",
    borderRadius: "8px",
    marginBottom: "10px",
  },
  messageInputContainer: {
    display: "flex",
    alignItems: "center",
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "5px",
    backgroundColor: "#333",
    border: "1px solid #444",
    color: "#ffffff",
    marginRight: "5px",
  },
  sendButton: {
    padding: "8px 12px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  disconnectButtonContainer: {
    marginTop: "10px",
    display: "flex",
    justifyContent: "center",
  },
  disconnectButton: {
    padding: "10px 15px",
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    transition: "background-color 0.3s ease",
  },
  editorContainer: {
    backgroundColor: "#1e1e2e",
    padding: "10px",
    borderRadius: "8px",
    overflowY: "auto", // Enable scroll for editor container
  },
  message: {
    color: "#ffffff",
  },
};

export default EditorView;
