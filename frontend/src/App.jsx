import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import { layoutStyles } from "./styles/chatLayout";


const App = () => {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    const res = await axios.get("http://127.0.0.1:5000/chats");
    setChats(res.data);
  };

  const handleNewChat = async () => {
    const res = await axios.post("http://127.0.0.1:5000/chat/new", {});
    await fetchChats();
    setActiveChatId(res.data.id);
  };

  const handleDeleteChat = async (id) => {
    await axios.delete(`http://127.0.0.1:5000/chat/${id}/delete`);
    await fetchChats();
    if (activeChatId === id) setActiveChatId(null);
  };

  const handleRenameChat = async (id, title) => {
    await axios.put(`http://127.0.0.1:5000/chat/${id}/rename`, { title });
    await fetchChats();
  };

  return (
    <div style={layoutStyles.container}>
      <Sidebar
        chats={chats}
        onNewChat={handleNewChat}
        onSelectChat={setActiveChatId}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        activeChatId={activeChatId}
      />
      <ChatWindow chatId={activeChatId} />
    </div>
  );
};

export default App;
