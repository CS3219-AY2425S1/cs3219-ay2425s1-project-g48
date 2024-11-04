import React, { useEffect, useState, useMemo, useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { langs } from "@uiw/codemirror-extensions-langs";
import { basicSetup } from "@uiw/codemirror-extensions-basic-setup";
import { indentUnit } from "@codemirror/language";
import { type Socket } from "socket.io-client";
import { getDocument, peerExtension } from "./collabController";

type Props = {
  socket: Socket;
  className?: string;
  onCodeChange: (code: string) => void;
};

// Language options array with labels and corresponding language values from the 'langs' object
const languageOptions = [
  { label: "JavaScript", value: "javascript" },
  { label: "Python", value: "python" },
  { label: "C", value: "c" },
  { label: "Java", value: "java" },
] as const; // Use 'as const' for type inference

// Define a type for the selected language based on the keys of langs
type LanguageKey = keyof typeof langs;

const EditorElement: React.FC<Props> = ({ socket, className, onCodeChange}) => {
  const [connected, setConnected] = useState(false);
  const [version, setVersion] = useState<number | null>(null);
  const [doc, setDoc] = useState<string | null>(null);
  const [language, setLanguage] = useState<LanguageKey>("javascript"); // Default language
  
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const { version, doc } = await getDocument(socket);
        setVersion(version);
        setDoc(doc.toString());
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };
    fetchDocument();

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [socket]);

  // use Memo to prevent the plugin from being reinstantiated upon rerender
  const plugin = useMemo(
    () => peerExtension(socket, version || 0),
    [socket, version]
  );

  // Handler for when the code in the editor changes
  const handleCodeChange = (value: string) => {
    onCodeChange(value);
    setDoc(value);
  };

  // Handler for language selection
  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(event.target.value as LanguageKey); // Update the selected language
  };

  return version !== null && doc !== null ? (
    <div
      style={{
        height: "100%",
        fontSize: "18px", // Adjust font size here
        overflow: "hidden", // This ensures the container doesn't scroll, only CodeMirror does
      }}
    >
      <style>
        {`
          /* Dark scrollbar styling for CodeMirror */
          #codeEditor .cm-scroller {
            overflow: auto !important; /* Ensure scroll is enabled */
            height: 100%; /* Fill the available height */
          }

          #codeEditor .cm-scroller::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }

          #codeEditor .cm-scroller::-webkit-scrollbar-track {
            background: #2e2e3e;
          }

          #codeEditor .cm-scroller::-webkit-scrollbar-thumb {
            background-color: #555;
            border-radius: 4px;
          }

          #codeEditor .cm-scroller::-webkit-scrollbar-thumb:hover {
            background-color: #777;
          }
        `}
      </style>

      {/* Language Selection Dropdown */}
      <div style={{ marginBottom: "10px" }}>
        <label htmlFor="language-select" style={{ marginRight: "10px", color: "#fff" }}>
          Select Language:
        </label>
        <select
          id="language-select"
          value={language}
          onChange={handleLanguageChange}
          style={{
            padding: "5px",
            backgroundColor: "#2e2e3e",
            color: "#fff",
            border: "1px solid #555",
            borderRadius: "4px",
          }}
        >
          {languageOptions.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      <CodeMirror
        className={`flex-1 text-left ${className} text-white`}
        height="100%"
        basicSetup={false}
        id="codeEditor" // Ensure this ID is set for styling
        theme="dark" // Dark mode set permanently
        extensions={[
          indentUnit.of("\t"),
          basicSetup(),
          langs[language](),
          plugin,
          // peerExtension(socket, version),
        ]}
        value={doc}
        onChange={handleCodeChange} // Capture changes to the code
        style={{
          height: "100%", // Fill available space within parent
        }}
      />
    </div>
  ) : (
    <span>Loading...</span>
  );
};

export default EditorElement;