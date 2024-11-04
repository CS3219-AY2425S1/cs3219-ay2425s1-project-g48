import React, { useState } from "react";
import { io, Socket } from "socket.io-client";

const socketUrl = "http://localhost:8081"; // Chat service port

interface ChatBoxProps {
  roomId: string | null;
  user: { username: string } | null;
}

const Chat = ({ socketRef, styles, chatBoxRef }) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");

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

  return (
    <div style={styles.topRight}>
      {/* Video Section */}
      <div style={styles.videoContainer}>
        <div style={styles.videoPlaceholder}>Video Placeholder</div>
      </div>

      {/* Chat Section */}
      <div style={styles.chatContainer} className="editor-scrollbar">
        <div
          ref={chatBoxRef}
          style={styles.chatBox}
          className="editor-scrollbar"
        >
          {messages.map((msg, index) => (
            <div key={index} style={styles.message}>
              {msg}
            </div>
          ))}
        </div>
        <div style={styles.socketIdDisplay}>
          {/* {socketId && <div>Your Socket ID: {socketId}</div>} */}
        </div>
        <div style={styles.messageInputContainer}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message"
            style={styles.input}
          />
          <button onClick={sendMessage} style={styles.sendButton}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
