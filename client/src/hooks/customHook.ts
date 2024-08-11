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

export const useSelectedGroupId = () => {
  const selGroupStr = sessionStorage.getItem("selected-group");
  const selGroupObj =
    selGroupStr && selGroupStr !== "undefined" ? JSON.parse(selGroupStr) : {};

  const selGrpId = selGroupObj?.id;
  return selGrpId || "";
};
