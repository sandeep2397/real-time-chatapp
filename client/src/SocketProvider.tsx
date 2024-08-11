// SocketContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

interface props {
  children: any;
}
export const SocketProvider = ({ children }: props) => {
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    // Load socket ID from session storage
    const storedSocketId = sessionStorage.getItem("socketId");

    // Initialize socket connection
    const newSocket = io("http://localhost:4001", {
      query: { socketId: storedSocketId },
      transports: ["websocket"],
    });

    setSocket(newSocket);

    // Save socket ID to session storage
    newSocket.on("connect", () => {
      sessionStorage.setItem("socketId", newSocket.id || "");
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket ?? null}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
