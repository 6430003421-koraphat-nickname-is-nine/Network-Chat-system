import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../../lib/socket";
import { useUser } from "../../lib/context/UserContext";

interface Message {
  text: string;
  sender: "self" | "other" | "system";
  avatar?: string;
}

const GroupChatRoom = () => {
  let { id } = useParams();
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");

  const [groupName, setGroupName] = useState("");

  const { currentUser } = useUser();

  useEffect(() => {
    const fetchGroupName = async () => {
      try {
        const apiUrl = `${process.env.REACT_APP_BACKEND_URL}/group-chats/${id}`;
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch groups");
        }
        const data = await response.json();

        setGroupName(data.groupName);
      } catch (error) {
        console.error("Error fetching groups:", (error as Error).message);
      }
    };

    fetchGroupName();
  }, [id]);

  useEffect(() => {
    // Join room when component mounts
    socket.emit("join-room", id, () => {});

    // Listen for incoming messages
    const receiveGroupMessageListener = (newMessage: Message) => {
      newMessage.sender = "other";
      setAllMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    socket.on("receive-group-message", receiveGroupMessageListener);

    return () => {
      socket.off("receive-group-message", receiveGroupMessageListener);
    };
  }, [id]);

  const handleSendMessage = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const newMessage: Message = {
        text: message,
        sender: "self",
        avatar: currentUser?.imageURL || "",
      };
      if (!newMessage.text) return;

      setAllMessages((prevMessages) => [...prevMessages, newMessage]);
      socket.emit("send-group-message", newMessage, id);

      setMessage("");
    }
  };

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 112px)" }}>
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 text-center font-bold text-sm">
        {groupName}
      </div>

      {/* Chat Messages */}
      <div className="flex-grow overflow-y-auto">
        {/* Render all messages */}
        {allMessages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender === "self" ? "justify-end" : "justify-start"
            } items-center`}
          >
            {msg.sender === "self" ? (
              <div className="bg-emerald-500 text-white p-2 rounded-lg m-2 max-w-xs">
                {msg.text}
              </div>
            ) : msg.sender === "other" ? (
              <>
                <img
                  src={msg.avatar || "https://via.placeholder.com/150"}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full m-2"
                />
                <div className="bg-gray-300 p-2 rounded-lg m-2 max-w-xs">
                  {msg.text}
                </div>
              </>
            ) : (
              <div className="bg-gray-200 text-gray-700 p-2 rounded-lg m-2 max-w-xs text-center">
                {msg.text}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="bg-gray-200 p-4 sticky bottom-12">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleSendMessage}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
          placeholder="Type your message..."
        />
      </div>
    </div>
  );
};

export default GroupChatRoom;
