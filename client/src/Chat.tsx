import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ChatWindow from "./components/ChatWindow/ChatWindow";
import Header from "./components/Header/Header";
import MessageInput from "./components/MessageInput/MessageInput";
import Sidebar from "./components/Sidebar/Sidebar";

// const socket = io("http://localhost:4001");

const Chat: React.FC = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Record<string, any>[]>([]);
  //   const [socket, setSocket] = useState<any>(null);
  const socket = useSelector((state: any) => state?.Common?.socket);
  //   sessionStorage.getItem("socket");

  useEffect(() => {
    // Initialize Socket.io connection
    // load all prev mesgs
    const socketStr = sessionStorage.getItem("socket");
    const savedSocket =
      socketStr && socketStr !== "undefined"
        ? JSON.parse(sessionStorage.getItem("socket") || "")
        : null;

    if (socket) {
      //   const newSocket = io("http://localhost:4001", {
      //     query: { socketId: storedSocketId },
      //   });
      //   setSocket(newSocket);
      //   const existingSocket = io("http://localhost:4001", {
      //     autoConnect: false,
      //   });

      socket.on("loadmessages", (msgData: any) => {
        // console.log("Mesgss====>", msgData);
        setMessages(msgData);
        // setMessages((prevMessages) => [...prevMessages, msgData]);
      });

      // Listen for new messages
      socket.on("new_message", (msgData: any) => {
        console.log("Mesgss====>", msgData);
        let newMsg = [msgData];
        // setMessages([...messages, ...newMsg]);
        setMessages((prevMessages) => [...prevMessages, msgData]);
      });
    }

    // Clean up the socket connection when the component unmounts
    return () => {
      socket && socket.off("loadmessages");
      socket && socket.off("new_message");
    };
  }, []);
  //   const sendMessage = () => {
  //     socket.emit("message", message);
  //     setMessage("");
  //   };

  return (
    <div className="box">
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
          <MessageInput
            sendMessage={async (receivedMsg: string) => {
              const userInfo = JSON.parse(sessionStorage.getItem("user") || "");
              if (socket) {
                socket.emit("send_message", {
                  content: receivedMsg,
                  recipient: "sagar",
                });
              }
            }}
          />
        </Box>
      </Box>
    </div>
  );
};

export default Chat;
