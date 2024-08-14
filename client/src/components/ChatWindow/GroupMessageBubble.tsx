import { Link, Typography } from "@mui/material";
import { teal } from "@mui/material/colors";
import _ from "lodash";
import { useSelector } from "react-redux";
import { useGetUserName } from "../../hooks/customHook";
import { GroupMsgContainer } from "./ChatWindow.styles";
import ReactPlayer from "react-player";
import React from "react";
import FileViewer from "../fileViewer/FileViewer";

interface props {
  sender: string;
  content: string;
  timestamp: string;
  fileUrl: string;
  fileType: string;
  fileName: string;
  groupId?: string;
}

const GroupMessageBubble = ({
  sender,
  content,
  timestamp,
  fileUrl,
  fileType,
  fileName,
  groupId,
}: props) => {
  const username = useGetUserName();

  const participants =
    useSelector((state: any) => state?.Common?.participants) || [];

  const [openModal, setModalOpen] = React.useState(false);

  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);
  // const savedColor: string = _.result(
  //   _.find(participants, (userData: any) => {
  //     return userData?.username === sender;
  //   }),
  //   "color"
  // );
  const derivedUser: any = _.find(participants, (userData: any) => {
    return userData?.username === sender;
  });

  const isMine = sender === username;
  return (
    <>
      <GroupMsgContainer
        isMine={isMine}
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: "60%",
          borderRadius: "10px",
          padding: "10px",
          margin: "10px 0",
          // color: "#333",
        }}
      >
        <Typography
          variant="subtitle2"
          style={{
            fontWeight: "bold",
            color: isMine ? teal[500] : derivedUser?.color ?? "#a7a7a7",
            marginBottom: "5px",
          }}
        >
          {isMine ? "You" : derivedUser?.preferedName || sender}
        </Typography>

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
        <Typography
          variant="body2"
          sx={{ marginBottom: "5px", lineHeight: 1.5 }}
        >
          {content}
        </Typography>
        <Typography
          variant="caption"
          sx={{ fontSize: "12px", color: "#888", textAlign: "right" }}
        >
          {timestamp}
        </Typography>
      </GroupMsgContainer>
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

export default GroupMessageBubble;
