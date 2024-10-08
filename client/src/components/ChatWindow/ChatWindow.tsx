import { FC, useEffect, useRef } from "react";
import {
  useSelectedGroupId,
  useSelectedUserName,
} from "../../hooks/customHook";
import { ChatWindowContainer } from "./ChatWindow.styles";
import GroupMessageBubble from "./GroupMessageBubble";
import MessageBubble from "./MessageBubble";

type props = {
  messages: any;
};
const ChatWindow: FC<props> = ({ messages }: props) => {
  const endOfMessages: any = useRef();
  const selectedGrpId = useSelectedGroupId();
  const selectedUserName = useSelectedUserName();

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
      {messages.map((message: any, index: number) =>
        selectedGrpId ? (
          <GroupMessageBubble key={index} {...message} />
        ) : (
          <MessageBubble key={index} {...message} />
        )
      )}
      <div ref={endOfMessages}></div>
    </ChatWindowContainer>
  );
};

export default ChatWindow;
