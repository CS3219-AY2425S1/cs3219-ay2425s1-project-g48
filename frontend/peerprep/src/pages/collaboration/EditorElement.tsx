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
};

const EditorElement: React.FC<Props> = ({ socket, className }) => {
  const [connected, setConnected] = useState(false);
  const [version, setVersion] = useState<number | null>(null);
  const [doc, setDoc] = useState<string | null>(null);

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
      <CodeMirror
        className={`flex-1 text-left ${className} text-white`}
        height="100%"
        basicSetup={false}
        id="codeEditor" // Ensure this ID is set for styling
        theme="dark" // Dark mode set permanently
        extensions={[
          indentUnit.of("\t"),
          basicSetup(),
          langs.c(),
          plugin,
          // peerExtension(socket, version),
        ]}
        value={doc}
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