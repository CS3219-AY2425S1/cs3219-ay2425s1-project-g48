import React, { useState, useRef } from 'react';

const ChatUI: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState<string>('');
  const [room, setRoom] = useState<string>('');
  const chatBoxRef = useRef<HTMLDivElement>(null);

  const sendMessage = () => {
    if (message.trim()) {
      setMessages((prevMessages) => [...prevMessages, `You: ${message}`]);
      setMessage('');
      if (chatBoxRef.current) {
        chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
      }
    }
  };

  const joinRoom = () => {
    if (room.trim()) {
      setMessages((prevMessages) => [...prevMessages, `You joined Room: ${room}`]);
      setRoom('');
    }
  };

  const joinQueue = () => {
    // Here you can add your logic to join the queue
    console.log('Joining queue...');
    // Optionally, send a socket event to the backend to join the queue
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="chat-container" style={styles.chatContainer}>
      <div className="chat-box" ref={chatBoxRef} style={styles.chatBox}>
        {messages.map((msg, index) => (
          <div key={index} style={styles.message}>{msg}</div>
        ))}
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

      <div className="room-input" style={styles.roomInput}>
        <input
          type="text"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="Room"
          style={styles.input}
        />
        <button onClick={joinRoom} style={styles.joinButton}>
          Join
        </button>
      </div>

      {/* Add a Join Queue button */}
      <div className="queue-input" style={styles.queueInput}>
        <button onClick={joinQueue} style={styles.queueButton}>
          Join Queue
        </button>
      </div>
    </div>
  );
};

// Inline styles for the component
const styles = {
  chatContainer: {
    width: '300px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    backgroundColor: 'white',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
  },
  chatBox: {
    height: '200px',
    padding: '10px',
    borderBottom: '1px solid #ccc',
    overflowY: 'auto' as 'auto',
    backgroundColor: '#fafafa',
  },
  message: {
    color: 'black',
  },
  chatInput: {
    display: 'flex',
    padding: '10px',
  },
  roomInput: {
    display: 'flex',
    padding: '10px',
  },
  queueInput: {
    display: 'flex',
    padding: '10px',
  },
  input: {
    width: '100%',
    padding: '8px',
    marginRight: '5px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    outline: 'none',
    color: 'black',
  },
  sendButton: {
    padding: '8px 12px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  joinButton: {
    padding: '8px 12px',
    backgroundColor: '#007BFF',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  queueButton: {
    padding: '8px 12px',
    backgroundColor: '#FFA500', // Change color for differentiation
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default ChatUI;
