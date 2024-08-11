import { Typography } from "@mui/material";
import { teal } from "@mui/material/colors";
import _ from "lodash";
import { useSelector } from "react-redux";
import { useGetUserName } from "../../hooks/customHook";
import { GroupMsgContainer } from "./ChatWindow.styles";

interface props {
  sender: string;
  content: string;
  timestamp: string;
  groupId?: string;
}

const GroupMessageBubble = ({ sender, content, timestamp, groupId }: props) => {
  const username = useGetUserName();
  const participants =
    useSelector((state: any) => state?.Common?.participants) || [];
  const savedColor: string = _.result(
    _.find(participants, (userData: any) => {
      return userData?.username === sender;
    }),
    "color"
  );

  const isMine = sender === username;
  return (
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
          color: isMine ? teal[500] : savedColor ?? "#a7a7a7",
          marginBottom: "5px",
        }}
      >
        {isMine ? "You" : sender}
      </Typography>
      <Typography variant="body2" sx={{ marginBottom: "5px", lineHeight: 1.5 }}>
        {content}
      </Typography>
      <Typography
        variant="caption"
        sx={{ fontSize: "12px", color: "#888", textAlign: "right" }}
      >
        {timestamp}
      </Typography>
    </GroupMsgContainer>
  );
};

export default GroupMessageBubble;
