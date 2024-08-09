/*
©2022 Pivotree | All rights reserved
*/
import { Navigate, useLocation } from "react-router";
import { isUserAuthenticated } from "./utils/auth";

export const LoginRoute = ({ children }: { children: JSX.Element }) => {
  const location = useLocation();
  const isAuthTokenValid = isUserAuthenticated();
  if (isAuthTokenValid) {
    return <Navigate to="/home" state={{ from: location }} />;
  }

  return children;
};
