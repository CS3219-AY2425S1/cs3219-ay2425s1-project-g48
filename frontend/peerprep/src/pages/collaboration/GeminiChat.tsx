import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { type Socket } from "socket.io-client";

const GeminiChat: React.FC<{ socket: Socket, doc: string }> = ({ socket, doc }) => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<{ user: string, ai: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [includeDoc, setIncludeDoc] = useState(true);

    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInput(event.target.value);
    };

    const handleSend = async () => {
        if (!input.trim()) return;
       
        setMessages(prev => [...prev, { user: input, ai: "" }]);
        setLoading(true);

        try {
            const combinedInput = includeDoc ? `${doc}\n${input}` : input;
            const result = await model.generateContent(combinedInput);
            const aiResponse = result.response.text();
           
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].ai = aiResponse;
                return newMessages;
            });
        } catch (error) {
            console.error("Error generating AI response:", error);
        } finally {
            setLoading(false);
            setInput('');
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSend();
        }
    };

    const toggleDoc = () => {
        setIncludeDoc(prev => !prev);
    };

    return (
        <div style={styles.chatBoxContainer}>
            <div style={styles.messagesContainer}>
                {messages.map((msg, index) => (
                    <div key={index} style={styles.messageContainer}>
                        <div style={styles.userMessage}><strong>You:</strong> {msg.user}</div>
                        {msg.ai && <div style={styles.aiMessage}><strong>AI:</strong> {msg.ai}</div>}
                    </div>
                ))}
                {loading && <div style={styles.loadingMessage}>Loading...</div>}
            </div>

            <div style={styles.inputContainer}>
                <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    style={styles.input}
                    placeholder="Type your message..."
                />
                <button onClick={handleSend} style={styles.sendButton}>Send</button>
                
                {/* Custom Toggle Switch */}
                <div style={styles.toggleSwitch} onClick={toggleDoc}>
                    <div style={{
                        ...styles.toggleOption,
                        ...(includeDoc ? styles.activeOption : {}),
                        borderRadius: "20px 0 0 20px"
                    }}>
                        with code
                    </div>
                    <div style={{
                        ...styles.toggleOption,
                        ...(!includeDoc ? styles.activeOption : {}),
                        borderRadius: "0 20px 20px 0"
                    }}>
                        no code
                    </div>
                    <div style={{
                        ...styles.slider,
                        transform: includeDoc ? 'translateX(0)' : 'translateX(100%)',
                    }} />
                </div>
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
        height: "50vh",
        color: "#ffffff",
    },
    messagesContainer: {
        flex: 1,
        overflowY: "auto" as const,
        padding: "10px",
        backgroundColor: "#1e1e2e",
        borderRadius: "8px",
        maxHeight: "400px",
        marginBottom: "10px",
    },
    messageContainer: {
        marginBottom: "15px",
    },
    userMessage: {
        alignSelf: "flex-end",
        backgroundColor: "#4e8ef7",
        color: "#ffffff",
        padding: "6px 10px",
        borderRadius: "10px",
        maxWidth: "75%",
        fontSize: "0.9rem",
    },
    aiMessage: {
        alignSelf: "flex-start",
        backgroundColor: "#44475a",
        color: "#ffffff",
        padding: "6px 10px",
        borderRadius: "10px",
        maxWidth: "75%",
        fontSize: "0.9rem",
        marginTop: "5px",
    },
    loadingMessage: {
        textAlign: "center" as const,
        color: "#b3b3b3",
        fontStyle: "italic",
    },
    inputContainer: {
        height: "36px",
        display: "flex",
        marginTop: "5px",
        alignItems: "center",
    },
    input: {
        flex: 1,
        width: "60%", 
        height: "36px",
        padding: "6px",
        fontSize: "0.85rem",
        borderRadius: "6px",
        border: "1px solid #444",
        backgroundColor: "#1e1e2e",
        color: "#ffffff",
        marginRight: "5px",
        boxSizing: "border-box" as const,
    },
    sendButton: {
        height: "36px",
        padding: "6px 12px",
        fontSize: "0.85rem",
        borderRadius: "6px",
        border: "none",
        backgroundColor: "#9A78B3",
        color: "#ffffff",
        cursor: "pointer",
        boxSizing: "border-box" as const,
    },
    toggleSwitch: {
        display: "flex",
        position: "relative" as const,
        width: "140px",
        height: "36px",
        backgroundColor: "#dce7dc",
        borderRadius: "20px",
        overflow: "hidden",
        cursor: "pointer",
        marginLeft: "10px",
    },
    toggleOption: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.75rem", 
        fontWeight: "500", 
        color: "#333", 
        zIndex: 1,
        padding: "0 5px", 
        transition: "color 0.3s ease",
    },
    activeOption: {
        color: "#ffffff", 
        fontWeight: "bold", 
    },
    slider: {
        position: "absolute" as const,
        top: 0,
        bottom: 0,
        left: 0,
        width: "50%",
        backgroundColor: "#9A78B3", 
        borderRadius: "20px",
        transition: "transform 0.3s ease",
        zIndex: 0,
        boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.2)",
    },
};

export default GeminiChat;
