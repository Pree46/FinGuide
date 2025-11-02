import React, { useRef, useState, useEffect } from "react";
import { styles } from "../styles/advisorStyles";

const AudioPlayer = ({ audioUrl }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // ✅ Stop and reset when URL changes — no autoplay
  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    // Stop any ongoing playback immediately
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);

    // Explicitly block autoplay by resetting src manually
    audio.src = "";
    setTimeout(() => {
      audio.src = audioUrl;
    }, 50); // small delay ensures browser doesn’t auto-start
  }, [audioUrl]);

  const handlePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        // Pause any other active audio tags
        document.querySelectorAll("audio").forEach(a => {
          if (a !== audio) a.pause();
        });

        await audio.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error("Audio play failed:", err);
    }
  };

  return (
    <div style={styles.audioPlayer}>
      <audio
        ref={audioRef}
        preload="none"
        onEnded={() => setIsPlaying(false)}
        controls={false}
      />
      <button
        onClick={handlePlayPause}
        style={{
          ...styles.button,
          backgroundColor: isPlaying ? "#dc3545" : "#2e5aac",
          marginTop: "15px",
        }}
      >
        {isPlaying ? "⏸ Pause" : "▶ Play"} Response
      </button>
    </div>
  );
};

export default AudioPlayer;
