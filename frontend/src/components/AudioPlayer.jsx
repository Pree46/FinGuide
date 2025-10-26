import React, { useRef, useState, useEffect } from 'react';
import { styles } from '../styles/advisorStyles';

const AudioPlayer = ({ audioUrl }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    // Stop playing when audioUrl changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    }, [audioUrl]);

    const handlePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch(err => {
                    console.error("Playback failed:", err);
                });
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleAudioEnded = () => {
        setIsPlaying(false);
    };

    return (
        <div style={styles.audioPlayer}>
            <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={handleAudioEnded}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                preload="none"  // Prevent auto-loading
            />
            <button
                onClick={handlePlayPause}
                style={{
                    ...styles.button,
                    backgroundColor: isPlaying ? '#dc3545' : '#2e5aac',
                    marginTop: '15px'
                }}
            >
                {isPlaying ? '⏸ Pause' : '▶ Play'} Response
            </button>
        </div>
    );
};

export default AudioPlayer;