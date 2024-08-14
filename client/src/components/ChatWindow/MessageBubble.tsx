import { Link, Typography } from "@mui/material";
import React from "react";
import { useGetUserName } from "../../hooks/customHook";
import { MessageBubble as BubbleContainer } from "./ChatWindow.styles";
import ReactPlayer from "react-player";
import FileViewer from "../fileViewer/FileViewer";

interface MessageBubbleProps {
  sender: string;
  content: string;
  timestamp: string;
  type: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  sender,
  content,
  timestamp,
  fileUrl,
  fileName,
  fileType,
}) => {
  const username = useGetUserName();
  const [openModal, setModalOpen] = React.useState(false);

  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);

  return (
    <>
      <BubbleContainer isMine={sender === username}>
        <div
        // style={{ border: "solid 1px #c9c9c9", borderRadius: "4px" }}
        >
          {" "}
          {fileUrl && fileType?.includes("video") ? (
            <div>
              <ReactPlayer
                playing={false}
                controls
                volume={0}
                height="120px"
                width={"200px"}
                playsinline
                pip
                muted={true}
                style={{
                  position: "relative",
                  // bottom: "10px",
                  padding: "4px",
                  minWidth: "200px",
                }}
                loop
                // muted
                url={fileUrl}
                // light={thumbnailUrl}
                // light={require('../../assets/noImage.png')}
                // url='https://www.youtube.com/watch?v=5986IgwaVKE&t=667s'
                // light='https://example.com/thumbnail.jpg'
              />
            </div>
          ) : fileUrl && fileType?.includes("image") ? (
            // eslint-disable-next-line jsx-a11y/img-redundant-alt
            <img
              src={fileUrl}
              height="120px"
              width={"200px"}
              alt="Image"
              style={{ padding: "8px" }}
            />
          ) : fileUrl ? (
            <>
              {" "}
              <Link
                component="button"
                variant="body2"
                onClick={() => {
                  handleModalOpen();
                }}
                style={{ lineHeight: 4 }}
              >
                {fileName}
              </Link>{" "}
            </>
          ) : (
            <></>
          )}
        </div>
        <Typography>{content}</Typography>
        <Typography variant="caption" color="textSecondary">
          {timestamp}
        </Typography>
      </BubbleContainer>
      {openModal && (
        <FileViewer
          open={openModal}
          handleOpen={handleModalOpen}
          handleClose={handleModalClose}
          fileType={fileType}
          fileUrl={fileUrl}
        />
      )}
    </>
  );
};

export default MessageBubble;
