"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ReactNode } from "react";

interface WebSocketContextType {
  sendMessage: (message: string) => void;
  messages: any[];
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined,
);

export function WebSocketProvider({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  const webSocketServer =
    process.env.WEB_SOCKET_SERVER || "ws://localhost:8080/ws";

  useEffect(() => {
    const socket = new WebSocket(webSocketServer);

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
      console.log("WebSocket message received:", event.data);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    socket.onerror = (error) => {
      console.error("WebSocket error", error);
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [webSocketServer, setWs]);

  const sendMessage = (message: string) => {
    // send message
    if (ws && ws.readyState === ws.OPEN) {
      ws.send(message);
    } else {
      console.error("WebSocket not connected");
    }
  };

  return (
    <WebSocketContext.Provider value={{ sendMessage, messages }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
