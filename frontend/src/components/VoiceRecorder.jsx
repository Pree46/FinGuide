import React, { useState } from "react";
import { exportWAV } from '../utils/audioUtils';
import axios from "axios";
import { styles } from "../styles/advisorStyles"; 

const VoiceRecorder = ({ 
    isRecording, 
    setIsRecording, 
    setResponse, 
    setAudioUrl, 
    setTranscribedText, 
    setIsLoading,
    setRefreshKey
}) => {
    const [mediaRecorder, setMediaRecorder] = useState(null); // Fix: Added mediaRecorder state

    const startRecording = async () => {
        if (isRecording) {
            mediaRecorder.stop();
            setIsRecording(false);
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm',
            });
            setMediaRecorder(recorder);
            
            const chunks = [];
            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = async () => handleStopRecording(chunks);
            
            recorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error("Microphone error:", error);
            alert("Microphone access denied or unavailable.");
        }
    };

    const handleStopRecording = async (chunks) => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const fileReader = new FileReader();

        fileReader.onload = async (e) => {
            try {
                const audioBuffer = await audioContext.decodeAudioData(e.target.result);
                const wavBlob = await exportWAV(audioBuffer, audioContext.sampleRate);
                await sendAudioToServer(wavBlob);
                setRefreshKey(prev => prev + 1);

            } catch (err) {
                console.error("Audio processing error:", err);
                setResponse("Error: Failed to process audio");
                setIsLoading(false);
            }
        };

        fileReader.readAsArrayBuffer(blob);
    };

    const sendAudioToServer = async (wavBlob) => {
    const formData = new FormData();
    formData.append("audio", wavBlob, "recording.wav");

    setIsLoading(true);
    setResponse("");
    setAudioUrl("");
    setTranscribedText("");

    try {
        const res = await axios.post("http://127.0.0.1:5000/speech", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        setTranscribedText(res.data.transcribed_text || "No transcription.");
        setResponse(res.data.response_text || "No response.");

        if (res.data.audio_response_url) {
            // ✅ Don't auto-play here
            setAudioUrl(res.data.audio_response_url);
        }
    } catch (err) {
        setResponse("Error: " + (err.response?.data?.error || err.message));
    } finally {
        setIsLoading(false);
    }
};


    return (
        <button 
            onClick={startRecording} 
            style={{...styles.button, backgroundColor: isRecording ? '#dc3545' : '#2e5aac'}}
        >
            {isRecording ? "⏹ Stop Recording" : "🎤 Speak"}
        </button>
    );
};

export default VoiceRecorder;