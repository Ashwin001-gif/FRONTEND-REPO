import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useToast } from './ToastContext';
import { getNotifications } from '../utils/api';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const showToast = useToast();
  const [token, setToken] = useState(() => {
    const userInfoStr = localStorage.getItem('userInfo');
    return userInfoStr ? JSON.parse(userInfoStr).token : null;
  });
  
  useEffect(() => {
    const handleStorageChange = () => {
      const userInfoStr = localStorage.getItem('userInfo');
      const newToken = userInfoStr ? JSON.parse(userInfoStr).token : null;
      if (newToken !== token) setToken(newToken);
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Listen for custom login events if needed
    const interval = setInterval(handleStorageChange, 1000); 

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [token]);

  useEffect(() => {
    if (!token) {
      if (socket) {
        socket.close();
        setSocket(null);
      }
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    
    // Fetch initial history
    const fetchHistory = async () => {
      try {
        const history = await getNotifications(token);
        setNotifications(history);
        setUnreadCount(history.filter(n => !n.isRead).length);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };
    fetchHistory();

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://127.0.0.1:5000';
    const newSocket = io(socketUrl, {
      query: { token }
    });

    setSocket(newSocket);

    newSocket.on('new_notification', (notification) => {
      console.log('New notification received:', notification);
      showToast(notification.message || 'New notification', 'info');
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => newSocket.close();
  }, [token, showToast]);

  return (
    <SocketContext.Provider value={{ socket, notifications, setNotifications, unreadCount, setUnreadCount }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
