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
import ReactPlayer from "react-player";
import {
  Button,
  Fade,
  LinearProgress,
  linearProgressClasses,
  Link,
  styled,
} from "@mui/material";
import {
  getDownloadURL,
  getMetadata,
  ref,
  updateMetadata,
  uploadBytesResumable,
} from "firebase/storage";
import { mediaDb } from "../../firebaseConfig";
import { v4 } from "uuid";
import { borderRadius } from "polished";
import FileViewer from "../fileViewer/FileViewer";

type props = {
  sendMessage: any;
};

const BorderLinearProgress = styled(LinearProgress)(({ theme }: any) => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: "#c3b4b4",
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.mode === "light" ? "#1a90ff" : "#308fe8",
  },
}));

const MessageInput: FC<props> = ({ sendMessage }: props) => {
  const [message, setMessage] = useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [mediaUrl, setMediaUrl]: any = useState("");
  const [file, setFile] = useState<any>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [chosenEmoji, setChosenEmoji] = useState(null);
  const [fileType, setFileType] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [openModal, setModalOpen] = React.useState(false);

  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files?.[0];
      if (file) {
        const blobUrl = URL.createObjectURL(file);
        setMediaUrl(blobUrl);
        setFile(file);
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

  const handleEmojiClick = (event: any) => {
    // Handle emoji click
    let messageWithEmoji = message + event.emoji;
    setMessage(messageWithEmoji);
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
          style={{ minHeight: "400px", minWidth: "1000px" }}
          onEmojiClick={handleEmojiClick}
        />
      )}
      <CustomMenu />
      {uploadProgress > 0 && (
        <Box
          sx={{
            width: "40%",
            position: "relative",
            alignSelf: "center",
            // top: "6px",
            // right: "8rem",
          }}
        >
          <BorderLinearProgress
            variant="determinate"
            value={Math.floor(uploadProgress)}
          />
          <Typography
            style={{ textAlign: "center", lineHeight: 1.5 }}
          >{`Upload In Progress...${Math.floor(uploadProgress)}%`}</Typography>
        </Box>
      )}

      {openModal && (
        <FileViewer
          open={openModal}
          handleOpen={handleModalOpen}
          handleClose={handleModalClose}
          fileType={file?.type}
          fileUrl={mediaUrl}
        />
      )}
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
              <div
              // style={{ border: "solid 1px #c9c9c9", borderRadius: "4px" }}
              >
                {" "}
                {file && file?.type?.includes("video") ? (
                  <div>
                    <ReactPlayer
                      playing
                      controls
                      volume={0}
                      height="80px"
                      width={"120px"}
                      playsinline
                      pip
                      muted
                      style={{
                        position: "relative",
                        // bottom: "10px",
                        padding: "4px",
                        minWidth: "200px",
                      }}
                      loop
                      // muted
                      url={mediaUrl}
                      // light={thumbnailUrl}
                      // light={require('../../assets/noImage.png')}
                      // url='https://www.youtube.com/watch?v=5986IgwaVKE&t=667s'
                      // light='https://example.com/thumbnail.jpg'
                    />
                  </div>
                ) : file && file?.type?.includes("image") ? (
                  // eslint-disable-next-line jsx-a11y/img-redundant-alt
                  <img
                    src={
                      mediaUrl ? mediaUrl : require("../../assets/noImage.png")
                    }
                    height="80px"
                    width={"120px"}
                    alt="Image/video"
                    style={{ padding: "8px" }}
                  />
                ) : file ? (
                  <Box
                    style={{
                      minWidth: "200px",
                      height: "40px",
                      margin: "0px 8px",
                      background: "#f3f8e4",
                      borderRadius: "4px",
                      textAlign: "center",
                    }}
                  >
                    {" "}
                    <Link
                      component="button"
                      variant="body2"
                      onClick={() => {
                        handleModalOpen();
                      }}
                      style={{ lineHeight: 4 }}
                    >
                      {file?.name}
                    </Link>{" "}
                  </Box>
                ) : (
                  <></>
                )}
              </div>{" "}
            </>
          }
          endAdornment={<></>}
          onChange={(e) => setMessage(e.target.value)}
        />

        {/* <CustomInput onSend={(e: any) => setMessage(e.target.value)} /> */}
        <SendButton
          style={{ height: "45px", width: "45px" }}
          disabled={message === "" || uploadProgress > 0}
          onClick={() => {
            if (file && file?.type) {
              let mediaRef = null;
              mediaRef = ref(mediaDb, `safe-chat/${file?.name + "_" + v4()}`);

              const storageRef = ref(
                mediaDb,
                `safe-chat/${file?.name + "_" + v4()}`
              );
              const uploadTask = uploadBytesResumable(storageRef, file);
              setUploadProgress(0.5);

              uploadTask.on(
                "state_changed",
                (snapshot) => {
                  const progress = Math.round(
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                  );
                  setUploadProgress(progress);
                },
                (error) => {
                  console.error("Upload error:", error);
                },
                // async () => {
                //   const uploadedMediaRef = uploadTask?.snapshot?.ref;
                //   let metadata: any = await getMetadata(uploadedMediaRef);
                //   metadata = {
                //     ...uploadTask?.snapshot?.ref,
                //     customMetadata: {
                //       fileName: file?.name,
                //     },
                //   };
                //   try {
                //     await updateMetadata(uploadedMediaRef, metadata);
                //   } catch (error: any) {
                //     console.error('Upload error ' + error);
                //     // setInvalidMedia(true);
                //   }
                // }

                async () => {
                  getDownloadURL(uploadTask.snapshot.ref).then(
                    async (url: any) => {
                      // setDownloadURL(url);
                      const uploadedMediaRef = uploadTask?.snapshot?.ref;
                      console.log("File available at", url);
                      let metadata: any = await getMetadata(uploadedMediaRef);
                      metadata = {
                        ...uploadTask?.snapshot?.ref,
                        customMetadata: {
                          fileName: file?.name,
                        },
                      };
                      try {
                        await updateMetadata(uploadedMediaRef, metadata);
                      } catch (error: any) {
                        console.error("Upload error " + error);
                        // setInvalidMedia(true);
                      }

                      setMessage("");
                      sendMessage(message, url, file?.type, file?.name);
                      setUploadProgress(0);

                      setFile(null);
                    }
                  );
                }
              );
            } else {
              setMessage("");
              sendMessage(message);
            }
          }}
        >
          <SendIcon />
        </SendButton>
      </MessageInputContainer>
    </>
  );
};

export default MessageInput;
