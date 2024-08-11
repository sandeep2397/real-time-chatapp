import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Avatar, IconButton, Typography } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import {
  useSelectedGroupId,
  useSelectedUserName,
} from "../../hooks/customHook";
import { getBlobImageUrl } from "../../utils/blobImageUrl";
import { ContactInfo, HeaderActions, HeaderContainer } from "./Header.styles";

const Header: React.FC = () => {
  const selectedUser = useSelector((state: any) => state?.Common?.selectedUser);
  const selectedGrpId = useSelectedGroupId();
  const selectedUserName = useSelectedUserName();
  // const socket = useSelector((state: any) => state?.Common?.socket);

  // useEffect(()=>{

  //   return () => {
  //     socket && socket.off("new-chat");
  //   };
  // },[])
  const blobUrl = getBlobImageUrl(selectedUser?.image);

  return (
    <HeaderContainer>
      <Avatar src={blobUrl || "/path/to/avatar.jpg"} />
      <ContactInfo>
        <Typography variant="body1">{selectedUser?.preferedName}</Typography>
        <Typography variant="caption" color="textSecondary">
          {selectedUser?.description || "Online"}
        </Typography>
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
