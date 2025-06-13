import { Socket } from "socket.io-client";
import { io } from "socket.io-client";

let socket: Socket | null = null;
export function socketConnection(groupId: string) {
  const getSocket = () => {
    if (!socket) {
      socket = io("", {
        path: "/api/socket.io",
        extraHeaders: {
          'Apollo-Require-Preflight': 'true',
          'groupid': groupId
        }
      });
    }
    return socket;
  }

  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  }

  return { getSocket, disconnectSocket }
}