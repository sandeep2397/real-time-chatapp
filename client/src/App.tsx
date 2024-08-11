import { css, Global } from "@emotion/react";
import {
  blue,
  lightGreen,
  orange,
  pink,
  purple,
  red,
  yellow,
} from "@mui/material/colors";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import React, { FC, Suspense, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { io, Socket } from "socket.io-client";
import ErrorBoundary from "./Errorboundary";
import {
  useGetUserName,
  useSelectedGroupId,
  useSelectedUserName,
} from "./hooks/customHook";
import { LoginRoute } from "./LoginRoute";
import { PrivateRoute } from "./PrivateRoute";
import {
  saveContacts,
  saveGroupParticipants,
  saveGroups,
} from "./redux/root_actions";
import { routes } from "./routes";
import { isUserAuthenticated } from "./utils/auth";
interface Props {
  theme?: any;
  Authentication?: any;
}

const loading = () => <div></div>;
export const SocketContext = React.createContext<any>(null);

const App: FC<Props> = (props: Props) => {
  const location = useLocation();
  const navigate = useNavigate();
  // const match = useMatch();
  const params: any = useParams();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Record<string, any>[]>([]);

  const socketEndpoint = `https://real-time-chatapp-kr2f.onrender.com`;
  // const socketEndpoint = "http://localhost:4001"; // Your server's URL
  const dispatch = useDispatch();
  const authUserName = useGetUserName();
  const selectedUserName = useSelectedUserName();
  const selectedGrpId = useSelectedGroupId();

  useEffect(() => {
    window.onpopstate = (e) => {
      let userAuth = isUserAuthenticated();
      if (location?.pathname === "/login" && userAuth) {
        navigate("/home");
      }
    };
  });

  const gettheme = () => {
    const theme = createTheme({
      typography: {
        body1: { fontFamily: "Arial" },
        body2: { fontFamily: "Arial", fontWeight: "normal" },
        fontSize: 12,
      },
      palette: {
        primary: {
          light: "#611f69",
          main: "#303f9f",
          dark: "#434343",
          contrastText: "#fff",
        },
        secondary: {
          light: "#ff7961",
          main: "#f44336",
          dark: "#a7a7a7",
          contrastText: "#000",
        },
        success: {
          light: "#008000",
          main: "#008000",
        },
        info: {
          light: "#5e35b1",
          main: "#5e35b1",
        },
        error: {
          light: "#b71c1c",
          main: "#b71c1c",
        },
        warning: {
          light: "#ff6f00",
          main: "#ff6f00",
        },
      },
    });
    return theme;
  };

  useEffect(() => {
    const handleUnhandledRejection = (event: any) => {
      // Log the unhandled rejection
      console.error("Unhandled promise rejection:", event.reason);
      // Optionally, you can perform additional actions here
    };
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, []);

  useEffect(() => {
    // Handling on refresh

    const storedSocketId = sessionStorage.getItem("socketId");
    // const socketIdObj =
    //   socketIdStr && socketIdStr !== "undefined" ? JSON.parse(socketIdStr) : {};
    // const storedSocketId = socketIdObj?.socketId;
    if (storedSocketId) {
      // Initialize socket connection
      const refresedSocket = io(socketEndpoint, {
        query: { socketId: storedSocketId, username: authUserName },
        transports: ["websocket"],
      });

      setSocket(refresedSocket);
      // Save socket ID to session storage
      refresedSocket.on("connect", () => {
        // sessionStorage.setItem("socketId", newSocket.id || "");
        console.log("Reconnected to server");
      });
      refresedSocket.emit("join", authUserName);

      if (selectedUserName) {
        refresedSocket.emit("new-user-chat", {
          sender: authUserName,
          recipient: selectedUserName,
        });
      } else if (selectedGrpId) {
        refresedSocket.emit("new-group-chat", {
          groupId: selectedGrpId,
        });
      }

      refresedSocket.on("loadgroups", (groups: any) => {
        dispatch(saveGroups(groups));
      });

      refresedSocket.on("loadcontacts", (contacts: any) => {
        dispatch(saveContacts(contacts));
      });

      refresedSocket.on("loadmessages", (msgs) => {
        // sessionStorage.setItem("socketId", newSocket.id || "");
        console.log("Refreshed loaded messages====>", msgs);
        setMessages(msgs);
      });

      refresedSocket.on("load-group-messages", (groupData: any) => {
        // sessionStorage.setItem("socketId", newSocket.id || "");
        console.log("Refreshed loaded Group messages====>", groupData);
        const colors: any = {
          color0: yellow[700],
          color1: red[400],
          color2: blue[400],
          color3: orange[400],
          color4: purple[400],
          color5: lightGreen[400],
          color6: pink[400],
          color7: yellow[400],
        };
        const saveParticipants = groupData?.participants?.map(
          (data: any, index: number) => {
            return {
              ...data,
              color: colors?.[`color${index}`] || "#434343",
            };
          }
        );
        dispatch(saveGroupParticipants(saveParticipants));
        setMessages(groupData?.messages);
      });
    }

    return () => {
      socket && socket.disconnect();
      socket && socket.off("loadcontacts");
      socket && socket.off("loadgroups");
      socket && socket.off("load-group-messages");
      socket && socket.off("loadmessages");
    };
  }, []);

  const establishSocketConnection = (username: string) => {
    const newSocket = io(socketEndpoint, {
      query: {
        username,
      }, // Pass username in query params or through a connection event
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true, // Enable reconnection
      reconnectionAttempts: 5, // Number of reconnection attempts before giving up
      reconnectionDelay: 1000, // Time between reconnection attempts
      reconnectionDelayMax: 5000, // Maximum time delay between reconnection attempts
      timeout: 20000, // Timeout before the connection is considered lost
    });

    // Handle connection events
    newSocket.on("connect", () => {
      console.log("Connected to server");
      let userInfo = JSON.stringify({
        username: username,
      });

      sessionStorage.setItem("socketId", newSocket.id || "");
      sessionStorage.setItem("user", userInfo);
      navigate("/home");

      // dispatch(saveSocket(newSocket));
      newSocket.emit("join", username); // Emit a join event with the username
    });

    newSocket.on("loadgroups", (groups: any) => {
      dispatch(saveGroups(groups));
    });

    newSocket.on("loadcontacts", (contacts: any) => {
      dispatch(saveContacts(contacts));
    });

    setSocket(newSocket);
  };

  return (
    <ThemeProvider theme={gettheme()}>
      <ErrorBoundary>
        <Global styles={css``} />
        {/* <BrowserRouter basename={process.env.PUBLIC_URL}> */}
        <Routes>
          {/* <Route path={process.env.PUBLIC_URL}> */}
          {routes.map(({ path, name, exact, ...route }: any, key: any) => {
            let filtercrumbs = routes.filter(({ path }) => {
              // if (macthedRoute?.path?.indexOf(path) !== -1) {
              return true;
              // }
            });
            let crumbs = filtercrumbs.map(({ path, ...rest }) => {
              return {
                path: Object.keys(params).length
                  ? Object.keys(params).reduce(
                      (path, param) => path.replace(`:${param}`, params[param]),
                      path
                    )
                  : path,
                ...rest,
              };
            });
            return (
              <Route
                path={path}
                element={
                  <SocketContext.Provider value={socket}>
                    {path === "/login" ? (
                      <LoginRoute>
                        {/* <SocketProvider> */}
                        <Suspense fallback={loading()}>
                          <route.component
                            {...props}
                            name={name}
                            establishSocketConnection={
                              establishSocketConnection
                            }
                          />
                        </Suspense>
                        {/* </SocketProvider> */}
                      </LoginRoute>
                    ) : (
                      <PrivateRoute>
                        <Suspense fallback={loading()}>
                          <route.component
                            {...props}
                            name={name}
                            refreshedMsgs={messages}
                          />
                        </Suspense>
                      </PrivateRoute>
                    )}
                  </SocketContext.Provider>
                }
              />
            );
          })}
          {/* </Route> */}
          {/* <Route
            path='/*'
            element={<Navigate to={`${process.env.PUBLIC_URL}/dashboard`} />}
          /> */}
        </Routes>
        {/* </BrowserRouter> */}
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
