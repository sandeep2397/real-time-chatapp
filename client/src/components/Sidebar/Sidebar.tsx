import {
  Avatar,
  InputBase,
  ListItemAvatar,
  ListItemText,
  useTheme,
} from "@mui/material";
import { deepOrange } from "@mui/material/colors";
import React, { useState } from "react";
import { MdLogout } from "react-icons/md";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { LoginButton, WelcomeLabel } from "../../style";
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
  const userRegex = /^\d+$/;
  const theme = useTheme();

  const contacts = [
    {
      name: "Sagya",
      username: "sagar",
      lastMessage: "Hey there!",
      timestamp: "12:34 PM",
      avatar: "/path/to/avatar.jpg",
    },
    {
      name: "Darya",
      username: "darshan",
      lastMessage: "Hey there!",
      timestamp: "12:34 PM",
      avatar: "/path/to/avatar.jpg",
    },
    {
      name: "Vamshi",
      username: "vamshi",
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
          <Avatar
            alt={
              !userRegex.test(userInfo?.username) &&
              userInfo?.username?.toUpperCase()
            }
            sx={{ bgcolor: deepOrange?.[500], width: 38, height: 38 }}
            src="/static/images/avatar/2.jpg"
          />
        </ListItemAvatar>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <ListItemText
            secondary={"Logged In As"}
            style={{ color: "#a7a7a7" }}
          />
          <ListItemText
            primary={`${userInfo?.username}`}
            style={{ margin: "0px", fontWeight: 500 }}
          />
        </div>
      </ContactItemContainer>

      <LoginButton
        style={{ width: "95%", alignSelf: "center" }}
        onClick={() => {
          if (socket) {
            socket.disconnect(); // Disconnect the socket
            console.log("Socket disconnected:", socket.id);
          }
          removeSession();
          navigate("/login");
        }}
        variant="contained"
        type="submit"
        startIcon={<MdLogout />}
        // disabled={state?.username === '' || state?.password === ''}
      >
        <WelcomeLabel color={theme?.palette?.primary?.contrastText}>
          {"Logout"}
        </WelcomeLabel>
      </LoginButton>
    </SidebarContainer>
  );
};

export default Sidebar;
