import { createContext, useContext, useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import API from "../utils/axiosInstance";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [stompClient, setStompClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const client = new Client({
      brokerURL: null,
      webSocketFactory: () => new SockJS("http://localhost:8080/ws-sockjs"),
      connectHeaders: {
        Authorization: `Bearer ${token}`, 
      },
      debug: (str) => console.log("[STOMP]", str),
      reconnectDelay: 5000,
    });

    client.onConnect = async () => {
      console.log("STOMP connected");

      const res = await API.get("/users/me");
      setUserId(res.data); 
      client.subscribe(`/user/${res.data}/queue/conversations`, (message) => {
        console.log("Conversations:", JSON.parse(message.body));
      });

      setConnected(true);
    };

    client.activate();
    setStompClient(client);

    return () => client.deactivate();
  }, []);

  return (
    <WebSocketContext.Provider value={{ stompClient, connected, userId }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
