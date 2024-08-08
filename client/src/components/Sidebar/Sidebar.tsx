import { InputBase } from "@mui/material";
import React from "react";
import ContactItem from "./ContactItem";
import {
  ContactsList,
  SidebarContainer,
  SidebarHeader,
} from "./Sidebar.styles";

const Sidebar: React.FC = () => {
  const contacts = [
    {
      name: "John Doe",
      lastMessage: "Hey there!",
      timestamp: "12:34 PM",
      avatar: "/path/to/avatar.jpg",
    },
    {
      name: "John Doe",
      lastMessage: "Hey there!",
      timestamp: "12:34 PM",
      avatar: "/path/to/avatar.jpg",
    },
    {
      name: "John Doe",
      lastMessage: "Hey there!",
      timestamp: "12:34 PM",
      avatar: "/path/to/avatar.jpg",
    },
    // Add more contacts
  ];

  return (
    <SidebarContainer>
      <SidebarHeader>
        <InputBase placeholder="Search or start new chat" />
      </SidebarHeader>
      <ContactsList>
        {contacts.map((contact, index) => (
          <ContactItem key={index} {...contact} />
        ))}
      </ContactsList>
    </SidebarContainer>
  );
};

export default Sidebar;
