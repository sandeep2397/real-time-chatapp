import SendIcon from "@mui/icons-material/Send";
import React, { useState } from "react";
import {
  InputField,
  MessageInputContainer,
  SendButton,
} from "./MessageInput.styles";

const MessageInput: React.FC = () => {
  const [message, setMessage] = useState("");

  const sendMessage = () => {
    // Logic to send message
    setMessage("");
  };

  return (
    <MessageInputContainer>
      <InputField
        placeholder="Type a message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <SendButton onClick={sendMessage}>
        <SendIcon />
      </SendButton>
    </MessageInputContainer>
  );
};

export default MessageInput;
