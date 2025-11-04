import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { layoutStyles } from "../styles/chatLayout";
import logo from "../assets/logo.png"; // Add this import

const Sidebar = ({
  chats,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
  activeChatId,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const handleRename = (id) => {
    if (newTitle.trim()) {
      onRenameChat(id, newTitle);
      setEditingId(null);
      setNewTitle("");
    }
  };

  return (
    <div style={layoutStyles.sidebar}>
      {/* 🌟 App Logo and Name */}
      <div style={layoutStyles.brandContainer}>
        <img
          src={logo} // Changed from "./assets/logo.png" to the imported logo
          alt="FinGuide Logo"
          style={layoutStyles.brandLogo}
        />
        <span style={layoutStyles.brandName}>FinGuide</span>
      </div>

      {/* ➕ New Chat Button */}
      <button
        style={{
          ...layoutStyles.newChatButton,
          ...(isHovered ? layoutStyles.newChatButtonHover : {}),
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onNewChat}
      >
        <Icon icon="mdi:plus-circle-outline" width="20" height="20" />
        New Chat
      </button>

      {/* 💬 Chat List */}
      <div style={layoutStyles.chatList}>
        {chats.map((chat) => (
          <div
            key={chat.id}
            style={{
              ...layoutStyles.chatItem,
              background:
                chat.id === activeChatId
                  ? "linear-gradient(135deg, #1E3A8A, #2563EB)"
                  : "transparent",
              color: chat.id === activeChatId ? "#F9FAFB" : "#E2E8F0",
            }}
            onClick={() => onSelectChat(chat.id)}
          >
            {editingId === chat.id ? (
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onBlur={() => handleRename(chat.id)}
                onKeyDown={(e) => e.key === "Enter" && handleRename(chat.id)}
                style={layoutStyles.renameInput}
                autoFocus
              />
            ) : (
              <span
                style={{
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  flex: 1,
                }}
              >
                {chat.title}
              </span>
            )}

            <div style={layoutStyles.chatActions}>
              <button
                title="Rename"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingId(chat.id);
                  setNewTitle(chat.title);
                }}
                style={layoutStyles.iconButton}
              >
                <Icon icon="mdi:pencil-outline" width="18" height="18" />
              </button>

              <button
                title="Delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
                style={layoutStyles.iconButton}
              >
                <Icon icon="mdi:trash-outline" width="18" height="18" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
