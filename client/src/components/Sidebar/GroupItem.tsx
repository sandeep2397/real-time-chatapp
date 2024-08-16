import {
  Avatar,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import { grey, teal } from "@mui/material/colors";
import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SocketContext } from "../../App";
import { useGetUserName, useSelectedGroupId } from "../../hooks/customHook";
import { selectedGroupOrPerson } from "../../redux/root_actions";
import { getBlobImageUrl } from "../../utils/blobImageUrl";
import { ContactItemContainer, Timestamp } from "./Sidebar.styles";
import { cloneDeep } from "lodash";
import "../../App.css";

interface Props {
  name: string;
  description: string;
  _id: string;
  groupImage: string;
  lastMessage?: string;
  timestamp?: string;
  groupTypingData?: any;
  typingUserList: any;
  newGroupMessages?: Array<any>;
}

const GroupItem: React.FC<Props> = ({
  _id,
  name,
  description,
  groupImage,
  lastMessage,
  timestamp,
  groupTypingData,
  typingUserList,
  newGroupMessages,
}) => {
  const dispatch = useDispatch();
  const authUserName = useGetUserName();
  const selectedGrpId = useSelectedGroupId();

  const userRegex = /^\d+$/;
  const selectedUser = useSelector((state: any) => state?.Common?.selectedUser);
  const participants =
    useSelector((state: any) => state?.Common?.participants) || [];

  // const typingUsersList = groupTypingData?.typingUsersList || [];
  // const userTypingStr = groupTypingData?.userTypingStr || "";
  const userTypingStr = typingUserList?.join(" , ");
  const typingGroupId = groupTypingData?.groupId || "";
  // const [typingUsersList, setTypingUsersList] = useState<any>([]);
  // const [typingUserString, setTypingUserString] = useState<any>("");
  // const currentSelUserStr = sessionStorage.getItem("current-selected-user");
  // const currSelUserObj =
  //   currentSelUserStr && currentSelUserStr !== "undefined"
  //     ? JSON.parse(currentSelUserStr)
  //     : {};

  const rowUserRecvdMsgs = newGroupMessages?.filter((data: any) => {
    return data?.groupId === _id;
  });

  const shouldHighlight = selectedGrpId === _id;
  // const socket = useSelector((state: any) => state?.Common?.socket);
  const socket = useContext(SocketContext);
  // const shouldShowNotification = selectedUserName === authUserName;

  const blobUrl = getBlobImageUrl(groupImage);

  const [className, setClassName] = useState("group-item");

  useEffect(() => {
    setClassName("group-item group-item-enter");

    const timer = setTimeout(() => {
      setClassName("group-item");
    }, 300);

    return () => clearTimeout(timer);
  }, [_id]);

  return (
    <ContactItemContainer
      style={{
        backgroundColor: shouldHighlight ? `#88dabc` : "#fff",
      }}
      className={className}
      onClick={() => {
        if (socket) {
          socket.emit("new-group-chat", {
            groupId: _id,
            // recipient: name,
          });
        }

        const groupObj = {
          type: "group",
          id: _id,
        };

        sessionStorage.setItem("selected-group", JSON.stringify(groupObj));
        sessionStorage.removeItem("current-selected-user");
        dispatch(
          selectedGroupOrPerson({
            _id,
            preferedName: name,
            description,
            image: groupImage,
            lastMessage,
            timestamp,
          })
        );
      }}
    >
      <ListItemAvatar>
        <Avatar
          alt={"Group"}
          sx={{ bgcolor: grey?.[500], width: 32, height: 32 }}
          src={blobUrl}
        />
      </ListItemAvatar>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <ListItemText primary={name} secondary={lastMessage} />
        {typingUserList?.length > 0 && typingGroupId === _id && (
          <Typography
            style={{
              color: teal[400],
              fontWeight: 400,
            }}
          >
            {typingUserList?.length === 1
              ? `${userTypingStr} is typing....`
              : `${userTypingStr} are typing....`}
          </Typography>
        )}
      </div>
      <Timestamp>{timestamp}</Timestamp>
      {Array.isArray(rowUserRecvdMsgs) && rowUserRecvdMsgs?.length > 0 && (
        // !currChattingUser &&
        // notifyChatData?.recipient === username &&
        <div
          style={{
            height: "25px",
            width: "25px",
            background: "#25d366",
            borderRadius: "50%",
            textAlign: "center",
          }}
        >
          <span style={{ color: "#fff", lineHeight: 1.6, fontSize: "14px" }}>
            {rowUserRecvdMsgs?.length}
          </span>
        </div>
      )}
    </ContactItemContainer>
  );
};

export default GroupItem;
