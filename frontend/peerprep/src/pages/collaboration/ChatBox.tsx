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
  const [messages, setMessages] = useState<string[]>([
    "Start chatting to find out who you are paired with!"
  ]);
  const [message, setMessage] = useState<string>("");
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
      socketRef.current.off("newConnection");

      socketRef.current.on("newConnection", (data: { userId: string }) => {
        setMessages((prevMessages) => [...prevMessages, "Your partner has connected. Let’s chat!"]);
      });

      socketRef.current.on("connect", () => {
        if (roomId && user?.username) {
          socketRef.current.emit("joinRoom", { roomId, username: user.username });
        }
      });

      socketRef.current.on("userJoined", (data: { username: string }) => {
        if (data.username !== user?.username) {
          setOtherUserName(data.username);
        }
      });

      socketRef.current.on("leaveSession", () => {
        onEndSession(questionRef.current, currentCodeRef.current);
      });

      socketRef.current.on("receiveMessage", (data: { username: string; message: string }) => {
        if (data.username !== user?.username) {
          setMessages((prevMessages) => [...prevMessages, `${data.username}: ${data.message}`]);
          setOtherUserName(data.username);
        }

        if (chatBoxRef.current) {
          chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
      });

      socketRef.current.on("userDisconnected", (data: { userId: string }) => {
        setMessages((prevMessages) => [...prevMessages, "Your partner has disconnected"]);
        setOtherUserName("");
      });

      return () => {
        socketRef.current?.off("userJoined");
        socketRef.current?.off("leaveSession");
        socketRef.current?.off("receiveMessage");
        socketRef.current?.off("userDisconnected");
      };
    }
  }, [roomId, user?.username, onEndSession, socketRef]);

  const sendMessage = () => {
    if (message.trim() && socketRef.current) {
      socketRef.current.emit("sendMessage", {
        room: roomId,
        message,
        username: user?.username,
      });
      setMessages((prevMessages) => [...prevMessages, `You: ${message}`]);
      setMessage("");
    }
  };

  const handleEndSessionClick = () => {
    const confirmExit = window.confirm("Are you sure you want to end the session?");
    if (confirmExit && socketRef.current) {
      socketRef.current.emit("endSession", roomId);
    }
  };

  const renderMessages = () => {
    const notificationMessages = [
      "Your partner has connected. Let’s chat!",
      "Your partner has disconnected",
      "Start chatting to find out who you are paired with!"
    ];
  
    return messages.map((msg, index) => {
      const isNotification = notificationMessages.includes(msg);
      
      return (
        <div
          key={index}
          style={
            isNotification
              ? styles.notificationMessage
              : msg.startsWith("You:")
              ? styles.userMessage
              : styles.receivedMessage
          }
        >
          {msg}
        </div>
      );
    });
  };

  return (
    <div style={styles.chatBoxContainer}>
      <div style={styles.headerRow}>
        <div style={styles.pairedUser}>
          {otherUserName && (
            <>You are currently paired with: <span style={{ fontWeight: "bold", color: "#82AAFF" }}>{otherUserName}</span></>
          )}
        </div>
        <button onClick={handleEndSessionClick} style={styles.endSessionButton}>
          End Session
        </button>
      </div>

      <div ref={chatBoxRef} style={styles.messagesContainer}>
        {renderMessages()}
      </div>

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
    width: "100%", 
    height: "100%", 
    color: "#ffffff",
  },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },

  pairedUser: {
    fontWeight: "normal",
    color: "#b3b3b3",
    fontStyle: "italic",
    flex: 1,  // Allows pairedUser section to take available space
  },

  endSessionButton: {
    padding: "5px 10px",
    borderRadius: "6px",
    border: "none",
    fontSize: "0.85rem",
    backgroundColor: "#FF5555",
    color: "#ffffff",
    cursor: "pointer",
  },

  messagesContainer: {
    flex: 1,
    overflowY: "auto" as const,
    padding: "10px",
    backgroundColor: "#1e1e2e",
    borderRadius: "8px",
    marginBottom: "10px",
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
    height: "36px",  
    display: "flex",
    marginTop: "5px",
  },

  input: {
    flex: 1,
    height: "36px",
    padding: "6px",
    fontSize: "0.85rem",
    borderRadius: "6px",
    border: "1px solid #444",
    backgroundColor: "#1e1e2e",
    color: "#ffffff",
    marginRight: "5px",
    boxSizing: "border-box",
  },

  sendButton: {
    height: "36px",
    padding: "6px 12px",
    fontSize: "0.85rem",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    cursor: "pointer",
    boxSizing: "border-box",
  },

  notificationMessage: {
    color: "#b3b3b3",
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: "5px",
    width: "100%",
    fontSize: "0.9rem",
  },
};

export default ChatBox;
