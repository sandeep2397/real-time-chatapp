import { Avatar, ListItemAvatar, ListItemText } from "@mui/material";
import { teal } from "@mui/material/colors";
import React from "react";
import { ContactItemContainer, Timestamp } from "./Sidebar.styles";

interface ContactItemProps {
  name: string;
  username: string;
  lastMessage: string;
  timestamp: string;
  avatar: string;
}

const ContactItem: React.FC<ContactItemProps> = ({
  name,
  username,
  lastMessage,
  timestamp,
  avatar,
}) => {
  const userRegex = /^\d+$/;

  return (
    <ContactItemContainer>
      <ListItemAvatar>
        <Avatar
          alt={
            (!userRegex.test(name) && name?.toUpperCase()) ||
            name?.toUpperCase()
          }
          sx={{ bgcolor: teal?.[500], width: 32, height: 32 }}
          src="/static/images/avatar/2.jpg"
        />
      </ListItemAvatar>
      <ListItemText primary={name} secondary={lastMessage} />
      <Timestamp>{timestamp}</Timestamp>
    </ContactItemContainer>
  );
};

export default ContactItem;
