import React, { useState } from "react";
import axios from "axios";
import { Icon } from "@iconify/react";
import VoiceRecorder from "./VoiceRecorder";
import AudioPlayer from "./AudioPlayer";
import { layoutStyles } from "../styles/chatLayout";

const ChatInput = ({ onSend }) => {
  const [text, setText] = useState("");
  const [response, setResponse] = useState("");
  const [audioUrl, setAudioUrl] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSubmit = async () => {
    if (!text.trim()) return;

    setIsLoading(true);
    setResponse("");
    setAudioUrl(null);

    try {
      const res = await axios.post("http://127.0.0.1:5000/generate", { prompt: text });
      setResponse(res.data.response || "No response received.");
      if (onSend) onSend(text, res.data.response);
    } catch (err) {
      setResponse("Error: " + err.message);
    } finally {
      setIsLoading(false);
      setText("");
      setRefreshKey((prev) => prev + 1);
    }
  };

  return (
    <div style={layoutStyles.inputBar}>
      <textarea
        placeholder="Type or use voice..."
        style={{
          ...layoutStyles.textInput,
          fontFamily: "'Manrope', sans-serif",
        }}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
      />

      <VoiceRecorder
        isRecording={isRecording}
        setIsRecording={setIsRecording}
        setResponse={setResponse}
        setAudioUrl={setAudioUrl}
        setText={setText}
        setIsLoading={setIsLoading}
        setRefreshKey={setRefreshKey}
      />

      <button
        style={{
          background: "linear-gradient(135deg, #2563EB, #1E40AF)",
          border: "none",
          borderRadius: "12px",
          padding: "10px 16px",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
          transition: "all 0.25s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        onClick={handleSubmit}
      >
        <Icon icon="mdi:send" width="22" height="22" color="white" />
      </button>

      {audioUrl && <AudioPlayer key={refreshKey} audioUrl={audioUrl} />}
      {isLoading && <p style={{ marginLeft: "10px" }}>⏳ Thinking...</p>}
    </div>
  );
};

export default ChatInput;
