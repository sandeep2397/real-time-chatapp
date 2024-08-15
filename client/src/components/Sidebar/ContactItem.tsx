import {
  Avatar,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import { teal } from "@mui/material/colors";
import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SocketContext } from "../../App";
import { useGetUserName, useSelectedUserName } from "../../hooks/customHook";
import { selectedGroupOrPerson } from "../../redux/root_actions";
import { ContactItemContainer, Timestamp } from "./Sidebar.styles";

interface ContactItemProps {
  preferedName: string;
  username: string;
  lastMessage: string;
  timestamp: string;
  avatar: string;
  newMessages?: Array<any>;
  notifyChatData?: any;
}

const ContactItem: React.FC<ContactItemProps> = ({
  preferedName,
  username,
  lastMessage,
  timestamp,
  avatar,
  notifyChatData,
  newMessages,
}) => {
  const dispatch = useDispatch();
  const authUserName = useGetUserName();
  const selectedUserName = useSelectedUserName();

  const userRegex = /^\d+$/;
  const selectedUser = useSelector((state: any) => state?.Common?.selectedUser);
  const [isTyping, setTyping] = useState(false);
  // const currentSelUserStr = sessionStorage.getItem("current-selected-user");
  // const currSelUserObj =
  //   currentSelUserStr && currentSelUserStr !== "undefined"
  //     ? JSON.parse(currentSelUserStr)
  //     : {};

  const rowUserRecvdMsgs = newMessages?.filter((data: any) => {
    return data?.sender === username;
  });
  const currChattingUser = selectedUserName === username;
  // const socket = useSelector((state: any) => state?.Common?.socket);
  const socket = useContext(SocketContext);

  useEffect(() => {
    if (socket) {
      socket.on("show-typing", (data: any) => {
        if (data?.sender === username) {
          setTyping(true);
        }
      });

      socket.on("hide-typing", (data: any) => {
        if (data?.sender === username) {
          setTyping(false);
        }
      });
    }
    // Clean up the socket connection when the component unmounts
    return () => {
      socket && socket.off("show-typing");
      socket && socket.off("hide-typing");
    };
  }, []);

  return (
    <ContactItemContainer
      style={{
        backgroundColor: currChattingUser ? `#88dabc` : "#fff",
      }}
      onClick={() => {
        if (socket) {
          socket.emit("new-user-chat", {
            sender: authUserName,
            recipient: username,
          });
        }

        const userObj = {
          preferedName,
          username,
          lastMessage,
          timestamp,
          avatar,
        };

        sessionStorage.setItem(
          "current-selected-user",
          JSON.stringify(userObj)
        );
        sessionStorage.removeItem("selected-group");

        dispatch(selectedGroupOrPerson(userObj));
      }}
    >
      <ListItemAvatar>
        <Avatar
          alt={
            (!userRegex.test(preferedName) && preferedName?.toUpperCase()) ||
            preferedName?.toUpperCase()
          }
          sx={{ bgcolor: teal?.[500], width: 32, height: 32 }}
          src="/static/images/avatar/2.jpg"
        />
      </ListItemAvatar>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <ListItemText primary={preferedName} secondary={lastMessage} />
        {isTyping && (
          <Typography
            style={{
              color: teal[400],
              fontWeight: 400,
            }}
          >
            {"typing...."}
          </Typography>
        )}
      </div>

      <Timestamp>{timestamp}</Timestamp>
      {Array.isArray(rowUserRecvdMsgs) &&
        rowUserRecvdMsgs?.length > 0 &&
        !currChattingUser && (
          // notifyChatData?.recipient === username &&
          <div
            style={{
              height: "25px",
              width: "25px",
              background: "#25d366",
              borderRadius: "50%",
              textAlign: "center",
            }}
          >
            <span style={{ color: "#fff", lineHeight: 1.6, fontSize: "14px" }}>
              {rowUserRecvdMsgs?.length}
            </span>
          </div>
        )}
    </ContactItemContainer>
  );
};

export default ContactItem;
