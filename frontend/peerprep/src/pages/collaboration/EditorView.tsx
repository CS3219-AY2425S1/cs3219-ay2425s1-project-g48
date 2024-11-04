import React, { useState, useRef, useEffect, useContext } from "react";
import { io, Socket } from "socket.io-client";
import { UserContext } from "../../context/UserContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuesApiContext } from "../../context/ApiContext";
import { Question } from "../question/questionModel";
import EditorElement from "./EditorElement";
import ChatBox from "./ChatBox";

const EditorView: React.FC = () => {
  const navigate = useNavigate();
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");
  const [socketId, setSocketId] = useState<string | undefined>("");
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const userContext = useContext(UserContext);
  const user = userContext?.user;

  const [searchParams] = useSearchParams();
  const topic = searchParams.get("topic");
  const difficulty = searchParams.get("difficulty");
  const [question, setQuestion] = useState<Question | null>(null);
  const api = useQuesApiContext();

  const roomId = searchParams.get("room");
  const questionId = searchParams.get("questionId");

  useEffect(() => {
    const disconnected = sessionStorage.getItem("disconnected");

    if (disconnected === "true" || roomId === null || roomId === "" || !questionId){
      navigate("/dashboard");
      return;
    }
    
    fetchQuestion();
    socketRef.current = io("http://localhost:3004/", {
      path: "/api",
      query: { roomId },
    });
    const socket = socketRef.current;

    if (socket === null) return;

    socket.on("connect", () => {
      setSocketId(socket.id);
    });

    socket.on("testMessage", (data) => {
      console.log("Test message from backend:", data.message); // This should log if the connection is working
    });


    // socket.on("assignSocketId", (data: { socketId: string }) => {
    //   setSocketId(data.socketId);
    //   setMessages((prevMessages) => [
    //     ...prevMessages,
    //     `You are assigned to: ${data.socketId}`,
    //   ]);
    // });
    

    return () => {
      if (socketRef.current !== null) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const fetchQuestion = async () => {
    try {
      const response = await api.get(`/questionsById?id=${questionId}`);
      setQuestion(response.data.questions[0]);
      console.log(response.data.questions[0]);
    } catch (error) {
      console.error("Error fetching question:", error);
    }
  };

  const disconnectAndGoBack = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    sessionStorage.setItem("disconnected", "true");
    sessionStorage.removeItem('reconnectUrl');
    navigate("/dashboard");
  };

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

      {/* Question Section */}
      {question && (
        <div style={styles.questionSection} className="editor-scrollbar">
          <h2 style={styles.questionTitle}>{question.Title}</h2>
          
          <div style={styles.questionDetail}>
            <p><strong>Complexity:</strong> {question.Complexity}</p>
          </div>

          <h3 style={styles.questionSubheading}>Description:</h3>
          <div style={styles.questionDetail} dangerouslySetInnerHTML={{ __html: question.Description }} />

          <h3 style={styles.questionSubheading}>Categories:</h3>
          <p style={styles.questionDetail}>{question.Categories.join(", ")}</p>

          <a href={question.Link} target="_blank" rel="noopener noreferrer" style={styles.leetCodeLink}>
            View on LeetCode
          </a>
        </div>
      )}

      {/* Editor and Chat Section */}
      <div style={styles.rightSection}>
        <div style={styles.topRight}>
          {/* Video Section */}
          <div style={styles.videoContainer}>
            <div style={styles.videoPlaceholder}>Video Placeholder</div>
          </div>

          {/* Chat Section */}
          
            <ChatBox roomId={roomId} user={user} />
          
        </div>

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
  questionSection: {
    width: "30%",
    padding: "20px",
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
    flex: "0 0 50%", // Allocating 50% height for the editor container
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
