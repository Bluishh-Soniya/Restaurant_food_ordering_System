import React, { useContext } from "react";
import { NotificationContext } from "../context/NotificationContext";
import { FaCheckCircle, FaTimesCircle, FaExclamationCircle } from "react-icons/fa";

const Notifications = () => {
  const { notifications, removeNotification } = useContext(NotificationContext);

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <FaCheckCircle size={20} color="#4caf50" />;
      case "error":
        return <FaTimesCircle size={20} color="#f44336" />;
      case "warning":
        return <FaExclamationCircle size={20} color="#ff9800" />;
      default:
        return <FaCheckCircle size={20} color="#4caf50" />;
    }
  };

  const getBackgroundColor = (type) => {
    switch (type) {
      case "success":
        return "#e8f5e9";
      case "error":
        return "#ffebee";
      case "warning":
        return "#fff3e0";
      default:
        return "#e8f5e9";
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case "success":
        return "#4caf50";
      case "error":
        return "#f44336";
      case "warning":
        return "#ff9800";
      default:
        return "#4caf50";
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "120px",
        right: "20px",
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        maxWidth: "400px",
      }}
    >
      {notifications.map((notification) => (
        <div
          key={notification.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "14px 16px",
            background: getBackgroundColor(notification.type),
            border: `2px solid ${getBorderColor(notification.type)}`,
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            animation: "slideIn 0.3s ease-out",
          }}
        >
          {getIcon(notification.type)}
          
          <p
            style={{
              margin: 0,
              flex: 1,
              fontSize: "14px",
              fontWeight: "500",
              color: "#333",
            }}
          >
            {notification.message}
          </p>

          <button
            onClick={() => removeNotification(notification.id)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "18px",
              color: "#999",
              padding: "0",
              marginLeft: "8px",
            }}
          >
            ×
          </button>
        </div>
      ))}

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(400px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Notifications;
