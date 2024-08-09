import SendIcon from "@mui/icons-material/Send";
import { FC, useState } from "react";
import {
  InputField,
  MessageInputContainer,
  SendButton,
} from "./MessageInput.styles";

type props = {
  sendMessage: any;
};

const MessageInput: FC<props> = ({ sendMessage }: props) => {
  const [message, setMessage] = useState("");

  //   const sendMessage = () => {
  //     // Logic to send message
  //     setMessage("");
  //   };

  return (
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
        onChange={(e) => setMessage(e.target.value)}
      />
      <SendButton
        onClick={() => {
          setMessage("");
        }}
      >
        <SendIcon />
      </SendButton>
    </MessageInputContainer>
  );
};

export default MessageInput;
