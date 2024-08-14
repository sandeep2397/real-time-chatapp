import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Avatar, IconButton, Typography } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  useGetUserName,
  useSelectedGroupId,
  useSelectedUserName,
} from "../../hooks/customHook";
import { getBlobImageUrl } from "../../utils/blobImageUrl";
import { ContactInfo, HeaderActions, HeaderContainer } from "./Header.styles";
import { SocketContext } from "../../App";
import { cloneDeep } from "lodash";
import { teal } from "@mui/material/colors";

const Header: React.FC = () => {
  const selectedUser = useSelector((state: any) => state?.Common?.selectedUser);
  const selectedGrpId = useSelectedGroupId();
  const authUserName = useGetUserName();
  const selectedUserName = useSelectedUserName();

  // const socket = useSelector((state: any) => state?.Common?.socket);
  const socket = useContext(SocketContext);
  const [typingUsersList, setTypingUsersList] = useState<any>([]);
  const [typingUserString, setTypingUserString] = useState<any>("");
  const [currGrpId, setCurGrpId] = useState<any>("");
  const [isTyping, setTyping] = useState(false);

  useEffect(() => {
    if (socket) {
      socket.on("show-typing", (data: any) => {
        if (data?.sender === selectedUserName) {
          setTyping(true);
        }
      });

      socket.on("hide-typing", (data: any) => {
        if (data?.sender === selectedUserName) {
          setTyping(false);
        }
      });

      socket.on("show-group-user-typing", (data: any) => {
        if (selectedGrpId === data?.groupId) {
          const typingUser: string = data?.sender;
          let newList = cloneDeep(typingUsersList);
          // newList = [...typingUsersList, typingUser];
          typingUser &&
            typingUser !== authUserName &&
            newList?.push(typingUser);
          const userStr = newList?.join(" ,");
          setTypingUsersList(newList);
          setCurGrpId(selectedGrpId);
          setTypingUserString(userStr);
        }
      });

      socket.on("hide-group-user-typing", (data: any) => {
        if (selectedGrpId === data?.groupId) {
          const typingUser: string = data?.sender;
          let newList = cloneDeep(typingUsersList);
          let filteredUserList = typingUsersList?.filter(
            (user: any) => user?.username !== typingUser
          );
          const userStr = filteredUserList?.join(" ,");
          setCurGrpId(selectedGrpId);
          setTypingUserString(userStr);
          setTypingUsersList(filteredUserList);
        }
      });
    }
    // Clean up the socket connection when the component unmounts
    return () => {
      socket && socket.off("show-group-user-typing");
      socket && socket.off("hide-group-user-typing");
    };
  }, []);

  const blobUrl = getBlobImageUrl(selectedUser?.image);
  const sameGrp = currGrpId === selectedGrpId;
  return (
    <HeaderContainer>
      <Avatar src={blobUrl || "/path/to/avatar.jpg"} />
      <ContactInfo>
        <Typography variant="body1">{selectedUser?.preferedName}</Typography>
        <Typography variant="caption" color="textSecondary">
          {selectedUser?.description || "Online"}
        </Typography>
        {isTyping && (
          <Typography
            style={{
              color: teal[400],
              fontWeight: 400,
            }}
          >
            {"typing...."}
          </Typography>
        )}
        {typingUsersList?.length > 0 && sameGrp && (
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
      </ContactInfo>
      <HeaderActions>
        <IconButton>
          <MoreVertIcon />
        </IconButton>
      </HeaderActions>
    </HeaderContainer>
  );
};

export default Header;
