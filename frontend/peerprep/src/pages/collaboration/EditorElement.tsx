import React, { useEffect, useState, useMemo, useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { langs } from "@uiw/codemirror-extensions-langs";
import { basicSetup } from "@uiw/codemirror-extensions-basic-setup";
import { indentUnit } from "@codemirror/language";
import { type Socket } from "socket.io-client";
import { getDocument, peerExtension } from "./collabController";
import { Button } from "@chakra-ui/react";
import axios from "axios";
import GeminiChat from './GeminiChat';

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

const languageMap: { [key: string]: number } = {
  javascript: 63,
  python: 71,
  c: 50,
  java: 62,
};

// Define a type for the selected language based on the keys of langs
type LanguageKey = keyof typeof langs;

const EditorElement: React.FC<Props> = ({
  socket,
  className,
  onCodeChange,
}) => {
  const [connected, setConnected] = useState(false);
  const [version, setVersion] = useState<number | null>(null);
  const [doc, setDoc] = useState<string | null>(null);
  const [language, setLanguage] = useState<LanguageKey>("javascript"); // Default language
  const [compiledResult, setCompiledResult] = useState<{
    [key: string]: string;
  }>({
    status: "loading",
    result: "",
  });
  const [isCompiling, setIsCompiling] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const { version, doc } = await getDocument(socket);
        setVersion(version);
        const docString = doc.toString();
        setDoc(docString);
        if (docString !== "Start document") {
          onCodeChange(docString);
        }
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
  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setLanguage(event.target.value as LanguageKey); // Update the selected language
  };

  const submitCode = async () => {
    setIsCompiling(true);
    try {
      const options = {
        method: "POST",
        url: "https://judge0-ce.p.rapidapi.com/submissions",
        params: { base64_encoded: "false", wait: "true" },
        headers: {
          "x-rapidapi-key":
            "6d265e20b0msh1474962ac51153cp18c2f2jsnceac66730339",
          "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
          "Content-Type": "application/json",
        },
        data: {
          language_id: languageMap[language.toString()],
          source_code: doc?.toString(),
        },
      };
      try {
        const response = await axios.request(options);
        console.log(response.data);
        if (response.data.stdout) {
          setCompiledResult({
            status: "success",
            result: response.data.stdout,
          });
        } else {
          setCompiledResult({
            status: "error",
            result: response.data.stderr,
          });
        }
      } catch (error) {
        console.error(error);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsCompiling(false);
    }
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
      <div>
        <div style={{ marginBottom: "10px" }}>
          <label
            htmlFor="language-select"
            style={{ marginRight: "10px", color: "#fff" }}
          >
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
      <div className="space-y-2 pt-4">
        <div className="flex justify-center">
          <Button
            isLoading={isCompiling}
            colorScheme={"green"}
            onClick={() => submitCode()}
          >
            Submit code
          </Button>
        </div>
        {compiledResult.status !== "loading" &&
          (compiledResult.status === "success" ? (
            <div className="flex flex-col space-y-2">
              <div className="font-bold">Compiled Result:</div>
              <pre className="bg-gray-700 rounded-md p-2">
                {compiledResult.result}
              </pre>
            </div>
          ) : (
            <div className="flex flex-col space-y-2">
              <div className="font-bold">Compilation Error:</div>
              <pre className="bg-gray-700 rounded-md p-2">
                {compiledResult.result}
              </pre>
            </div>
          ))}
      </div>
      {/* GeminiChat Component */}
      <div style={{ marginTop: "20px" }}>
        <GeminiChat socket={socket} doc={doc} />
      </div>
    </div>
  ) : (
    <span>Loading...</span>
  );
};

export default EditorElement;
