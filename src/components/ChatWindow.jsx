import { useEffect, useState } from "react";
import API from "../api/axiosInstance";

const ChatWindow = ({ conversation }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const fetchMessages = async () => {
    try {
      const res = await API.get(`/messages/conversation/${conversation.id}`);
      setMessages(res.data.data.content);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  useEffect(() => {
    if (conversation) fetchMessages();
  }, [conversation]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    try {
      const senderId = localStorage.getItem("userId");
      const res = await API.post(`/messages/send?conversationId=${conversation.id}&senderId=${senderId}`, text, {
        headers: { "Content-Type": "text/plain" }
      });
      setMessages([...messages, res.data.data]);
      setText("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto border p-2 rounded mb-2">
        {messages.map((m) => (
          <div key={m.id} className="mb-2">
            <strong>{m.senderId}:</strong> {m.content}
          </div>
        ))}
      </div>

      <div className="flex">
        <input
          className="flex-1 border p-2 rounded-l"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white p-2 rounded-r hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
