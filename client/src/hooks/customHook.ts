export const useGetUserName = () => {
  const userInfo = JSON.parse(sessionStorage.getItem("user") || "");
  const username = userInfo?.username;
  return username || "";
};
