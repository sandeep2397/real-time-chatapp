export const useGetUserName = () => {
  const authUserStr = sessionStorage.getItem("user");
  const userInfo =
    authUserStr && authUserStr !== "undefined" ? JSON.parse(authUserStr) : {};

  const username = userInfo?.username;
  return username || "";
};

export const useSelectedUserName = () => {
  const currentSelUserStr = sessionStorage.getItem("current-selected-user");
  const currSelUserObj =
    currentSelUserStr && currentSelUserStr !== "undefined"
      ? JSON.parse(currentSelUserStr)
      : {};

  const selUsername = currSelUserObj?.username;
  return selUsername || "";
};
