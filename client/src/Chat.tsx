import { Box, Typography } from "@mui/material";
import {
  blue,
  lightGreen,
  orange,
  pink,
  purple,
  red,
  yellow,
} from "@mui/material/colors";
import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SocketContext } from "./App";
import "./App.css";
import ChatWindow from "./components/ChatWindow/ChatWindow";
import Header from "./components/Header/Header";
import MessageInput from "./components/MessageInput/MessageInput";
import Sidebar from "./components/Sidebar/Sidebar";
import {
  useGetUserName,
  useSelectedGroupId,
  useSelectedUserName,
} from "./hooks/customHook";
import {
  saveContacts,
  saveGroupParticipants,
  selectedGroupOrPerson,
} from "./redux/root_actions";
// const socket = io("http://localhost:4001");
interface props {
  refreshedMsgs: Array<Record<string, any>>;
}

const Chat: React.FC<props> = ({ refreshedMsgs }: props) => {
  const dispatch = useDispatch();
  const authUserName = useGetUserName();
  const [messages, setMessages] = useState<Record<string, any>[]>([]);
  //   const [socket, setSocket] = useState<any>(null);
  const selectedUser = useSelector((state: any) => state?.Common?.selectedUser);
  //   const socket = useSelector((state: any) => state?.Common?.socket);
  //   sessionStorage.getItem("socket");
  const socket = useContext(SocketContext);
  const selectedGrpId = useSelectedGroupId();
  const selectedUserName = useSelectedUserName();

  useEffect(() => {
    if (refreshedMsgs && refreshedMsgs?.length > 0) {
      setMessages(refreshedMsgs);
    }
  }, [refreshedMsgs]);

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

      socket.on("load-group-messages", (groupData: any) => {
        const colors: any = {
          color0: yellow[700],
          color1: red[400],
          color2: blue[400],
          color3: orange[400],
          color4: purple[400],
          color5: lightGreen[400],
          color6: pink[400],
          color7: yellow[400],
        };
        const saveParticipants = groupData?.participants?.map(
          (data: any, index: number) => {
            return {
              ...data,
              color: colors?.[`color${index}`] || "#434343",
            };
          }
        );
        dispatch(saveGroupParticipants(saveParticipants));
        setMessages(groupData?.messages);
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

      // new group msgs
      socket.on("new_group_message", (msgData: any) => {
        console.log("Grp Mesgss====>", msgData);
        const selGroupStr = sessionStorage.getItem("selected-group");
        const selGroupObj =
          selGroupStr && selGroupStr !== "undefined"
            ? JSON.parse(selGroupStr)
            : {};

        const selGrpId = selGroupObj?.id;
        if (msgData?.groupId === selGrpId) {
          let newMsg = [msgData];
          // setMessages([...messages, ...newMsg]);
          setMessages((prevMessages) => [...prevMessages, msgData]);
        }
      });
    }

    // Clean up the socket connection when the component unmounts
    return () => {
      dispatch(saveContacts([]));
      socket && socket.off("loadmessages");
      socket && socket.off("new_message");
      socket && socket.off("loadcontacts");
    };
  }, []);

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
      <Box display="flex" height="99vh">
        <Sidebar />
        <Box display="flex" flexDirection="column" flexGrow={1}>
          {selectedUserName || selectedGrpId ? (
            <>
              <Header />
              <ChatWindow messages={messages} />
              <MessageInput
                callbackUserTyping={(value: string) => {
                  if (socket) {
                    const topic = selectedGrpId
                      ? "group-user-typing"
                      : "user-typing";
                    socket.emit(topic, {
                      sender: authUserName,
                      recipient: selectedUserName,
                      content: value,
                      groupId: selectedGrpId,
                      // fileUrl,
                      // fileType,
                      // fileName,
                    });
                  }
                }}
                sendMessage={(
                  receivedMsg: string,
                  fileUrl?: string,
                  fileType?: string,
                  fileName?: string
                ) => {
                  if (socket) {
                    if (receivedMsg?.trim()) {
                      if (selectedGrpId) {
                        socket.emit("broadcast_new_message", {
                          content: receivedMsg,
                          groupId: selectedGrpId,
                          fileUrl,
                          fileType,
                          fileName,
                        });
                      } else if (selectedUserName) {
                        socket.emit("send_message", {
                          content: receivedMsg,
                          recipient: selectedUserName,
                          fileUrl,
                          fileType,
                          fileName,
                        });
                        dispatch(selectedGroupOrPerson(selectedUser));
                      }
                    }
                  }
                }}
              />
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
        </Box>
      </Box>
    </div>
  );
};

export default Chat;
