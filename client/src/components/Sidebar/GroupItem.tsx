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

interface Props {
  name: string;
  description: string;
  _id: string;
  groupImage: string;
  lastMessage?: string;
  timestamp?: string;
}

const GroupItem: React.FC<Props> = ({
  _id,
  name,
  description,
  groupImage,
  lastMessage,
  timestamp,
}) => {
  const dispatch = useDispatch();
  const authUserName = useGetUserName();
  const selectedGrpId = useSelectedGroupId();

  const userRegex = /^\d+$/;
  const selectedUser = useSelector((state: any) => state?.Common?.selectedUser);
  const participants =
    useSelector((state: any) => state?.Common?.participants) || [];

  const [typingUsersList, setTypingUsersList] = useState<any>([]);
  const [typingUserString, setTypingUserString] = useState<any>("");
  // const currentSelUserStr = sessionStorage.getItem("current-selected-user");
  // const currSelUserObj =
  //   currentSelUserStr && currentSelUserStr !== "undefined"
  //     ? JSON.parse(currentSelUserStr)
  //     : {};

  const shouldHighlight = selectedGrpId === _id;
  // const socket = useSelector((state: any) => state?.Common?.socket);
  const socket = useContext(SocketContext);

  const blobUrl = getBlobImageUrl(groupImage);

  useEffect(() => {
    if (socket && shouldHighlight) {
      socket.on("show-group-user-typing", (data: any) => {
        const typingUser: string = data?.sender;
        let newList = cloneDeep(typingUsersList);
        // newList = [...typingUsersList, typingUser];
        typingUser && typingUser !== authUserName && newList?.push(typingUser);
        const userStr = newList?.join(" ,");
        setTypingUsersList(newList);
        setTypingUserString(userStr);
      });

      socket.on("hide-group-user-typing", (data: any) => {
        const typingUser: string = data?.sender;
        let newList = cloneDeep(typingUsersList);
        let filteredUserList = typingUsersList?.filter(
          (user: any) => user?.username !== typingUser
        );
        const userStr = filteredUserList?.join(" ,");
        setTypingUserString(userStr);
        setTypingUsersList(filteredUserList);
      });
    }
    // Clean up the socket connection when the component unmounts
    return () => {
      socket && socket.off("show-group-user-typing");
      socket && socket.off("hide-group-user-typing");
    };
  }, []);

  return (
    <ContactItemContainer
      style={{
        backgroundColor: shouldHighlight ? `#88dabc` : "#fff",
      }}
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
        {typingUsersList?.length > 0 && (
          <Typography
            style={{
              color: teal[400],
              fontWeight: 400,
            }}
          >
            {typingUsersList?.length === 1
              ? `${typingUserString} is typing....`
              : `${typingUserString} are typing....`}
          </Typography>
        )}
      </div>
      <Timestamp>{timestamp}</Timestamp>
    </ContactItemContainer>
  );
};

export default GroupItem;
