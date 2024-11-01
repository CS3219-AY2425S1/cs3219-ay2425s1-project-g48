import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";

import React, { useEffect, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import { useSearchParams } from "react-router-dom";

const EditorView: React.FC = () => {
  const ydoc = useMemo(() => new Y.Doc(), []);
  const [editor, setEditor] = useState<any | null>(null);
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [binding, setBinding] = useState<MonacoBinding | null>(null);

  const [searchParams] = useSearchParams();
  const room = searchParams.get("room");

  console.log("room", room);

  // this effect manages the lifetime of the Yjs document and the provider
  useEffect(() => {
    const provider = new WebsocketProvider(
      "ws://localhost:1234",
      room === null ? "" : room,
      ydoc
    );
    setProvider(provider);
    return () => {
      provider?.destroy();
      ydoc.destroy();
    };
  }, [ydoc]);

  // this effect manages the lifetime of the editor binding
  useEffect(() => {
    if (provider == null || editor == null) {
      return;
    }
    console.log("reached", provider);
    const binding = new MonacoBinding(
      ydoc.getText(),
      editor.getModel()!,
      new Set([editor]),
      provider?.awareness
    );
    setBinding(binding);
    return () => {
      binding.destroy();
    };
  }, [ydoc, provider, editor]);

  return (
    <Editor
      height="60vh"
      defaultValue="// some comment"
      defaultLanguage="javascript"
      onMount={(editor) => {
        setEditor(editor);
      }}
    />
  );
};

export default EditorView;
