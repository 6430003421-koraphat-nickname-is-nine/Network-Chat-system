import React, { useState, useEffect, useContext } from "react";
import { socket } from "../../lib/socket";
import { useUser } from "./UserContext";

const OnlineStatusContext = React.createContext({
  isOnline: false,
  setOnlineStatus: (status: boolean) => {},
});

export const OnlineStatusProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isOnline, setOnlineStatus] = useState(false);
  const { currentUser } = useUser();

  useEffect(() => {
    if (!currentUser) {
      socket.emit("offline");
      setOnlineStatus(false);
      return;
    }

    socket.emit("new-user-add", currentUser?.id);
    socket.on("get-users", (users) => {
      setOnlineStatus(users.includes(currentUser?.id));
    });
  }, [currentUser]);

  return (
    <OnlineStatusContext.Provider value={{ isOnline, setOnlineStatus }}>
      {children}
    </OnlineStatusContext.Provider>
  );
};

export const useOnlineStatus = () => {
  return useContext(OnlineStatusContext);
};
