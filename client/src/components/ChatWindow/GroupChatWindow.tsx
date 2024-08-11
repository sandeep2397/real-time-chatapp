import { FC, useEffect, useRef } from "react";
import { ChatWindowContainer } from "./ChatWindow.styles";
import GroupMessageBubble from "./GroupMessageBubble";

type props = {
  messages: any;
};
const GroupChatWindow: FC<props> = ({ messages }: props) => {
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
        <GroupMessageBubble key={index} {...message} />
      ))}
      <div ref={endOfMessages}></div>
    </ChatWindowContainer>
  );
};

export default GroupChatWindow;
