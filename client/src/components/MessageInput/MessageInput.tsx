import SendIcon from "@mui/icons-material/Send";
import { FC, useState } from "react";
import {
  InputField,
  MessageInputContainer,
  SendButton,
} from "./MessageInput.styles";
import CustomInput from "./CustomInput";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import PersonAdd from "@mui/icons-material/PersonAdd";
import Settings from "@mui/icons-material/Settings";
import { FileCopy, PhotoAlbum } from "@mui/icons-material";
import Logout from "@mui/icons-material/Logout";
import { MdAttachFile, MdEmojiEmotions } from "react-icons/md";
import { useDropzone } from "react-dropzone";
import React from "react";
import EmojiPicker from "emoji-picker-react";
import { FaFile } from "react-icons/fa";
import { Fade } from "@mui/material";

type props = {
  sendMessage: any;
};

const MessageInput: FC<props> = ({ sendMessage }: props) => {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<any>({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [mediaUrl, setMediaUrl]: any = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [fileType, setFileType] = useState("");

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files?.[0];
      if (file) {
        const blobUrl = URL.createObjectURL(file);
        setMediaUrl(blobUrl);
      }
      console.log("Selected file:", files[0]);
      setAnchorEl(null);

      // Handle file upload or processing here
    }
  };

  // const { getRootProps, getInputProps } = useDropzone({
  //   onDrop: (acceptedFiles) => {
  //     setFile({ type: "file", files: acceptedFiles });
  //   },
  // });

  //   const sendMessage = () => {
  //     // Logic to send message
  //     setMessage("");
  //   };

  const handlePopoverClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    // if (fileInputRef.current) {
    //   fileInputRef.current.click();
    // }
    setAnchorEl(null);
  };

  const handleMenuItemClick = (type: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    setFileType(type);
  };

  const handleEmojiClick = (event: any, emojiObject: any) => {
    // Handle emoji click
  };

  const CustomMenu = () => {
    return (
      <>
        {" "}
        <Menu
          id="fade-menu"
          MenuListProps={{
            "aria-labelledby": "fade-button",
          }}
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          TransitionComponent={Fade}
          anchorOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <MenuItem
            onClick={() => {
              handleMenuItemClick(".pdf,.doc,.docx,.xls,.xlsx,.txt");
            }}
          >
            <ListItemIcon>
              <FileCopy color="primary" fontSize="small" />
            </ListItemIcon>
            Document
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleMenuItemClick(".jpg,.png,.mp4,.svg,.jpeg,.avi,.mkv");
            }}
          >
            <ListItemIcon>
              <PhotoAlbum color="secondary" fontSize="small" />
            </ListItemIcon>
            Photos & Videos
          </MenuItem>
        </Menu>
      </>
    );
  };

  return (
    <>
      {showEmojiPicker && (
        <EmojiPicker
          style={{ minHeight: "300px", minWidth: "800px" }}
          onEmojiClick={handleEmojiClick}
        />
      )}
      <CustomMenu />
      <MessageInputContainer>
        <InputField
          placeholder="Type a message"
          value={message}
          onKeyDown={(event: any) => {
            if (event.key === "Enter") {
              event.preventDefault(); // Prevent the default action if it's a form submission
              setMessage("");
              sendMessage(message);
              // Call the function to send the message
            }
          }}
          startAdornment={
            <>
              <IconButton
                size="medium"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <MdEmojiEmotions />
              </IconButton>
              <input
                type="file"
                accept={fileType}
                ref={fileInputRef}
                style={{ display: "none" }} // This hides the file input
                onChange={handleFileChange}
              />
              <IconButton
                onClick={handlePopoverClick}
                size="medium"
                // sx={{ ml: 2 }}
                aria-controls={open ? "account-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
              >
                <MdAttachFile />
              </IconButton>
            </>
          }
          onChange={(e) => setMessage(e.target.value)}
        />

        {/* <CustomInput onSend={(e: any) => setMessage(e.target.value)} /> */}
        <SendButton
          style={{ height: "45px", width: "45px" }}
          disabled={message === ""}
          onClick={() => {
            setMessage("");
            sendMessage(message);
          }}
        >
          <SendIcon />
        </SendButton>
      </MessageInputContainer>
    </>
  );
};

export default MessageInput;
