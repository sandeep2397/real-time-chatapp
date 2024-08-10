import { Avatar, ListItemAvatar, ListItemText } from "@mui/material";
import { teal } from "@mui/material/colors";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetUserName } from "../../hooks/customHook";
import { currentSelectedPerson } from "../../redux/root_actions";
import { ContactItemContainer, Timestamp } from "./Sidebar.styles";

interface ContactItemProps {
  preferedName: string;
  username: string;
  lastMessage: string;
  timestamp: string;
  avatar: string;
}

const ContactItem: React.FC<ContactItemProps> = ({
  preferedName,
  username,
  lastMessage,
  timestamp,
  avatar,
}) => {
  const dispatch = useDispatch();
  const authUserName = useGetUserName();
  const userRegex = /^\d+$/;
  const selectedUser = useSelector((state: any) => state?.Common?.selectedUser);
  const shouldHighlight = selectedUser?.username === username;
  const socket = useSelector((state: any) => state?.Common?.socket);

  return (
    <ContactItemContainer
      style={{
        backgroundColor: shouldHighlight ? `#88dabc` : "#fff",
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
        dispatch(currentSelectedPerson(userObj));
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
      <ListItemText primary={preferedName} secondary={lastMessage} />
      <Timestamp>{timestamp}</Timestamp>
    </ContactItemContainer>
  );
};

export default ContactItem;
