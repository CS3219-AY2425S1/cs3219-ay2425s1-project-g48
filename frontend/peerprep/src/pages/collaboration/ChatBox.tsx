import React, { useState, useRef, useEffect } from "react";
import { io, Socket } from "socket.io-client";

const socketUrl = "http://localhost:8081"; // Chat service port

interface ChatBoxProps {
  roomId: string | null;
  user: { username: string } | null;
}

const ChatBox: React.FC<ChatBoxProps> = ({ roomId, user }) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");
  const [socketId, setSocketId] = useState<string | undefined>("");
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null); // Ref to store the socket instance

  useEffect(() => {
    // Initialize the socket connection once
    socketRef.current = io(socketUrl);

    socketRef.current.on("connect", () => {
      setSocketId(socketRef.current?.id);
    });

    // Listen for messages from the server
    socketRef.current.on("receiveMessage", (data: { username: string; message: string }) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        `${data.username}: ${data.message}`,
      ]);
      if (chatBoxRef.current) {
        chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
      }
    });

    // Clean up the socket connection when the component unmounts
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (message.trim() && socketRef.current) {
      // Emit the message to the chat service
      socketRef.current.emit("sendMessage", {
        room: roomId,
        message,
        username: user?.username,
      });
      setMessages((prevMessages) => [...prevMessages, `You: ${message}`]);
      setMessage("");
    }
  };

  return (
    <div>
      {/* Chat UI */}
      <div ref={chatBoxRef} style={{ maxHeight: "300px", overflowY: "auto" }}>
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Message"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatBox;
