import React, { createContext, useState, useCallback } from "react";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) =>
      prev.filter((notif) => notif.id !== id)
    );
  }, []);

  const addNotification = useCallback(
    (message, type = "success", duration = 3000) => {
      const id = Date.now();

      const notification = {
        id,
        message,
        type,
        duration,
      };

      setNotifications((prev) => [...prev, notification]);

      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }

      return id;
    },
    [removeNotification]
  );

  return (
    <NotificationContext.Provider
      value={{
        addNotification,
        removeNotification,
        notifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};