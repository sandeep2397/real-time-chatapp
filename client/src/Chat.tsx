import { Box, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./App.css";
import ChatWindow from "./components/ChatWindow/ChatWindow";
import Header from "./components/Header/Header";
import MessageInput from "./components/MessageInput/MessageInput";
import Sidebar from "./components/Sidebar/Sidebar";
import { useGetUserName } from "./hooks/customHook";
import { currentSelectedPerson } from "./redux/root_actions";
// const socket = io("http://localhost:4001");

const Chat: React.FC = () => {
  const dispatch = useDispatch();
  const authUserName = useGetUserName();
  const [messages, setMessages] = useState<Record<string, any>[]>([]);
  //   const [socket, setSocket] = useState<any>(null);
  const selectedUser = useSelector((state: any) => state?.Common?.selectedUser);
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
      socket.on("loadmessages", (msgData: any) => {
        setMessages(msgData);
      });

      // Listen for new messages
      socket.on("new_message", (msgData: any) => {
        console.log("Mesgss====>", msgData);

        const currentSelUserStr = sessionStorage.getItem(
          "current-selected-user"
        );
        const currSelUserObj =
          currentSelUserStr && currentSelUserStr !== "undefined"
            ? JSON.parse(currentSelUserStr)
            : {};
        if (
          msgData?.sender === currSelUserObj?.username ||
          msgData?.recipient === currSelUserObj?.username
        ) {
          let newMsg = [msgData];
          // setMessages([...messages, ...newMsg]);
          setMessages((prevMessages) => [...prevMessages, msgData]);
        }
      });
    }

    // Clean up the socket connection when the component unmounts
    return () => {
      socket && socket.off("loadmessages");
      socket && socket.off("new_message");
      socket && socket.off("loadcontacts");
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
          {selectedUser?.username ? (
            <>
              <Header />
              <ChatWindow messages={messages} />
            </>
          ) : (
            <>
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  textAlign: "center",
                  marginTop: "6rem",
                }}
              >
                <img
                  src={require("./assets/newchat.jpg")}
                  height="50%"
                  width={"50%"}
                  alt="Logo"
                  style={{
                    aspectRatio: 3 / 2,
                    objectFit: "contain",
                    mixBlendMode: "darken",
                  }}
                ></img>
                <Typography variant="h4">
                  Start A New Chat with your friend
                </Typography>
              </div>{" "}
            </>
          )}
          <MessageInput
            sendMessage={async (receivedMsg: string) => {
              if (socket) {
                if (receivedMsg?.trim()) {
                  socket.emit("send_message", {
                    content: receivedMsg,
                    recipient: selectedUser?.username,
                  });
                  dispatch(currentSelectedPerson(selectedUser));
                }
              }
            }}
          />
        </Box>
      </Box>
    </div>
  );
};

export default Chat;
