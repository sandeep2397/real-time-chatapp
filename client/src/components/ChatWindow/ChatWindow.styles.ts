import styled from "@emotion/styled";

export const ChatWindowContainer = styled("div")`
  flex-grow: 1;
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

export const MessageBubble = styled("div")<{ isMine: boolean }>`
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  max-width: 60%;
  padding: 10px;
  border-radius: 10px;
  align-self: ${({ isMine }) => (isMine ? "flex-end" : "flex-start")};
  background-color: ${({ isMine }) => (isMine ? "#dcf8c6" : "#ffffff")};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

export const GroupMsgContainer = styled("div")<{ isMine: boolean }>`
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  max-width: 60%;
  padding: 10px;
  border-radius: 10px;
  align-self: ${({ isMine }) => (isMine ? "flex-end" : "flex-start")};
  background-color: ${({ isMine }) => (isMine ? "#dcf8c6" : "#ffffff")};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;
