import { MessageBar } from "@looker/components";
import React, { useEffect, useState } from "react";

export interface ToastProps {
  id: string;
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  onClose: (id: string) => void;
}

const getMessageBarIntent = (type: ToastProps["type"]) => {
  switch (type) {
    case "success":
      return "positive";
    case "error":
      return "critical";
    case "warning":
      return "warn";
    case "info":
    default:
      return "inform";
  }
};

export const Toast: React.FC<ToastProps> = ({
  id,
  message,
  type = "info",
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto close after duration
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, id, onClose]);

  const handlePrimaryClick = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300); // Wait for fade out animation
  };

  if (!isVisible) {
    return null;
  }

  return (
    <MessageBar
      intent={getMessageBarIntent(type)}
      onPrimaryClick={handlePrimaryClick}
      visible={isVisible}
      style={{
        position: "fixed",
        top: "30px",
        right: "30px",
        zIndex: 9999,
        minWidth: "300px",
        maxWidth: "400px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      }}
    >
      {message}
    </MessageBar>
  );
};
