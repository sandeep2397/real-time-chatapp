import { Typography } from "@mui/material";
import React from "react";
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
  return (
    <BubbleContainer isMine={sender === "Me"}>
      <Typography>{content}</Typography>
      <Typography variant="caption" color="textSecondary">
        {timestamp}
      </Typography>
    </BubbleContainer>
  );
};

export default MessageBubble;
