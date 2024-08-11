import { css, Global } from "@emotion/react";
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
import { LoginRoute } from "./LoginRoute";
import { PrivateRoute } from "./PrivateRoute";
import { saveContacts } from "./redux/root_actions";
import { routes } from "./routes";
import { isUserAuthenticated } from "./utils/auth";
interface Props {
  theme?: any;
  Authentication?: any;
}

const loading = () => <div></div>;
export const SocketContext = React.createContext<Socket | null>(null);

const App: FC<Props> = (props: Props) => {
  const location = useLocation();
  const navigate = useNavigate();
  // const match = useMatch();
  const params: any = useParams();
  const [socket, setSocket] = useState<Socket | null>(null);

  // const socketEndpoint = `https://real-time-chatapp-kr2f.onrender.com`;
  const socketEndpoint = "http://localhost:4001"; // Your server's URL
  const dispatch = useDispatch();

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

  // useEffect(() => {
  //   return () => {
  //     socket?.off("loadcontacts");
  //   };
  // }, []);

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

      sessionStorage.setItem("user", userInfo);
      navigate("/home");

      // dispatch(saveSocket(newSocket));
      newSocket.emit("join", username); // Emit a join event with the username
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
                          <route.component {...props} name={name} />
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
