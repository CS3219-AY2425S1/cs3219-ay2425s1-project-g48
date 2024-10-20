import React, { useState, useRef, useEffect, useContext } from "react";
import { io, Socket } from "socket.io-client";
import { UserContext } from "../../context/UserContext";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Collaboration: React.FC = () => {
  const navigate = useNavigate();
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");
  const [room, setRoom] = useState<string>(""); // Room name is set automatically after matching
  const [socketId, setSocketId] = useState<string | undefined>(""); // Allow undefined
  const [isMatched, setIsMatched] = useState<boolean>(false); // Tracks if the user is matched to a room
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const userContext = useContext(UserContext);
  const user = userContext?.user;

  const [searchParams] = useSearchParams();
  const topic = searchParams.get("topic");
  const difficulty = searchParams.get("difficulty");

  // initialize socket upon component mount
  useEffect(() => {
    if (
      topic === null ||
      difficulty === null ||
      topic === "" ||
      difficulty === ""
    ) {
      navigate("/dashboard");
      return;
    }

    socketRef.current = io("http://localhost:3000/");
    const socket = socketRef.current;

    if (socket === null) {
      return;
    }

    // upon successful connection, join the queue
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id); // Log socket ID
      setSocketId(socket.id); // Set the socket ID state

      socket.emit("joinQueue", {
        username: user?.username,
        topic: topic,
        difficulty: difficulty,
      });
    });

    // Listen for the matched event from the backend
    socket.on("matched", (data: { message: string; room: string }) => {
      console.log("Success:", data.message);
      console.log(`Matched and assigned to room: ${data.room}`);
      setRoom(data.room); // Set the room name received from the backend
      setIsMatched(true); // Set matched state to true
    });

    socket.on("queueEntered", (data: { message: string }) => {
      console.log("queue entered", data);
    });

    socket.on("matchFailed", (data: { error: string }) => {
      console.log("Match failed:", data.error);
    });

    socket.on("assignSocketId", (data: { socketId: string }) => {
      console.log("Socket ID assigned:", data.socketId); // Log when the socket ID is assigned
      setSocketId(data.socketId); // Set the socket ID from the server
      setMessages((prevMessages) => [
        ...prevMessages,
        `You are assigned to: ${data.socketId}`, // Add to messages
      ]);
    });

    socket.on("message", (data: string) => {
      setMessages((prevMessages) => [...prevMessages, data]);
      if (chatBoxRef.current) {
        chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight; // Scroll to the bottom
      }
    });

    socket.on(
      "receiveMessage",
      (data: { username: string; message: string }) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          `${data.username}: ${data.message}`,
        ]);
        if (chatBoxRef.current) {
          chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
      }
    );
    return () => {
      if (socketRef.current !== null) {
        console.log("disconnecting socket...");
        socketRef.current.disconnect();
      }
    };
  }, []); // Ensure the effect runs when room or socketId changes

  const sendMessage = () => {
    if (message.trim() && socketRef && isMatched) {
      // Send the message to the server with the room info
      socketRef.current?.emit("sendMessage", {
        room: room,
        message: message,
        username: user?.username,
      });
      // Show the message in the local UI
      setMessages((prevMessages) => [...prevMessages, `You: ${message}`]);
      setMessage(""); // Clear the input after sending
    }
    console.log(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="chat-container" style={styles.chatContainer}>
      <div className="chat-box" ref={chatBoxRef} style={styles.chatBox}>
        {messages.map((msg, index) => (
          <div key={index} style={styles.message}>
            {msg}
          </div>
        ))}
      </div>

      <div className="socket-id-display" style={styles.socketIdDisplay}>
        {socketId && <div>Your Socket ID: {socketId}</div>}{" "}
        {/* Display the socket ID */}
      </div>

      <div className="chat-input" style={styles.chatInput}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Message"
          style={styles.input}
        />
        <button onClick={sendMessage} style={styles.sendButton}>
          Send
        </button>
      </div>
    </div>
  );
};

// Inline styles for the component
const styles = {
  chatContainer: {
    width: "300px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    backgroundColor: "white",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
  },
  chatBox: {
    height: "200px",
    padding: "10px",
    borderBottom: "1px solid #ccc",
    overflowY: "auto" as "auto",
    backgroundColor: "#fafafa",
  },
  message: {
    color: "black",
  },
  socketIdDisplay: {
    padding: "10px",
    backgroundColor: "#e9ecef",
    textAlign: "center" as "center",
    color: "blue",
  },
  chatInput: {
    display: "flex",
    padding: "10px",
  },
  input: {
    width: "100%",
    padding: "8px",
    marginRight: "5px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    outline: "none",
    color: "black",
  },
  sendButton: {
    padding: "8px 12px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default Collaboration;