import {
  Avatar,
  Divider,
  InputBase,
  ListItemAvatar,
  ListItemText,
  Typography,
  useTheme,
} from "@mui/material";
import { deepOrange } from "@mui/material/colors";
import { signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { MdLogout } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { customAuth } from "../../firebaseConfig";
import { useGetUserName } from "../../hooks/customHook";
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
  const dispatch = useDispatch();
  const authUserName = useGetUserName();
  // const [socket, setSocket] = useState<any>(null);
  const socket = useSelector((state: any) => state?.Common?.socket);
  const [message, setMessage] = useState("");
  // const [contacts, setContacts] = useState<any>([]);
  const contacts = useSelector((state: any) => state?.Common?.contacts);

  const [username, setUsername] = useState("");
  const userRegex = /^\d+$/;
  const theme = useTheme();

  // const contacts = [
  //   {
  //     name: "Sagya",
  //     username: "sagar",
  //     lastMessage: "Hey there!",
  //     timestamp: "12:34 PM",
  //     avatar: "/path/to/avatar.jpg",
  //   },
  //   {
  //     name: "Darya",
  //     username: "darshan",
  //     lastMessage: "Hey there!",
  //     timestamp: "12:34 PM",
  //     avatar: "/path/to/avatar.jpg",
  //   },
  //   {
  //     name: "Vamshi",
  //     username: "vamshi",
  //     lastMessage: "Hey there!",
  //     timestamp: "12:34 PM",
  //     avatar: "/path/to/avatar.jpg",
  //   },
  //   // Add more contacts
  // ];

  useEffect(() => {
    if (socket) {
      // socket.on("loadcontacts", (contacts: Array<any>) => {
      //   setContacts(contacts);
      //   // setMessages((prevMessages) => [...prevMessages, msgData]);
      // });
    }
    // Clean up the socket connection when the component unmounts
    return () => {
      // socket && socket.off("loadcontacts");
    };
  }, []);

  return (
    <SidebarContainer>
      <SidebarHeader>
        <Typography variant="h3">Chats</Typography>
        <InputBase placeholder="Search or start new chat" />
      </SidebarHeader>
      <ContactsList>
        {contacts?.map((contact: any, index: any) => (
          <>
            <ContactItem key={index} {...contact} />
            <Divider variant="middle" style={{ margin: "0px 16px" }} />
          </>
        ))}
      </ContactsList>
      <ContactItemContainer>
        <ListItemAvatar>
          <Avatar
            alt={!userRegex.test(authUserName) && authUserName?.toUpperCase()}
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
            primary={`${authUserName}`}
            style={{ margin: "0px", fontWeight: 500 }}
          />
        </div>
      </ContactItemContainer>

      <LoginButton
        style={{ width: "95%", alignSelf: "center" }}
        onClick={async () => {
          try {
            await signOut(customAuth);
            removeSession();
            if (socket) {
              socket.disconnect(); // Disconnect the socket
              console.log("Socket disconnected:", socket.id);
            }
            // dispatch(currentSelectedPerson({}));
            navigate("/login");
          } catch (err) {
            console.error("Err===>", err);
          }
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
