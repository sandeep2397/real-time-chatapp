import { Cookies } from "react-cookie";

export const isUserAuthenticated = (): boolean => {
  let cookies = new Cookies();
  // const session = cookies.get("user-info");
  const session = sessionStorage.getItem("user");
  if (session) {
    return true;
  }
  return false;
};

export const removeSession = () => {
  // let cookies = new Cookies();
  // cookies.remove("user-info", {
  //   path: "/",
  // });

  sessionStorage.removeItem("user");
};
