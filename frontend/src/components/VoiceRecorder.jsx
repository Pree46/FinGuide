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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Try WAV first, fallback to WebM if unsupported
      let options = { mimeType: "audio/wav" };
      if (!MediaRecorder.isTypeSupported("audio/wav")) {
        options = { mimeType: "audio/webm" };
        console.warn("WAV not supported, using WebM fallback.");
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      setAudioChunks([]);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks((prev) => [...prev, event.data]);
        }
      };

      mediaRecorder.onstop = async () => {
        const blobType = mediaRecorder.mimeType === "audio/wav" ? "audio/wav" : "audio/webm";
        const blob = new Blob(audioChunks, { type: blobType });

        // If browser couldn’t produce a valid WAV, convert to WAV in-memory
        let finalBlob = blob;
        if (blobType === "audio/webm") {
          try {
            finalBlob = await convertToWav(blob);
          } catch (err) {
            console.warn("Conversion fallback failed, sending webm instead:", err);
          }
        }

        await uploadAudio(finalBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      alert("Microphone access denied or recording failed.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // ✅ Converts webm to wav safely (only used if necessary)
  const convertToWav = (webmBlob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      const audioContext = new AudioContext();

      reader.onload = async () => {
        try {
          const audioBuffer = await audioContext.decodeAudioData(reader.result);
          const wavBlob = audioBufferToWavBlob(audioBuffer);
          resolve(wavBlob);
        } catch (e) {
          reject(e);
        }
      };
      reader.readAsArrayBuffer(webmBlob);
    });

  const audioBufferToWavBlob = (audioBuffer) => {
    const numOfChan = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const length = audioBuffer.length * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    const channels = [];
    for (let i = 0; i < numOfChan; i++) channels.push(audioBuffer.getChannelData(i));

    const writeString = (offset, str) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };

    let offset = 0;
    writeString(offset, "RIFF"); offset += 4;
    view.setUint32(offset, 36 + audioBuffer.length * numOfChan * 2, true); offset += 4;
    writeString(offset, "WAVE"); offset += 4;
    writeString(offset, "fmt "); offset += 4;
    view.setUint32(offset, 16, true); offset += 4;
    view.setUint16(offset, 1, true); offset += 2;
    view.setUint16(offset, numOfChan, true); offset += 2;
    view.setUint32(offset, sampleRate, true); offset += 4;
    view.setUint32(offset, sampleRate * numOfChan * 2, true); offset += 4;
    view.setUint16(offset, numOfChan * 2, true); offset += 2;
    view.setUint16(offset, 16, true); offset += 2;
    writeString(offset, "data"); offset += 4;
    view.setUint32(offset, audioBuffer.length * numOfChan * 2, true); offset += 4;

    let interleaved = new Float32Array(audioBuffer.length * numOfChan);
    for (let i = 0; i < audioBuffer.length; i++)
      for (let ch = 0; ch < numOfChan; ch++)
        interleaved[i * numOfChan + ch] = channels[ch][i];

    let index = 44;
    for (let i = 0; i < interleaved.length; i++, index += 2) {
      const s = Math.max(-1, Math.min(1, interleaved[i]));
      view.setInt16(index, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }

    return new Blob([view], { type: "audio/wav" });
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
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.transcribed_text) setText(res.data.transcribed_text);
      if (res.data.response_text) setResponse(res.data.response_text);
      if (res.data.audio_response_url) setAudioUrl(res.data.audio_response_url);
    } catch (err) {
      console.error("Speech upload failed:", err);
      setResponse("Speech processing error: " + err.message);
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
