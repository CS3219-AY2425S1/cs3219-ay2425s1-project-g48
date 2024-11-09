import React, { useState, useRef, useEffect } from "react";
import { Socket } from "socket.io-client";
import { Question } from "../question/questionModel";
import exitIcon from "../../assets/ExitIcon.png";

interface ChatBoxProps {
  roomId: string | null;
  user: { username: string } | null;
  onEndSession: (question: Question | null, currentCode: string) => Promise<void>;
  question: Question | null;
  currentCode: string;
  socketRef: React.RefObject<Socket>;
}

const ChatBox: React.FC<ChatBoxProps> = ({
  roomId,
  user,
  onEndSession,
  question,
  currentCode,
  socketRef,
}) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true); // Start collapsed
  const [isEndSessionExpanded, setIsEndSessionExpanded] = useState<boolean>(false);
  const [otherUserName, setOtherUserName] = useState<string>("");
  const chatBoxRef = useRef<HTMLDivElement>(null);

  const questionRef = useRef<Question | null>(question);
  const currentCodeRef = useRef<string>(currentCode);

  useEffect(() => {
    questionRef.current = question;
    currentCodeRef.current = currentCode;
  }, [question, currentCode]);

  useEffect(() => {
    if (socketRef.current) {
      console.log("Socket connection established:", socketRef.current.connected);
      
      socketRef.current.on("connect", () => {
        console.log("Connected to socket with ID:", socketRef.current?.id);
        
        if (roomId && user?.username) {
          console.log("Joining room:", roomId);
          socketRef.current.emit("joinRoom", { roomId, username: user.username });
        }
      });
  
      socketRef.current.on("userJoined", (data: { username: string }) => {
        console.log("User joined:", data.username);
        
        if (data.username !== user?.username) {
          setOtherUserName(data.username);
        }
      });
  
      socketRef.current.on("leaveSession", () => {
        console.log("Session ended by another user");
        onEndSession(questionRef.current, currentCodeRef.current); 
      });
  
      socketRef.current.on("receiveMessage", (data: { username: string; message: string }) => {
        console.log("Message received:", data);
        
        if (data.username !== user?.username) {
          setMessages((prevMessages) => [...prevMessages, `${data.username}: ${data.message}`]);
          setOtherUserName(data.username);
        }
        
        if (chatBoxRef.current) {
          chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
      });
  
      // Listen for userDisconnected event
      socketRef.current.on("userDisconnected", (data: { userId: string }) => {
        console.log("User disconnected:", data.userId);
        setMessages((prevMessages) => [...prevMessages, "A user has disconnected"]);
      });
  
      // Cleanup on unmount
      return () => {
        console.log("Cleaning up socket listeners...");
        socketRef.current?.off("userJoined");
        socketRef.current?.off("leaveSession");
        socketRef.current?.off("receiveMessage");
        socketRef.current?.off("userDisconnected"); // Clean up this listener as well
      };
    } else {
      console.log("Socket connection not established. Check socketRef.");
    }
  }, [roomId, user?.username, onEndSession, socketRef]);
  

  const sendMessage = () => {
    if (message.trim() && socketRef.current) {
      console.log("Sending message:", message);
      
      socketRef.current.emit("sendMessage", {
        room: roomId,
        message,
        username: user?.username,
      });
      setMessages((prevMessages) => [...prevMessages, `You: ${message}`]);
      setMessage("");
    } else {
      console.log("Cannot send empty message or socket not connected.");
    }
  };

  const handleEndSessionClick = () => {
    if (isEndSessionExpanded) {
      const confirmExit = window.confirm("Are you sure you want to end the session?");
      if (confirmExit && socketRef.current) {
        console.log("Ending session for room:", roomId);
        socketRef.current.emit("endSession", roomId);
      }
    } else {
      setIsEndSessionExpanded(true);
    }
  };

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const renderMessages = () => {
    if (isCollapsed && messages.length > 1) {
      const latestUserMessage = messages.slice().reverse().find((msg) => msg.startsWith("You:"));
      const latestOtherMessage = messages.slice().reverse().find((msg) => !msg.startsWith("You:"));
      return (
        <>
          {latestOtherMessage && (
            <div style={styles.receivedMessage}>{latestOtherMessage}</div>
          )}
          {latestUserMessage && (
            <div style={styles.userMessage}>{latestUserMessage}</div>
          )}
        </>
      );
    }
    return messages.map((msg, index) => (
      <div
        key={index}
        style={msg.startsWith("You:") ? styles.userMessage : styles.receivedMessage}
      >
        {msg}
      </div>
    ));
  };

  return (
    <div style={styles.chatBoxContainer}>
      <div style={styles.buttonContainer}>
        <button style={styles.collapseButton} onClick={toggleCollapse}>
          {isCollapsed ? "Click to chat" : "Collapse Chat"}
        </button>
        <button
          style={isEndSessionExpanded ? styles.expandedEndButton : styles.shortEndButton}
          onClick={handleEndSessionClick}
          onMouseLeave={() => setIsEndSessionExpanded(false)} // Shrinks the button back when mouse leaves
        >
          {isEndSessionExpanded ? "End Session" : <img src={exitIcon} alt="Exit" style={styles.icon} />}
        </button>
      </div>
      <div ref={chatBoxRef} style={styles.messagesContainer}>
        {renderMessages()}
      </div>
      {!isCollapsed && (
        <div style={styles.inputContainer}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            style={styles.input}
          />
          <button onClick={sendMessage} style={styles.sendButton}>
            Send
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  chatBoxContainer: {
    display: "flex",
    flexDirection: "column" as const,
    backgroundColor: "#2e2e3e",
    borderRadius: "8px",
    padding: "10px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
    height: "100%",
    color: "#ffffff",
  },
  buttonContainer: {
    display: "flex",
    width: "100%",
    marginBottom: "10px",
  },
  collapseButton: {
    flex: 2,
    padding: "5px 10px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#4CAF50",
    color: "#ffffff",
    cursor: "pointer",
    marginRight: "5px",
  },
  shortEndButton: {
    width: "30px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#FF5555",
    color: "#ffffff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0",
  },
  expandedEndButton: {
    flex: 1,
    padding: "5px 10px", // Expanded padding for full button
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#FF5555",
    color: "#ffffff",
    cursor: "pointer",
  },
  icon: {
    width: "20px",
    height: "20px",
  },
  messagesContainer: {
    flex: 1,
    overflowY: "auto" as const,
    padding: "10px",
    marginBottom: "10px",
    backgroundColor: "#1e1e2e",
    borderRadius: "8px",
    maxHeight: "300px",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#4e8ef7",
    color: "#ffffff",
    padding: "6px 10px",
    borderRadius: "10px",
    marginBottom: "5px",
    maxWidth: "75%",
    fontSize: "0.9rem",
  },
  receivedMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#44475a",
    color: "#ffffff",
    padding: "6px 10px",
    borderRadius: "10px",
    marginBottom: "5px",
    maxWidth: "75%",
    fontSize: "0.9rem",
  },
  inputContainer: {
    display: "flex",
    marginTop: "5px",
  },
  input: {
    flex: 1,
    padding: "6px",
    fontSize: "0.85rem",
    borderRadius: "6px",
    border: "1px solid #444",
    backgroundColor: "#1e1e2e",
    color: "#ffffff",
    marginRight: "5px",
  },
  sendButton: {
    padding: "6px 12px",
    fontSize: "0.85rem",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#4CAF50",
    color: "#ffffff",
    cursor: "pointer",
  },
};

export default ChatBox;
