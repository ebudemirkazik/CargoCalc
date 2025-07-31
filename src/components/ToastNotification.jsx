import React, { useState, useEffect } from 'react';

// Toast Context
const ToastContext = React.createContext(null);

// Toast Provider
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now();
    const newToast = {
      id,
      message,
      type,
      duration
    };

    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const contextValue = {
    addToast,
    removeToast
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

// Toast Hook
export function useToast() {
  const context = React.useContext(ToastContext);
  
  if (!context) {
    return {
      addToast: () => {},
      removeToast: () => {}
    };
  }
  return context;
}

// Toast Container
function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

// Individual Toast Component
function Toast({ toast, onRemove }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const getToastStyles = () => {
    const baseStyles = "flex items-center p-4 rounded-lg shadow-lg border transition-all duration-300 transform max-w-sm";
    
    if (!isVisible) {
      return `${baseStyles} translate-x-full opacity-0`;
    }

    switch (toast.type) {
      case 'success':
        return `${baseStyles} bg-green-50 border-green-200 text-green-800 translate-x-0 opacity-100`;
      case 'error':
        return `${baseStyles} bg-red-50 border-red-200 text-red-800 translate-x-0 opacity-100`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-200 text-yellow-800 translate-x-0 opacity-100`;
      case 'info':
        return `${baseStyles} bg-blue-50 border-blue-200 text-blue-800 translate-x-0 opacity-100`;
      default:
        return `${baseStyles} bg-gray-50 border-gray-200 text-gray-800 translate-x-0 opacity-100`;
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📝';
    }
  };

  return (
    <div className={getToastStyles()}>
      <div className="flex items-center">
        <span className="text-lg mr-3">{getIcon()}</span>
        <p className="text-sm font-medium flex-1">{toast.message}</p>
        <button
          onClick={handleRemove}
          className="ml-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}