import React, { useEffect, useState } from "react";
import axios from "axios";
import MarkdownRenderer from "./MarkdownRenderer";
import { styles } from "../styles/advisorStyles";

const ChatHistory = ({ refreshKey }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://127.0.0.1:5000/history");
        setHistory(res.data);
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [refreshKey]);

  return (
    <div style={styles.historyContainer}>
      {loading ? (
        <p style={{ color: "#94a3b8" }}>Loading history...</p>
      ) : history.length === 0 ? (
        <p style={{ color: "#94a3b8" }}>No previous chats yet.</p>
      ) : (
        history.map((item, idx) => (
          <div key={idx}>
            <div style={{ ...styles.messageBubble, ...styles.userBubble }}>
              <p style={styles.messageTime}>
                🕒 {new Date(item.timestamp * 1000).toLocaleString()}
              </p>
              <MarkdownRenderer text={item.input} />
            </div>

            <div style={{ ...styles.messageBubble, ...styles.aiBubble }}>
              <MarkdownRenderer text={item.response} />
              {item.audio_url && (
                <audio
                  controls
                  src={item.audio_url}
                  style={{ marginTop: "10px", width: "100%" }}
                />
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ChatHistory;
