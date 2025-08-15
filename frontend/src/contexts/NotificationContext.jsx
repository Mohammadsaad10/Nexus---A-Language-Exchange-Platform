import { createContext, useState, useEffect } from 'react';
import useAuthUser from '../hooks/useAuthUser';
import { toast } from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { getUnreadCount } from '../lib/notificationApi';

 const NotificationContext = createContext();

export default NotificationContext;

export const NotificationProvider = ({ children }) => {
  const { authUser } = useAuthUser();
  const [unreadCounts, setUnreadCounts] = useState({});

  // Fetch unread counts for all conversations
  const { data: unreadData, isLoading } = useQuery({
    queryKey: ['unreadCounts'],
    queryFn: getUnreadCount,
    enabled: !!authUser?._id,
    refetchInterval: 10000, // Poll every 10 seconds
  });

  // Update unread counts when data changes
  useEffect(() => {
    if (unreadData) {
      setUnreadCounts(unreadData);
    }
  }, [unreadData]);

  // Show toast for new video call invites
  const notifyVideoCallInvite = (callerName, callId) => {
    toast.custom(() => (
      <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-md">
        <div className="flex-1">
          <h3 className="font-semibold">Video Call Invitation</h3>
          <p className="text-sm text-gray-600">{callerName} is inviting you to a video call</p>
        </div>
        <button
          onClick={() => window.open(`/call/${callId}`, '_blank')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Join Call
        </button>
      </div>
    ), {
      duration: 10000,
      style: {
        background: 'white',
        padding: '16px',
        borderRadius: '8px',
      },
    });
  };

  // Show toast for new messages
  const notifyNewMessage = (senderName, message, conversationId) => {
    toast.custom(() => (
      <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-md">
        <div className="flex-1">
          <h3 className="font-semibold">New Message from {senderName}</h3>
          <p className="text-sm text-gray-600">{message}</p>
        </div>
      </div>
    ), {
      duration: 5000,
      style: {
        background: 'white',
        padding: '16px',
        borderRadius: '8px',
      },
    });

    // Update unread count for this conversation
    setUnreadCounts(prev => ({
      ...prev,
      [conversationId]: (prev[conversationId] || 0) + 1
    }));
  };

  // Mark messages as read
  const markAsRead = (conversationId) => {
    setUnreadCounts(prev => ({
      ...prev,
      [conversationId]: 0
    }));
  };

  return (
    <NotificationContext.Provider
      value={{
        unreadCounts,
        notifyVideoCallInvite,
        notifyNewMessage,
        markAsRead,
        isLoading
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
