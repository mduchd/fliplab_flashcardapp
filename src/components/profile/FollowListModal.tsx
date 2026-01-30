import React, { useState, useEffect } from 'react';
import { HiXMark, HiUsers } from 'react-icons/hi2';
import { followService, FollowUser } from '../../services/followService';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import FollowShareActions from './FollowShareActions';

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  type: 'followers' | 'following';
  title: string;
}

const FollowListModal: React.FC<FollowListModalProps> = ({ 
  isOpen, 
  onClose, 
  userId, 
  type, 
  title 
}) => {
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && userId) {
      loadUsers();
    }
  }, [isOpen, userId, type]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      if (type === 'followers') {
        const response = await followService.getFollowers(userId);
        if (response.success) setUsers(response.data.followers);
      } else {
        const response = await followService.getFollowing(userId);
        if (response.success) setUsers(response.data.following);
      }
    } catch (error) {
      console.error(`Failed to load ${type}`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserClick = (targetId: string) => {
    navigate(`/profile/${targetId}`); // Assuming you have a route /profile/:id
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors cursor-pointer"
          >
            <HiXMark className="w-6 h-6" />
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="bg-slate-50 dark:bg-slate-700/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                 <HiUsers className="w-10 h-10 text-slate-300 dark:text-slate-500" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Chưa có ai ở đây cả.</p>
            </div>
          ) : (
            <ul className="space-y-1">
              {users.map((u) => (
                <li key={u._id} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors group">
                  <div 
                    className="flex items-center gap-3 cursor-pointer flex-1"
                    onClick={() => handleUserClick(u._id)}
                  >
                    <img 
                      src={u.avatar || `https://ui-avatars.com/api/?name=${u.username}&background=random`} 
                      alt={u.username} 
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-600"
                    />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {u.displayName || u.username}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        @{u.username}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  {currentUser?.id !== u._id && (
                     <div className="scale-90 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                        <FollowShareActions 
                           targetUserId={u._id}
                           currentUserId={currentUser?.id}
                           isOwnProfile={false}
                           mode="buttons-only"
                           variant="secondary"
                           hideShare={true}
                        />
                     </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowListModal;
