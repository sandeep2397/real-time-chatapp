import styled from "@emotion/styled";

export const SidebarContainer = styled("div")`
  width: 30%;
  background-color: #f0f0f0;
  display: flex;
  flex-direction: column;
`;

export const SidebarHeader = styled("div")`
  padding: 15px;
  background-color: #ededed;
`;

export const ContactsList = styled("div")`
  overflow-y: auto;
  flex-grow: 1;
`;
export const ContactItemContainer = styled("div")`
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;

  &:hover {
    background-color: #e0e0e0;
  }
`;

export const Timestamp = styled("span")`
  margin-left: auto;
  font-size: 0.75rem;
  color: #888;
`;
