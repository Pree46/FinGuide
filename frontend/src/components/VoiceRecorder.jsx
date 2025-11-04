import React, { useState, useRef } from "react";
import axios from "axios";
import { Icon } from "@iconify/react";

const VoiceRecorder = ({
  isRecording,
  setIsRecording,
  setResponse,
  setAudioUrl,
  setText,
  setIsLoading,
  setRefreshKey,
}) => {
  const mediaRecorderRef = useRef(null);
  const [audioChunks, setAudioChunks] = useState([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 44100,
        },
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
        bitsPerSecond: 128000,
      });

      mediaRecorderRef.current = mediaRecorder;
      setAudioChunks([]);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks((prev) => [...prev, event.data]);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunks, { type: "audio/webm" });
        try {
          const wavBlob = await convertToWav(blob);
          await uploadAudio(wavBlob);
        } catch (err) {
          console.error("Audio conversion failed:", err);
          setResponse("Error converting audio format");
        }
      };

      mediaRecorder.start(1000); // Collect data in 1-second chunks
      setIsRecording(true);
    } catch (error) {
      console.error("Recording failed:", error);
      alert("Microphone access denied or recording failed.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const convertToWav = async (webmBlob) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const arrayBuffer = await webmBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const numChannels = 1; // Force mono
    const sampleRate = 44100; // Standard sample rate
    const bytesPerSample = 2;
    const length = audioBuffer.length * numChannels * bytesPerSample + 44;

    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);

    // Write WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, "RIFF"); // ChunkID
    view.setUint32(4, length - 8, true); // ChunkSize
    writeString(8, "WAVE"); // Format
    writeString(12, "fmt "); // Subchunk1ID
    view.setUint32(16, 16, true); // Subchunk1Size
    view.setUint16(20, 1, true); // AudioFormat (PCM)
    view.setUint16(22, numChannels, true); // NumChannels
    view.setUint32(24, sampleRate, true); // SampleRate
    view.setUint32(28, sampleRate * numChannels * bytesPerSample, true); // ByteRate
    view.setUint16(32, numChannels * bytesPerSample, true); // BlockAlign
    view.setUint16(34, bytesPerSample * 8, true); // BitsPerSample
    writeString(36, "data"); // Subchunk2ID
    view.setUint32(40, length - 44, true); // Subchunk2Size

    // Write audio data
    const channelData = audioBuffer.getChannelData(0);
    let offset = 44;
    for (let i = 0; i < channelData.length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }

    return new Blob([buffer], { type: "audio/wav" });
  };

  // ✅ Upload to backend
  const uploadAudio = async (blob) => {
    const formData = new FormData();
    formData.append("audio", blob, "recording.wav");

    setIsLoading(true);
    setResponse("");
    setAudioUrl(null);

    try {
      const res = await axios.post("http://127.0.0.1:5000/speech", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        maxBodyLength: Infinity,
      });

      if (res.data.transcribed_text) setText(res.data.transcribed_text);
      if (res.data.response_text) setResponse(res.data.response_text);
      if (res.data.audio_response_url) setAudioUrl(res.data.audio_response_url);
    } catch (err) {
      console.error("Speech upload failed:", err);
      setResponse("Speech processing error: " + (err.response?.data?.error || err.message));
    } finally {
      setIsLoading(false);
      setRefreshKey((prev) => prev + 1);
    }
  };

  return (
    <button
      onClick={isRecording ? stopRecording : startRecording}
      style={{
        background: isRecording
          ? "linear-gradient(135deg, #ef4444, #b91c1c)"
          : "linear-gradient(135deg, #10b981, #059669)",
        border: "none",
        borderRadius: "12px",
        padding: "10px 16px",
        marginRight: "10px",
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)",
        transition: "all 0.25s ease",
      }}
    >
      <Icon
        icon={isRecording ? "mdi:stop-circle" : "mdi:microphone"}
        width="22"
        height="22"
        color="white"
      />
    </button>
  );
};

export default VoiceRecorder;
