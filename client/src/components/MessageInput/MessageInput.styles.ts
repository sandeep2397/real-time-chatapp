import styled from "@emotion/styled";
import { IconButton, InputBase } from "@mui/material";

export const MessageInputContainer = styled("div")`
  display: flex;
  padding: 10px;
  background-color: #ededed;
`;

export const InputField = styled(InputBase)`
  flex-grow: 1;
  padding: 10px;
  border-radius: 20px;
  background-color: #ffffff;
`;

export const SendButton = styled(IconButton)`
  margin-left: 10px;
  background-color: #128c7e;
  color: #ffffff;

  &:hover {
    background-color: #075e54;
  }
`;
