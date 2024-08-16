import { Box, Typography } from "@mui/material";
import {
  blue,
  lightGreen,
  orange,
  pink,
  purple,
  red,
  yellow,
} from "@mui/material/colors";
import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SocketContext } from "./App";
import "./App.css";
import ChatWindow from "./components/ChatWindow/ChatWindow";
import Header from "./components/Header/Header";
import MessageInput from "./components/MessageInput/MessageInput";
import Sidebar from "./components/Sidebar/Sidebar";
import {
  useGetUserName,
  useSelectedGroupId,
  useSelectedUserName,
} from "./hooks/customHook";
import {
  saveContacts,
  saveGroupParticipants,
  selectedGroupOrPerson,
  storeSortGroupsAndContacts,
} from "./redux/root_actions";
import { cloneDeep } from "lodash";
import _ from "lodash";
import ListComponent from "./components/Sidebar/TestComponent";
import { useResponsive } from "./hooks/useResponsive";
// const socket = io("http://localhost:4001");
interface props {
  refreshedMsgs: Array<Record<string, any>>;
}

const Chat: React.FC<props> = ({ refreshedMsgs }: props) => {
  const dispatch = useDispatch();
  const authUserName = useGetUserName();
  const [messages, setMessages] = useState<Record<string, any>[]>([]);
  const contacts = useSelector((state: any) => state?.Common?.contacts);
  const groups = useSelector((state: any) => state?.Common?.groups);

  //   const [socket, setSocket] = useState<any>(null);
  const selectedUser = useSelector((state: any) => state?.Common?.selectedUser);
  const participants =
    useSelector((state: any) => state?.Common?.participants) || [];
  //   const socket = useSelector((state: any) => state?.Common?.socket);
  //   sessionStorage.getItem("socket");
  const socket = useContext(SocketContext);
  const selectedGrpId = useSelectedGroupId();
  const selectedUserName = useSelectedUserName();

  const breakpoint = useResponsive([700, 1000, 1200]);
  const [fullScreenChat, showFullScreenChat] = useState<boolean>(false);
  const [newGroupOrChatLoaded, setNewGroupOrChat] = useState<boolean>(false);

  const [typingUsersList, setTypingUsersList] = useState<Array<any>>([]);
  const [duoUsersTypingData, setDuoUsersTypingData] = useState<string[]>([]);
  // const [typingUserString, setTypingUserString] = useState<any>("");
  const [notifyCount, setNotifyCount] = useState<any>(0);
  const [saveContactsAndGroups, setContactsAndGroups] = useState<Array<any>>([
    ...(groups || []),
    ...(contacts || []),
  ]);

  const [groupUserTypingState, setGroupUserTypingState] = useState<any>({});
  const [notifyChatData, setNotifyUserOrGroup] = useState<any>({});
  const [shouldSort, setShouldSort] = useState<boolean>(true);
  const [newMessages, setNewMessages] = useState<Record<string, any>[]>([]);
  const [newGroupMessages, setNewGroupMessages] = useState<
    Record<string, any>[]
  >([]);

  // useEffect(() => {
  //   if (refreshedMsgs && refreshedMsgs?.length > 0) {
  //     setMessages(refreshedMsgs);
  //     setContactsAndGroups([...(groups || []), ...(contacts || [])]);
  //     dispatch(
  //       storeSortGroupsAndContacts([...(groups || []), ...(contacts || [])])
  //     );
  //   }
  // }, [refreshedMsgs]);

  // useEffect(() => {
  //   if (breakpoint === 0) {
  //     showFullScreenChat(true);
  //   } else {
  //     showFullScreenChat(false);
  //   }
  // }, [selectedUser]);

  useEffect(() => {
    if (contacts?.length > 0 || groups?.length > 0) {
      setContactsAndGroups([...(groups || []), ...(contacts || [])]);
      dispatch(
        storeSortGroupsAndContacts([...(groups || []), ...(contacts || [])])
      );
    }
  }, [groups, contacts]);

  const sortGroupsAndContacts = (newMgs: Array<any>) => {
    const sortedData = saveContactsAndGroups?.sort((a: any, b: any) => {
      const aList: any =
        newMgs?.filter((msgData: any) => {
          const isGroup = msgData?.groupId;
          if (
            isGroup
              ? msgData?.groupId === a?.["_id"]
              : msgData?.sender === a?.["username"]
          ) {
            return msgData;
          }
        }) || [];
      const aUserData = aList?.length > 0 ? aList?.[aList?.length - 1] : {};

      const bList: any = newMgs?.filter((msgData: any) => {
        const isGroup = msgData?.groupId;
        if (
          isGroup
            ? msgData?.groupId === b?.["_id"]
            : msgData?.sender === b?.["username"]
        ) {
          return msgData;
        }
      });
      const bUserData = bList?.length > 0 ? bList?.[bList?.length - 1] : {};

      if (
        (aUserData?.["uiTimeStamp"] ?? 0) > (bUserData?.["uiTimeStamp"] ?? 0)
      ) {
        return -1;
      } else {
        return 1;
      }
    });

    return sortedData;
  };

  useEffect(() => {
    if (newMessages?.length > 0 && shouldSort) {
      const sortedContactsAndGrps = sortGroupsAndContacts(newMessages ?? []);
      setContactsAndGroups(sortedContactsAndGrps);
      dispatch(storeSortGroupsAndContacts(sortedContactsAndGrps));
      setNotifyCount((prvCount: number) => prvCount + 1);
    }
  }, [newMessages]);

  useEffect(() => {
    if (newGroupMessages?.length > 0 && shouldSort) {
      const sortedContactsAndGrps = sortGroupsAndContacts(
        newGroupMessages ?? []
      );
      setContactsAndGroups(sortedContactsAndGrps);
      dispatch(storeSortGroupsAndContacts(sortedContactsAndGrps));
      setNotifyCount((prvCount: number) => prvCount + 1);
    }
  }, [newGroupMessages]);

  const duoChattingContext = () => {
    const socketStr = sessionStorage.getItem("socket");
    const savedSocket =
      socketStr && socketStr !== "undefined"
        ? JSON.parse(sessionStorage.getItem("socket") || "")
        : null;

    if (socket) {
      socket.on("loadmessages", (msgData: any) => {
        const currentSelUserStr = sessionStorage.getItem(
          "current-selected-user"
        );
        const currSelUserObj =
          currentSelUserStr && currentSelUserStr !== "undefined"
            ? JSON.parse(currentSelUserStr)
            : {};
        setShouldSort(false);

        // if (breakpoint === 0) {
        //   showFullScreenChat(true);
        // }

        setNewMessages((prevNewMsgs) => {
          const filteredMsgs = prevNewMsgs?.filter(
            (msgInfo: any) => msgInfo?.sender !== currSelUserObj?.username
          );
          // Return the updated list without adding the typingUser if it's the authUserName
          return filteredMsgs;
          // return [...prevNewMsgs, msgData]
        });
        setMessages(msgData);
      });

      // Listen for new messages
      socket.on("new_message", (msgData: any) => {
        console.log("Mesgss====>", msgData);
        const currentSelUserStr = sessionStorage.getItem(
          "current-selected-user"
        );
        const currSelUserObj =
          currentSelUserStr && currentSelUserStr !== "undefined"
            ? JSON.parse(currentSelUserStr)
            : {};

        setNotifyUserOrGroup({
          recipient: msgData?.sender,
        });

        setShouldSort(true);

        setNewMessages((prevNewMsgs) => {
          const concatedMsgs = [...prevNewMsgs, msgData];
          const filteredMsgs = concatedMsgs?.filter(
            (msgInfo: any) => msgInfo?.sender !== authUserName
          );
          return filteredMsgs;
          // return [...prevNewMsgs, msgData]
        });

        if (
          msgData?.sender === currSelUserObj?.username ||
          msgData?.recipient === currSelUserObj?.username
        ) {
          let newMsg = [msgData];
          // setMessages([...messages, ...newMsg]);
          setMessages((prevMessages) => [...prevMessages, msgData]);
        }
      });

      socket.on("show-typing", (data: any) => {
        setDuoUsersTypingData((prevUsers: any) => {
          if (prevUsers?.includes(data?.sender)) {
            return prevUsers;
          }
          return [...prevUsers, data?.sender];
        });
      });

      socket.on("hide-typing", (data: any) => {
        setDuoUsersTypingData((prevUsers: any) => {
          const filteredUsers = prevUsers?.filter(
            (username: any) => username !== data?.sender
          );
          // Return the updated list without adding the typingUser if it's the authUserName
          return filteredUsers;
        });
      });

      // new group msgs
    }
  };

  const groupChattingContext = () => {
    /** --------Group chatting topics---------- */
    const socketStr = sessionStorage.getItem("socket");
    const savedSocket =
      socketStr && socketStr !== "undefined"
        ? JSON.parse(sessionStorage.getItem("socket") || "")
        : null;

    if (socket) {
      socket.on("load-group-messages", (groupData: any) => {
        const selGroupStr = sessionStorage.getItem("selected-group");
        const selGroupObj =
          selGroupStr && selGroupStr !== "undefined"
            ? JSON.parse(selGroupStr)
            : {};

        const selGrpId = selGroupObj?.id;

        const colors: any = {
          color0: yellow[700],
          color1: red[400],
          color2: blue[400],
          color3: orange[400],
          color4: purple[400],
          color5: lightGreen[400],
          color6: pink[400],
          color7: yellow[400],
        };
        const saveParticipants = groupData?.participants?.map(
          (data: any, index: number) => {
            return {
              ...data,
              color: colors?.[`color${index}`] || "#434343",
            };
          }
        );
        dispatch(saveGroupParticipants(saveParticipants));
        setShouldSort(false);

        // if (breakpoint === 0) {
        //   showFullScreenChat(true);
        // }

        setNewGroupMessages((prevNewMsgs) => {
          const filteredMsgs = prevNewMsgs?.filter(
            (msgInfo: any) => msgInfo?.groupId !== selGrpId
          );
          // Return the updated list without adding the typingUser if it's the authUserName
          return filteredMsgs;
          // return [...prevNewMsgs, msgData]
        });

        setMessages(groupData?.messages);
      });

      socket.on("new_group_message", (msgData: any) => {
        console.log("Grp Mesgss====>", msgData);
        const selGroupStr = sessionStorage.getItem("selected-group");
        const selGroupObj =
          selGroupStr && selGroupStr !== "undefined"
            ? JSON.parse(selGroupStr)
            : {};

        const selGrpId = selGroupObj?.id;

        const currentSelUserStr = sessionStorage.getItem(
          "current-selected-user"
        );
        const currSelUserObj =
          currentSelUserStr && currentSelUserStr !== "undefined"
            ? JSON.parse(currentSelUserStr)
            : {};

        setNotifyUserOrGroup({
          recipient: msgData?.sender,
        });
        setShouldSort(true);

        setNewGroupMessages((prevNewMsgs) => {
          const concatedMsgs = [...prevNewMsgs, msgData];
          const filteredMsgs = concatedMsgs?.filter(
            (msgInfo: any) => msgInfo?.sender !== authUserName
          );
          return filteredMsgs;
        });

        if (msgData?.groupId === selGrpId) {
          let newMsg = [msgData];
          // setMessages([...messages, ...newMsg]);
          setMessages((prevMessages) => [...prevMessages, msgData]);
        }
      });

      socket.on("show-group-user-typing", (data: any) => {
        const typingUser: string = data?.sender;
        const derivedUser: any = _.find(participants, (userData: any) => {
          return userData?.username === typingUser;
        });
        const prefName = derivedUser?.preferedName || typingUser;
        const msg = `${prefName} is typing...`;

        setTypingUsersList((prevUsers: Array<string>) => {
          if (!prevUsers?.includes(typingUser) && typingUser !== authUserName) {
            return [...prevUsers, typingUser];
          }
          return prevUsers;
        });

        let typingUsersList = groupUserTypingState?.typingUsersList || [];
        let newList = cloneDeep(typingUsersList);
        // newList = [...typingUsersList, typingUser];
        newList = typingUser && typingUser !== authUserName ? [typingUser] : [];
        // typingUser && typingUser !== authUserName && newList?.push(typingUser);

        const userTypingStr = newList?.join(" ,");

        setGroupUserTypingState({
          groupId: data?.groupId,
          message: msg,
          typingUsersList: newList,
          userTypingStr,
        });
      });

      socket.on("hide-group-user-typing", (data: any) => {
        const typingUser: string = data?.sender;
        // let typingUsersList = groupUserTypingState?.typingUsersList || [];
        let filteredUserList = typingUsersList?.filter(
          (user: any) => user?.username !== typingUser
        );
        const userTypingStr = filteredUserList?.join(" ,");

        setTypingUsersList((prevUsers: Array<string>) => {
          const updatedUsers = prevUsers.filter((user) => user !== typingUser);
          return updatedUsers;
        });

        setGroupUserTypingState({
          groupId: data?.groupId,
          // message: msg,
          typingUsersList: filteredUserList,
          userTypingStr,
        });
      });
    }
  };

  useEffect(() => {
    // Initialize Socket.io connection

    //save contacts and groups
    setContactsAndGroups([...(groups || []), ...(contacts || [])]);

    // duo chat context
    duoChattingContext();

    // Group chat context
    groupChattingContext();

    // Clean up the socket connection when the component unmounts
    return () => {
      dispatch(saveContacts([]));
      socket && socket.off("loadmessages");
      socket && socket.off("load-group-messages");
      socket && socket.off("new_message");
      socket && socket.off("new_group_message");
      socket && socket.off("loadcontacts");
      socket && socket.off("show-group-user-typing");
      socket && socket.off("hide-group-user-typing");
      socket && socket.off("show-typing");
      socket && socket.off("hide-typing");
    };
  }, []);

  return (
    <>
      {/* {breakpoint === 0 && <div>Mobile View</div>}
      {breakpoint === 1 && <div>Tablet View</div>}
      {breakpoint === 2 && <div>Desktop View</div>}
      {breakpoint === 3 && <div>Large View</div>} */}
      <div className="box">
        <Box display="flex" height="100%">
          {!fullScreenChat && (
            <Sidebar
              typingUserList={typingUsersList}
              groupTypingData={groupUserTypingState}
              notifyChatData={notifyChatData}
              newMessages={newMessages}
              duoUsersTypingData={duoUsersTypingData}
              newGroupMessages={newGroupMessages}
              saveContactsAndGroups={saveContactsAndGroups}
              notifyCount={notifyCount}
              onRowClick={() => {
                if (breakpoint === 0) {
                  showFullScreenChat(true);
                }
              }}
            />
          )}

          {(breakpoint !== 0 || fullScreenChat) && (
            <Box display="flex" flexDirection="column" flexGrow={1}>
              {selectedUserName || selectedGrpId ? (
                <>
                  <Header
                    typingUserList={typingUsersList}
                    groupTypingData={groupUserTypingState}
                    duoUsersTypingData={duoUsersTypingData}
                    type={selectedGrpId ? "group" : "solo"}
                    handleMobileView={() => {
                      showFullScreenChat(false);
                    }}
                  />
                  <ChatWindow messages={messages} />
                  <MessageInput
                    callbackUserTyping={(value: string) => {
                      if (socket) {
                        const selGroupStr =
                          sessionStorage.getItem("selected-group");
                        const selGroupObj =
                          selGroupStr && selGroupStr !== "undefined"
                            ? JSON.parse(selGroupStr)
                            : {};
                        const selGrpId = selGroupObj?.id;

                        const currentSelUserStr = sessionStorage.getItem(
                          "current-selected-user"
                        );
                        const currSelUserObj =
                          currentSelUserStr && currentSelUserStr !== "undefined"
                            ? JSON.parse(currentSelUserStr)
                            : {};

                        const selUsername = currSelUserObj?.username;

                        const topic = selGrpId
                          ? "group-user-typing"
                          : "user-typing";
                        socket.emit(topic, {
                          sender: authUserName,
                          recipient: selUsername,
                          content: value,
                          groupId: selGrpId,
                          // fileUrl,
                          // fileType,
                          // fileName,
                        });
                      }
                    }}
                    sendMessage={(
                      receivedMsg: string,
                      fileUrl?: string,
                      fileType?: string,
                      fileName?: string
                    ) => {
                      if (socket) {
                        if (receivedMsg?.trim()) {
                          if (selectedGrpId) {
                            socket.emit("broadcast_new_message", {
                              content: receivedMsg,
                              groupId: selectedGrpId,
                              fileUrl,
                              fileType,
                              fileName,
                            });
                          } else if (selectedUserName) {
                            socket.emit("send_message", {
                              content: receivedMsg,
                              recipient: selectedUserName,
                              fileUrl,
                              fileType,
                              fileName,
                            });
                            dispatch(selectedGroupOrPerson(selectedUser));
                          }

                          const topic = selectedGrpId
                            ? "group-user-typing"
                            : "user-typing";
                          socket.emit(topic, {
                            sender: authUserName,
                            recipient: selectedUserName,
                            content: "",
                            groupId: selectedGrpId,
                            // fileUrl,
                            // fileType,
                            // fileName,
                          });
                        }
                      }
                    }}
                  />
                </>
              ) : (
                <>
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      textAlign: "center",
                      marginTop: "6rem",
                    }}
                  >
                    <img
                      src={require("./assets/newchat.jpg")}
                      height="50%"
                      width={"50%"}
                      alt="Logo"
                      style={{
                        aspectRatio: 3 / 2,
                        objectFit: "contain",
                        mixBlendMode: "darken",
                      }}
                    ></img>
                    <Typography variant="h4">
                      Start A New Chat with your friend
                    </Typography>
                  </div>{" "}
                </>
              )}
            </Box>
          )}
        </Box>
      </div>
    </>
  );
};

export default Chat;
