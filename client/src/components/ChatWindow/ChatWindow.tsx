import { FC, useEffect, useRef } from "react";
import { ChatWindowContainer } from "./ChatWindow.styles";
import MessageBubble from "./MessageBubble";

type props = {
  messages: any;
};
const ChatWindow: FC<props> = ({ messages }: props) => {
  const endOfMessages: any = useRef();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    endOfMessages &&
      endOfMessages?.current &&
      endOfMessages.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <ChatWindowContainer>
      {messages.map((message: any, index: number) => (
        <MessageBubble key={index} {...message} />
      ))}
      <div ref={endOfMessages}></div>
    </ChatWindowContainer>
  );
};

export default ChatWindow;
