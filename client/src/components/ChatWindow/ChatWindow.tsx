import { FC } from "react";
import { ChatWindowContainer } from "./ChatWindow.styles";
import MessageBubble from "./MessageBubble";

type props = {
  messages: any;
};
const ChatWindow: FC<props> = ({ messages }: props) => {
  return (
    <ChatWindowContainer>
      {messages.map((message: any, index: number) => (
        <MessageBubble key={index} {...message} />
      ))}
    </ChatWindowContainer>
  );
};

export default ChatWindow;
