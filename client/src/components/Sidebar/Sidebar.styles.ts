import styled from "@emotion/styled";

export const SidebarContainer = styled("div")`
  width: 30%;
  background-color: #fff;
  display: flex;
  flex-direction: column;
`;

export const SidebarHeader = styled("div")`
  padding: 15px;
  background-color: #f8f7f7;
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
    background: #ededed !important;
  }
`;

export const Timestamp = styled("span")`
  margin-left: auto;
  font-size: 0.75rem;
  color: #888;
`;
