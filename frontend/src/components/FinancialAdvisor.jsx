import React, { useState } from "react";
import axios from "axios";
import VoiceRecorder from "./VoiceRecorder";
import AudioPlayer from "./AudioPlayer";
import ChatHistory from "./ChatHistory";
import MarkdownRenderer from "./MarkdownRenderer";
import { styles } from "../styles/advisorStyles";

const FinancialAdvisor = () => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTextSubmit = async () => {
    if (!prompt.trim()) return alert("Please enter your question.");
    setIsLoading(true);
    setResponse("");
    setAudioUrl(null);

    try {
      const res = await axios.post("http://127.0.0.1:5000/generate", { prompt });
      setResponse(res.data.response || "No response received.");
    } catch (err) {
      setResponse("Error: " + err.message);
    } finally {
      setIsLoading(false);
      setRefreshKey((prev) => prev + 1);
      setPrompt("");
    }
  };

  return (
    <div style={styles.appContainer}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>💼 FinGuide</h1>
        <p style={styles.headerSubtitle}>Your AI Financial Advisor</p>
      </header>

      {/* Chat Area */}
      <div style={styles.chatContainer}>
        <ChatHistory refreshKey={refreshKey} />

        {/* Live Response */}
        {isLoading && <p style={styles.loading}>⏳ Thinking...</p>}
        {response && (
          <div style={{ ...styles.messageBubble, ...styles.aiBubble }}>
            <MarkdownRenderer text={response} />
            {audioUrl && <AudioPlayer key={audioUrl} audioUrl={audioUrl} />}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div style={styles.inputBar}>
        <textarea
          placeholder="Type your question..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={styles.textInput}
        />

        <button onClick={handleTextSubmit} style={styles.sendButton}>
          💬
        </button>

        <VoiceRecorder
          isRecording={isRecording}
          setIsRecording={setIsRecording}
          setResponse={setResponse}
          setAudioUrl={setAudioUrl}
          setTranscribedText={setTranscribedText}
          setIsLoading={setIsLoading}
          setRefreshKey={setRefreshKey}
        />
      </div>
    </div>
  );
};

export default FinancialAdvisor;
