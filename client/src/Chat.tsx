import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { WindowDiv } from "./chat.style";
import ChatWindow from "./components/ChatWindow/ChatWindow";
import Header from "./components/Header/Header";
import MessageInput from "./components/MessageInput/MessageInput";
import Sidebar from "./components/Sidebar/Sidebar";

const socket = io("http://localhost:4001");

const Chat: React.FC = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    socket.on("message", (message: string) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("message");
    };
  }, []);

  const sendMessage = () => {
    socket.emit("message", message);
    setMessage("");
  };

  return (
    <WindowDiv>
      {/* <div>
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button> */}
      <Box display="flex" height="90vh">
        <Sidebar />
        <Box display="flex" flexDirection="column" flexGrow={1}>
          <Header />
          <ChatWindow messages={messages} />
          <MessageInput />
        </Box>
      </Box>
    </WindowDiv>
  );
};

export default Chat;
