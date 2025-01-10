import React, { useState, useEffect, useRef } from "react";
import { Editor } from "@monaco-editor/react";
import "./CodeCompiler.css";

const CodeCompiler = () => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const wsRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    // Initialize WebSocket connection
    wsRef.current = new WebSocket(
      "wss://compiler.skillshikshya.com/ws/compiler/"
    );

    wsRef.current.onopen = () => {
      console.log("WebSocket connection established");
    };

    // WebSocket message handler
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "stdout") {
        setOutput((prevOutput) => prevOutput + data.data);
      } else if (data.type === "input") {
        // If you need to handle "input" type message, implement here
        console.log("Received input message:", data.input_data);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket Error: ", error);
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket connection closed");
    };

    // Clean up WebSocket connection on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const handleRunCode = () => {
    const payload = {
      command: "run",
      code: code,
      language: language,
      input: code,
    };

    wsRef.current.send(JSON.stringify(payload));

    wsRef.current.onmessage = (message) => {
      const data = JSON.parse(message.data);
      if (data.type === "stdout") {
        console.log(data);

        setOutput((prev) => prev + data?.data);
      }
    };
  };

  const handleStopCode = () => {
    if (wsRef.current) {
      const payload = { command: "stop" };
      wsRef.current.send(JSON.stringify(payload));
    }
  };

  return (
    <div className="code-editor-container">
    
        <h2>Code Editor</h2>
        <div className="editor-controls">
         
            <select
              className="select-container "
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="php">PHP</option>
              <option value="java">Java</option>
            </select>
          <div>
            <button
              onClick={handleRunCode}
              disabled={wsRef?.current?.readyState !== 1}
            >
              {wsRef?.current?.readyState === 1 ? "Run Code" : "Connecting"}
            </button>
            <button onClick={handleStopCode}>Stop Code</button>
          </div>
        </div>
        <div className="playground">
        <div className="editor-container ">
          <Editor
            forwardRef={editorRef}
            height="70vh"
            theme="vs-dark"
            defaultValue="//code here"
            onChange={(value) => setCode(value)}
            value={code}
          />
        </div>
        <div className="output-container ">
          <span>Output:</span>
          <div
            className="output-box"
          >
            {output}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeCompiler;
