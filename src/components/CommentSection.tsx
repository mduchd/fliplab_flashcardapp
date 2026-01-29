import React, { useState, useEffect } from 'react';
import Avatar from './Avatar';
import { HiHeart, HiPaperAirplane, HiTrash } from 'react-icons/hi2';
import { commentService, Comment } from '../services/commentService';
import { Post } from '../services/groupService';
import { useAuth } from '../contexts/AuthContext';

interface CommentSectionProps {
  post: Post;
  currentUserId: string;
  showComments: boolean;
  onToggleCommentLike?: (postId: string, commentId: string) => void;
  onAddReply?: (postId: string, commentId: string, content: string) => void;
  onAddComment?: (postId: string, content: string) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  post,
  currentUserId,
  showComments,
}) => {
  const { user } = useAuth(); // Lấy thông tin user hiện tại (có avatar & frame)
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  
  // Lưu trạng thái mở rộng reply cho mỗi comment cha
  const [showReplies, setShowReplies] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (showComments) {
      loadComments();
    }
  }, [showComments, post._id]);

  const loadComments = async () => {
    setLoading(true);
    try {
      // Backend mới: getPostComments trả về mảng phẳng (flat array)
      const response = await commentService.getPostComments(post._id);
      if (response.success) {
        // Cần xử lý phân cấp logic Frontend: Cha (parentId=null), Con (parentId=Cha._id)
        const allComments = response.data;
        const rootComments = allComments.filter(c => !c.parentId);
        
        // Gắn children vào parent
        rootComments.forEach(root => {
          root.replies = allComments.filter(c => c.parentId === root._id);
        });

        setComments(rootComments);
      }
    } catch (error) {
      console.error('Failed to load comments', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const response = await commentService.createComment({
        postId: post._id,
        content: newComment,
        isAnonymous: false, 
      });

      if (response.success) {
        const created = response.data;
        created.replies = [];
        setComments(prev => [...prev, created]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Failed to add comment', error);
    }
  };

  const handleAddReply = async (parentId: string) => {
    if (!replyContent.trim()) return;
    try {
       const response = await commentService.createComment({
        postId: post._id,
        content: replyContent,
        parentId: parentId,
      });

      if (response.success) {
        const reply = response.data;
        
        setComments(prev => prev.map(c => {
          if (c._id === parentId) {
             return {
               ...c,
               replies: [...(c.replies || []), reply]
             };
          }
          return c;
        }));
        
        setShowReplies(prev => ({ ...prev, [parentId]: true }));
        setReplyContent('');
        setReplyingTo(null);
      }
    } catch (error) {
      console.error('Failed to reply', error);
    }
  };

  const handleDeleteComment = async (commentId: string, parentId?: string) => {
    if(!confirm('Xóa bình luận này?')) return;
    try {
      const response = await commentService.deleteComment(commentId);
      if(response.success) {
        if(parentId) {
          // Xóa reply
          setComments(prev => prev.map(c => {
            if(c._id === parentId) {
              return { ...c, replies: c.replies?.filter(r => r._id !== commentId) };
            }
            return c;
          }));
        } else {
          // Xóa root comment
          setComments(prev => prev.filter(c => c._id !== commentId));
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  if (!showComments) return null;

  return (
    <div className="border-t border-slate-100 dark:border-slate-700">
      {/* Comments List */}
      <div className="px-4 pb-3 pt-3 space-y-3">
          {/* Add Comment Input */}
          <div className="flex gap-2">
            <Avatar
               avatarUrl={user?.avatar}
               displayName={user?.displayName || "Me"}
               frameId={user?.avatarFrame} // Sử dụng avatarFrame của user hiện tại
               size="xs"
            />
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Viết bình luận..."
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <HiPaperAirplane className="w-4 h-4" />
              </button>
            </div>
          </div>

          {loading ? (
             <div className="text-center text-xs text-slate-500 py-2">Đang tải bình luận...</div>
          ) : comments.length === 0 ? (
             <div className="text-center text-xs text-slate-500 py-2">Chưa có bình luận nào.</div>
          ) : (
            comments.map((comment) => (
            <div key={comment._id} className="space-y-2">
              {/* Comment Root */}
              <div className="flex gap-2">
                <Avatar
                  avatarUrl={comment.author.avatar}
                  displayName={comment.author.displayName}
                  frameId={comment.author.avatarFrame} // Hiển thị Frame của người post comment
                  size="xs"
                />
                <div className="flex-1">
                  <div className="bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2 inline-block">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">
                      {comment.author.displayName}
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{comment.content}</p>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-1 px-1">
                    <button className="text-xs font-medium text-slate-500 hover:text-red-500 cursor-pointer">Thích</button>
                    <button
                      onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                      className="text-xs font-medium text-slate-500 hover:text-blue-500 transition-colors cursor-pointer hover:underline"
                    >
                      Trả lời
                    </button>
                    <span className="text-xs text-slate-400">
                      {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                    {(comment.author._id === currentUserId) && (
                       <button onClick={() => handleDeleteComment(comment._id)} className="text-xs text-slate-400 hover:text-red-500 cursor-pointer"><HiTrash className="inline w-3 h-3"/></button>
                    )}
                  </div>

                  {/* Reply Input */}
                  {replyingTo === comment._id && (
                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder={`Trả lời ${comment.author.displayName}...`}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddReply(comment._id)}
                        autoFocus
                        className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                      />
                      <button
                        onClick={() => handleAddReply(comment._id)}
                        disabled={!replyContent.trim()}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 cursor-pointer"
                      >
                        <HiPaperAirplane className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Replies List */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-2">
                       {!showReplies[comment._id] ? (
                          <button 
                            onClick={() => setShowReplies(prev => ({ ...prev, [comment._id]: true }))}
                            className="text-xs font-semibold text-slate-500 flex items-center gap-2 hover:underline cursor-pointer"
                          >
                            <div className="w-8 h-[1px] bg-slate-300"></div>
                            Xem {comment.replies.length} phản hồi
                          </button>
                       ) : (
                          <div className="space-y-2 pl-2 border-l-2 border-slate-200 dark:border-slate-600">
                              {comment.replies.map(reply => (
                                <div key={reply._id} className="flex gap-2 pl-2">
                                  <Avatar
                                    avatarUrl={reply.author.avatar}
                                    displayName={reply.author.displayName}
                                    frameId={reply.author.avatarFrame} // Hiển thị Frame của người reply
                                    size="xs"
                                    className="w-6 h-6 border-none"
                                  />
                                  <div>
                                    <div className="bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2 inline-block">
                                        <p className="font-semibold text-xs text-slate-900 dark:text-white">{reply.author.displayName}</p>
                                        <p className="text-xs text-slate-700 dark:text-slate-300">{reply.content}</p>
                                    </div>
                                    <div className="flex gap-2 mt-1 px-1">
                                       <span className="text-[10px] text-slate-400">{new Date(reply.createdAt).toLocaleDateString('vi-VN')}</span>
                                       {(reply.author._id === currentUserId) && (
                                          <button onClick={() => handleDeleteComment(reply._id, comment._id)} className="text-[10px] text-slate-400 hover:text-red-500 cursor-pointer">Xóa</button>
                                       )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                       )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            ))
          )}
      </div>
    </div>
  );
};

export default CommentSection;
