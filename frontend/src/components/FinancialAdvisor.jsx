import React, { useState } from "react";
import axios from "axios";
import VoiceRecorder from "./VoiceRecorder";
import AudioPlayer from "./AudioPlayer";
import { styles } from "../styles/advisorStyles"; // Fix: Changed from ./styles to ../styles
// ...existing code...

const FinancialAdvisor = () => {
    const [prompt, setPrompt] = useState("");
    const [response, setResponse] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [transcribedText, setTranscribedText] = useState("");

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
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>💼 FinGuide – AI Financial Advisor</h1>

            <textarea
                placeholder="Ask your financial question..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                style={styles.textarea}
            />

            <div style={styles.buttonRow}>
                <button onClick={handleTextSubmit} style={styles.button}>
                    💬 Ask Advisor
                </button>
                <VoiceRecorder
                    isRecording={isRecording}
                    setIsRecording={setIsRecording}
                    setResponse={setResponse}
                    setAudioUrl={setAudioUrl}
                    setTranscribedText={setTranscribedText}
                    setIsLoading={setIsLoading}
                />
            </div>

            {isLoading && <p style={styles.loading}>⏳ Thinking...</p>}
            {transcribedText && (
                <div>
                    <h3>You said:</h3>
                    <p>{transcribedText}</p>
                </div>
            )}
            <h3 style={styles.responseTitle}>Response:</h3>
            <div style={styles.responseBox}>{response}</div>

            {audioUrl && <AudioPlayer audioUrl={audioUrl} />}
        </div>
    );
};

export default FinancialAdvisor;