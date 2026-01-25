import React, { useState } from 'react';
import Avatar from './Avatar';
import { HiHeart, HiPaperAirplane } from 'react-icons/hi2';
import { Post } from '../services/groupService';

interface CommentSectionProps {
  post: Post;
  currentUserId: string;
  showComments: boolean;
  onToggleCommentLike: (postId: string, commentId: string) => void;
  onAddReply: (postId: string, commentId: string, content: string) => void;
  onAddComment: (postId: string, content: string) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  post,
  currentUserId,
  showComments,
  onToggleCommentLike,
  onAddReply,
  onAddComment,
}) => {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [showReplies, setShowReplies] = useState<Record<string, boolean>>({});

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    onAddComment(post._id, newComment);
    setNewComment('');
  };

  const handleAddReply = (commentId: string) => {
    if (!replyContent.trim()) return;
    onAddReply(post._id, commentId, replyContent);
    setReplyContent('');
    setReplyingTo(null);
  };

  if (!showComments) return null;

  return (
    <div className="border-t border-slate-100 dark:border-slate-700">
      {/* Comments List */}
      <div className="px-4 pb-3 pt-3 space-y-3">
          {/* Add Comment Input */}
          <div className="flex gap-2">
            <Avatar
              avatarUrl={(post.author as any).avatar}
              displayName={(post.author as any).displayName}
              frameId={(post.author as any).avatarFrame}
              size="xs"
            />
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Viết bình luận..."
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiPaperAirplane className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Comments */}
          {post.comments.map((comment) => (
            <div key={comment._id} className="space-y-2">
              {/* Comment */}
              <div className="flex gap-2">
                <Avatar
                  avatarUrl={comment.author.avatar}
                  displayName={comment.author.displayName}
                  frameId={(comment.author as any).avatarFrame}
                  size="xs"
                />
                <div className="flex-1">
                  <div className="bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">
                      {comment.author.displayName}
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{comment.content}</p>
                  </div>
                  
                  {/* Comment Actions */}
                  <div className="flex items-center gap-3 mt-1 px-2">
                    <button
                      onClick={() => onToggleCommentLike(post._id, comment._id)}
                      className={`text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                        comment.likes.includes(currentUserId)
                          ? 'text-red-500'
                          : 'text-slate-500 hover:text-red-500'
                      }`}
                    >
                      <HiHeart className={`w-3 h-3 ${comment.likes.includes(currentUserId) ? 'fill-current' : ''}`} />
                      {comment.likes.length > 0 && comment.likes.length}
                    </button>
                    <button
                      onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                      className="text-xs font-medium text-slate-500 hover:text-indigo-500 transition-colors cursor-pointer hover:underline"
                    >
                      Trả lời
                    </button>
                    <span className="text-xs text-slate-400">
                      {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                    {comment.replies.length > 0 && (
                      <button
                        onClick={() => setShowReplies({ ...showReplies, [comment._id]: !showReplies[comment._id] })}
                        className="text-xs font-medium text-indigo-500 hover:text-indigo-600 transition-colors cursor-pointer hover:underline"
                      >
                        {showReplies[comment._id] ? 'Ẩn' : 'Xem'} {comment.replies.length} trả lời
                      </button>
                    )}
                  </div>

                  {/* Reply Input */}
                  {replyingTo === comment._id && (
                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Viết trả lời..."
                        onKeyDown={(e) => e.key === 'Enter' && handleAddReply(comment._id)}
                        className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <button
                        onClick={() => handleAddReply(comment._id)}
                        disabled={!replyContent.trim()}
                        className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50"
                      >
                        <HiPaperAirplane className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Replies */}
                  {showReplies[comment._id] && comment.replies.length > 0 && (
                    <div className="mt-2 ml-4 space-y-2">
                      {comment.replies.map((reply) => (
                        <div key={reply._id} className="flex gap-2">
                          <Avatar
                            avatarUrl={reply.author.avatar}
                            displayName={reply.author.displayName}
                            frameId={(reply.author as any).avatarFrame}
                            size="xs"
                            className="w-7 h-7"
                          />
                          <div className="flex-1">
                            <div className="bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2">
                              <p className="font-semibold text-xs text-slate-900 dark:text-white">
                                {reply.author.displayName}
                              </p>
                              <p className="text-xs text-slate-700 dark:text-slate-300">{reply.content}</p>
                            </div>
                            <span className="text-xs text-slate-400 ml-2">
                              {new Date(reply.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
    </div>
  );
};

export default CommentSection;
