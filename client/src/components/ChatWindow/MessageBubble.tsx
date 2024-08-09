import { Typography } from "@mui/material";
import React from "react";
import { useGetUserName } from "../../hooks/customHook";
import { MessageBubble as BubbleContainer } from "./ChatWindow.styles";

interface MessageBubbleProps {
  sender: string;
  content: string;
  timestamp: string;
  type: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  sender,
  content,
  timestamp,
}) => {
  const username = useGetUserName();
  return (
    <BubbleContainer isMine={sender === username}>
      <Typography>{content}</Typography>
      <Typography variant="caption" color="textSecondary">
        {timestamp}
      </Typography>
    </BubbleContainer>
  );
};

export default MessageBubble;
