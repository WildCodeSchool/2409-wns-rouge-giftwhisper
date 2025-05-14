import { useRef } from "react";
import { Socket } from "socket.io-client";
import { io } from "socket.io-client";

//TODO : fix issues with socket path since the vite proxy is not in use anymore
export function useSocket() {
  const socketRef = useRef<Socket>(null);
  const disconnectSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }
  const getSocket = () => {
    if (!socketRef.current || !socketRef.current.connected) {
      socketRef.current = io("", {
        path: "/api/socket.io",
        hostname: ""
      });
    }
    return socketRef.current;
  }
  return { disconnectSocket, getSocket };
}