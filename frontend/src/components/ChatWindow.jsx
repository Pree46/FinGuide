import React, { useEffect, useState } from "react";
import axios from "axios";
import ChatInput from "./ChatInput";
import MarkdownRenderer from "./MarkdownRenderer";
import { layoutStyles } from "../styles/chatLayout";

const ChatWindow = ({ chatId }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (chatId) fetchMessages();
  }, [chatId]);

  const fetchMessages = async () => {
    const res = await axios.get(`http://127.0.0.1:5000/history/${chatId}`);
    setMessages(res.data.messages || []);
  };

  const handleSend = async (text) => {
    setLoading(true);
    const res = await axios.post("http://127.0.0.1:5000/generate", {
      prompt: text,
      chat_id: chatId,
    });
    await fetchMessages();
    setLoading(false);
  };

  if (!chatId)
    return <div style={layoutStyles.emptyChat}>Start a new chat or select one from the sidebar.</div>;

  return (
    <div style={layoutStyles.chatWindow}>
      <div style={layoutStyles.messagesContainer}>
        {messages.map((msg, idx) => (
          <div key={idx}>
            <div style={{ ...layoutStyles.messageBubble, ...layoutStyles.userBubble }}>
              <MarkdownRenderer text={msg.input} />
            </div>
            <div style={{ ...layoutStyles.messageBubble, ...layoutStyles.aiBubble }}>
              <MarkdownRenderer text={msg.response} />
            </div>
          </div>
        ))}
        {loading && <p>⏳ Thinking...</p>}
      </div>
      <ChatInput onSend={handleSend} />
    </div>
  );
};

export default ChatWindow;
