import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Avatar, IconButton, Typography } from "@mui/material";
import React from "react";
import { ContactInfo, HeaderActions, HeaderContainer } from "./Header.styles";

const Header: React.FC = () => {
  return (
    <HeaderContainer>
      <Avatar src="/path/to/avatar.jpg" />
      <ContactInfo>
        <Typography variant="body1">John Doe</Typography>
        <Typography variant="caption" color="textSecondary">
          Online
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
