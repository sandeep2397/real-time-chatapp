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
import React, { useCallback, useContext, useEffect, useState } from "react";
import { MdLogout } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { SocketContext } from "../../App";
import { customAuth } from "../../firebaseConfig";
import { useGetUserName } from "../../hooks/customHook";
import { LoginButton, WelcomeLabel } from "../../style";
import { removeSession } from "../../utils/auth";
import ContactItem from "./ContactItem";
import GroupItem from "./GroupItem";
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
  const socket = useContext(SocketContext);
  // const [socket, setSocket] = useState<any>(null);
  // const socket = useSelector((state: any) => state?.Common?.socket);
  const [message, setMessage] = useState("");
  // const [contacts, setContacts] = useState<any>([]);
  const contacts = useSelector((state: any) => state?.Common?.contacts);
  const groups = useSelector((state: any) => state?.Common?.groups);

  const [bindContacts, setBindContacts] = useState<any>(contacts);
  const [search, setSearch]: any = useState("");

  const [username, setUsername] = useState("");
  const userRegex = /^\d+$/;
  const theme = useTheme();

  useEffect(() => {
    if (contacts?.length > 0) {
      setBindContacts(contacts);
    }
  }, [contacts]);

  const debounce = (func: any) => {
    let timer: any;
    return function (this: any, ...args: any) {
      const context = this;
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        timer = null;
        func.apply(context, args);
      }, 300);
    };
  };

  const handleFilter = (value: string) => {
    // props?.handleFilterChange(column, value, searchQuery);
    // dispatch(saveCurrentKeyValue(props?.keyvalue));
    const defCols: any = ["username", "preferedName"];
    const listPath: any = {
      username: {
        id: "$.username",
        locale: "username",
        cell: {
          type: "text",
          dataType: "string",
        },
      },
      preferedName: {
        id: "$.preferedName",
        locale: "preferedName",
        cell: {
          type: "text",
          dataType: "string",
        },
      },
    };
    const filteredList = contacts?.filter((row: any) => {
      for (let columnInfo of defCols) {
        let derivedPath: string = listPath?.[columnInfo]?.id || "";
        if (derivedPath.indexOf("$.") !== -1) {
          derivedPath = derivedPath.slice(2);
        }

        let celldata: any;
        if (derivedPath?.indexOf(".") > -1) {
          celldata = derivedPath
            ?.split(".")
            .reduce((o: any, i: any) => o?.[i], row);
        } else {
          celldata = row?.[derivedPath];
        }
        if (
          columnInfo &&
          derivedPath &&
          celldata?.toString()?.toLowerCase()?.search(value?.toLowerCase()) !==
            -1 &&
          celldata?.toString()?.toLowerCase()?.search(value?.toLowerCase()) !==
            undefined
        ) {
          return row;
        }
      }
    });
    setBindContacts(filteredList);
  };
  const optimizedFn = useCallback(debounce(handleFilter), []);

  return (
    <SidebarContainer>
      <SidebarHeader>
        <Typography variant="h3">Chats</Typography>
        <InputBase
          placeholder="Search or start new chat"
          onChange={(e: any) => {
            optimizedFn(e.target.value);
            // handleFilter(props?.keyvalue, e?.target?.value || '');
            setSearch(e.target.value);
          }}
        />
      </SidebarHeader>
      <ContactsList>
        {groups?.map((contact: any, index: any) => (
          <>
            <GroupItem key={index} {...contact} />
            <Divider variant="middle" style={{ margin: "0px 16px" }} />
          </>
        ))}
        {bindContacts?.map((contact: any, index: any) => (
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
            // dispatch(selectedGroupOrPerson({}));
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
