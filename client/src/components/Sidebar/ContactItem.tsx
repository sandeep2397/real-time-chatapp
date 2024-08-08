import { Avatar, ListItemAvatar, ListItemText } from "@mui/material";
import React from "react";
import { ContactItemContainer, Timestamp } from "./Sidebar.styles";

interface ContactItemProps {
  name: string;
  lastMessage: string;
  timestamp: string;
  avatar: string;
}

const ContactItem: React.FC<ContactItemProps> = ({
  name,
  lastMessage,
  timestamp,
  avatar,
}) => {
  return (
    <ContactItemContainer>
      <ListItemAvatar>
        <Avatar src={avatar} />
      </ListItemAvatar>
      <ListItemText primary={name} secondary={lastMessage} />
      <Timestamp>{timestamp}</Timestamp>
    </ContactItemContainer>
  );
};

export default ContactItem;
