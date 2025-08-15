import { Link } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { useEffect } from 'react';
import { getLanguageFlag } from '../utils/languageUtils';


const FriendCard = ({ friend, conversationId }) => {
  const { unreadCounts, markAsRead } = useNotifications();
  const unreadCount = conversationId ? unreadCounts[conversationId] || 0 : 0;

  useEffect(() => {
    return () => {
      // Mark messages as read when component unmounts if there are unread messages
      if (unreadCount > 0 && conversationId) {
        markAsRead(conversationId);
      }
    };
  }, [unreadCount, conversationId, markAsRead]);

  return (
    <div className="card bg-base-200 hover:shadow-md transition-shadow relative">
      {unreadCount > 0 && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
          {unreadCount}
        </div>
      )}
      <div className="card-body p-4">
        {/* USER INFO */}
        <div className="flex items-center gap-3 mb-3">
          <div className="avatar">
            <div className="w-12 h-12 rounded-full">
              <img src={friend.profilePic} alt={friend.fullName} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{friend.fullName}</h3>
            {unreadCount > 0 && (
              <span className="badge badge-primary badge-sm">
                {unreadCount} new message{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="badge badge-secondary text-xs">
            {getLanguageFlag(friend.nativeLanguage)} 
            Native: {friend.nativeLanguage}
            {/* // to make edits for marathi. */}
          </span>
          <span className="badge badge-outline text-xs">
            {getLanguageFlag(friend.learningLanguage)}
            Learning: {friend.learningLanguage}
          </span>
        </div>

        <Link 
          to={`/chat/${friend._id}`} 
          className={`btn w-full ${unreadCount > 0 ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => unreadCount > 0 && markAsRead(conversationId)}
        >
          {unreadCount > 0 ? `${unreadCount} New Message${unreadCount > 1 ? 's' : ''}` : 'Message'}
        </Link>
      </div>
    </div>
  );
};
export default FriendCard;






