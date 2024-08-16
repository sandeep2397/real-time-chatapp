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
import React, { FC, useCallback, useContext, useEffect, useState } from "react";
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
import _ from "lodash";
import { useResponsive } from "../../hooks/useResponsive";

interface props {
  groupTypingData: any;
  typingUserList: any;
  duoUsersTypingData: String[];
  newMessages?: Array<any>;
  newGroupMessages?: Array<any>;
  notifyChatData?: any;
  saveContactsAndGroups: Array<any>;
  notifyCount: number;
  onRowClick?: any;
}

const Sidebar: FC<props> = ({
  groupTypingData,
  typingUserList,
  duoUsersTypingData,
  newMessages,
  newGroupMessages,
  notifyChatData,
  notifyCount,
  onRowClick,
}: // saveContactsAndGroups,
props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authUserName = useGetUserName();
  const socket = useContext(SocketContext);
  // const [socket, setSocket] = useState<any>(null);
  // const socket = useSelector((state: any) => state?.Common?.socket);
  const [message, setMessage] = useState("");
  // const [contacts, setContacts] = useState<any>([]);
  const breakpoint = useResponsive([700, 1000, 1200]);

  const data = notifyCount;
  const sortedGroupsAndContacts = useSelector(
    (state: any) => state?.Common?.sortedGroupsAndContacts
  );
  const [bindContactsAndGroups, setBindContactsGroups] = useState<any>(
    sortedGroupsAndContacts
  );
  const [search, setSearch]: any = useState("");

  const [username, setUsername] = useState("");
  const userRegex = /^\d+$/;
  const theme = useTheme();

  useEffect(() => {
    if (sortedGroupsAndContacts?.length > 0) {
      setBindContactsGroups(sortedGroupsAndContacts);
    }
  }, [sortedGroupsAndContacts]);

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

      name: {
        id: "$.name",
        locale: "name",
        cell: {
          type: "text",
          dataType: "string",
        },
      },
    };
    const filteredList = sortedGroupsAndContacts?.filter((row: any) => {
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
    setBindContactsGroups(filteredList);
  };
  const optimizedFn = useCallback(debounce(handleFilter), []);

  console.log("bindContactsAndGroups=======>", bindContactsAndGroups);

  return (
    <SidebarContainer
      style={{
        width: breakpoint === 0 ? "100%" : "30%",
      }}
    >
      <SidebarHeader>
        <Typography
          style={{ display: "flex", flexDirection: "row", gap: "8px" }}
        >
          <img
            height="50px"
            width={"50px"}
            src={require("../../assets/favicon.ico")}
            style={{
              aspectRatio: 3 / 2,
              objectFit: "contain",
              mixBlendMode: "darken",
            }}
          />
          <Typography variant="h4" style={{ lineHeight: 1.6 }}>
            Safe-Chat
          </Typography>
        </Typography>
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
        {sortedGroupsAndContacts &&
          sortedGroupsAndContacts?.map((rowInfo: any, index: number) => {
            const isGroup = rowInfo?._id;

            return isGroup ? (
              <>
                <GroupItem
                  key={index}
                  groupTypingData={groupTypingData}
                  newGroupMessages={newGroupMessages}
                  typingUserList={typingUserList}
                  index={index}
                  onRowClick={onRowClick}
                  {...rowInfo}
                />
                <Divider variant="middle" style={{ margin: "0px 16px" }} />
              </>
            ) : (
              <>
                <ContactItem
                  newMessages={newMessages}
                  notifyChatData={notifyChatData}
                  duoUsersTypingData={duoUsersTypingData}
                  index={index}
                  onRowClick={onRowClick}
                  key={index}
                  {...rowInfo}
                />
                <Divider variant="middle" style={{ margin: "0px 16px" }} />
              </>
            );
          })}
      </ContactsList>
      <ContactItemContainer
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "8px",
          }}
        >
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
        </div>

        <LoginButton
          style={{ width: "45%", alignSelf: "center" }}
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
      </ContactItemContainer>
    </SidebarContainer>
  );
};

export default Sidebar;
