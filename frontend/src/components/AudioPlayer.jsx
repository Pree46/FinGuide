import React, { useRef, useState, useEffect } from "react";
import { Icon } from "@iconify/react";

const AudioPlayer = ({ audioUrl }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!audioUrl) return;
    
    const audio = audioRef.current;
    if (!audio) return;

    // Reset states
    setIsPlaying(false);
    setIsLoading(true);
    setError(null);

    audio.load();  // Reload with new URL

    // Handle loading
    const handleCanPlay = () => setIsLoading(false);
    const handleError = () => {
      setError("Failed to load audio");
      setIsLoading(false);
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [audioUrl]);

  const handlePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio || isLoading) return;

    try {
      if (isPlaying) {
        audio.pause();
      } else {
        // Stop other audio elements
        document.querySelectorAll('audio').forEach(a => {
          if (a !== audio) a.pause();
        });
        await audio.play();
      }
      setIsPlaying(!isPlaying);
      setError(null);
    } catch (err) {
      setError("Playback failed");
      console.error("Audio playback error:", err);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginTop: '0px'  // Changed from 10px to 0px to align with other buttons
    }}>
      <button
        onClick={handlePlayPause}
        disabled={isLoading}
        style={{
          background: isPlaying 
            ? 'linear-gradient(135deg, #ef4444, #b91c1c)'
            : 'linear-gradient(135deg, #2563EB, #1E40AF)',
          border: 'none',
          borderRadius: '12px',
          padding: '10px 16px',
          cursor: isLoading ? 'wait' : 'pointer',
          opacity: isLoading ? 0.7 : 1,
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
          transition: 'all 0.25s ease',
          height: '42px',  // Added fixed height to match other buttons
          display: 'inline-flex',  // Changed from 'flex' to 'inline-flex'
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '0',  // Ensure no margin is pushing it down
          verticalAlign: 'middle'  // Added to ensure vertical alignment
        }}
      >
        <Icon
          icon={isLoading ? "mdi:loading" : isPlaying ? "mdi:pause-circle" : "mdi:play-circle"}
          width="22"
          height="22"
          color="white"
          style={{
            animation: isLoading ? 'spin 1s linear infinite' : 'none'
          }}
        />
        <span style={{
          color: 'white',
          fontSize: '14px',
          fontWeight: '500',
          fontFamily: "'Manrope', sans-serif"
        }}>
          {isLoading ? 'Loading...' : isPlaying ? 'Pause' : 'Play'} Response
        </span>
      </button>

      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={() => setIsPlaying(false)}
        style={{ display: 'none' }}
      />

      {error && (
        <div style={{
          color: '#dc2626',
          fontSize: '0.875rem',
          position: 'absolute',  // Changed to position error message below
          bottom: '-20px',
          left: '0'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
