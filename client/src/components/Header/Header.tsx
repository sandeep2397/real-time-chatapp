import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Avatar, IconButton, Typography } from "@mui/material";
import React, { FC, useContext, useEffect, useState } from "react";
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

interface props {
  type: "group" | "solo";
  groupTypingData: any;
  typingUserList: any;
  duoUsersTypingData: string[];
}

const Header: FC<props> = ({
  type,
  groupTypingData,
  typingUserList,
  duoUsersTypingData,
}: props) => {
  const selectedUser = useSelector((state: any) => state?.Common?.selectedUser);
  const selectedGrpId = useSelectedGroupId();

  // const typingUsersList = groupTypingData?.typingUsersList || [];
  // const userTypingStr = groupTypingData?.userTypingStr || "";
  const typingGroupId = groupTypingData?.groupId || "";

  const userTypingStr = typingUserList?.join(" , ");

  const authUserName = useGetUserName();
  const selectedUserName = useSelectedUserName();

  // const socket = useSelector((state: any) => state?.Common?.socket);
  const socket = useContext(SocketContext);
  const isTyping = duoUsersTypingData?.includes(selectedUserName);

  const blobUrl = getBlobImageUrl(selectedUser?.image);
  return (
    <HeaderContainer>
      <Avatar src={blobUrl || "/path/to/avatar.jpg"} />
      <ContactInfo>
        <Typography variant="body1">{selectedUser?.preferedName}</Typography>

        {isTyping && type === "solo" ? (
          <Typography
            style={{
              color: teal[400],
              fontWeight: 400,
            }}
          >
            {"typing...."}
          </Typography>
        ) : selectedUserName && type === "solo" ? (
          <Typography variant="caption" color="textSecondary">
            {selectedUser?.description || "Online"}
          </Typography>
        ) : (
          <>
            {/* {
              typingUsersList?.length === 0
            } */}
            <Typography variant="caption" color="textSecondary">
              {selectedUser?.description}
            </Typography>{" "}
          </>
        )}
        {typingUserList?.length > 0 && typingGroupId === selectedGrpId && (
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
