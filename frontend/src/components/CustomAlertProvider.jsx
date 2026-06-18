import React, { useState, useEffect } from "react";

// Global register for the alert trigger
let nextAlertId = 0;
let addAlertFn = null;

// Override the browser's global alert
window.alert = (message) => {
  if (addAlertFn) {
    addAlertFn(message);
  } else {
    console.warn("Alert called before CustomAlertProvider mounted:", message);
  }
};

export default function CustomAlertProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    addAlertFn = (message) => {
      // Determine if the message indicates an error or failure
      const isError = /error|failed|invalid|issue|rejected|unable|incorrect|not found/i.test(message);
      const id = nextAlertId++;
      
      // Add the new toast to our list
      setToasts((prev) => [
        ...prev,
        { id, message, type: isError ? "error" : "success" }
      ]);
    };

    return () => {
      addAlertFn = null;
    };
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <>
      {children}
      <div className="custom-alert-container">
        {toasts.map((toast) => (
          <ToastCard
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </>
  );
}

function ToastCard({ toast, onClose }) {
  // Auto-dismiss after 4.5 seconds
  useEffect(() => {
    const timer = setTimeout(onClose, 4500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`custom-alert-toast ${toast.type}`}>
      <div className="custom-alert-icon">
        {toast.type === "success" ? "✓" : "✕"}
      </div>
      <div className="custom-alert-content">
        {toast.message}
      </div>
      <button className="custom-alert-close" onClick={onClose} aria-label="Close notification">
        &times;
      </button>
    </div>
  );
}
