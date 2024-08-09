import {
  Avatar,
  IconButton,
  InputBase,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import React, { useState } from "react";
import { MdLogout } from "react-icons/md";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { removeSession } from "../../utils/auth";
import ContactItem from "./ContactItem";
import {
  ContactItemContainer,
  ContactsList,
  SidebarContainer,
  SidebarHeader,
} from "./Sidebar.styles";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(sessionStorage.getItem("user") || "");
  // const [socket, setSocket] = useState<any>(null);
  const socket = useSelector((state: any) => state?.Common?.socket);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");

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
      <ContactItemContainer>
        <ListItemAvatar>
          <Avatar src={"../assests"} />
        </ListItemAvatar>
        <ListItemText primary={`logged In as ${userInfo?.username}`} />
      </ContactItemContainer>
      <IconButton
        aria-label="toggle password visibility"
        onClick={() => {
          if (socket) {
            socket.disconnect(); // Disconnect the socket
            console.log("Socket disconnected:", socket.id);
          }

          removeSession();
          navigate("/login");
        }}
      >
        <MdLogout /> Logout
      </IconButton>
    </SidebarContainer>
  );
};

export default Sidebar;
