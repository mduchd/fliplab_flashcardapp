import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Avatar from '../../components/Avatar';
import CommentSection from '../../components/CommentSection';
import ImageViewerModal from '../../components/ImageViewerModal';
import { groupService, Group, Post } from '../../services/groupService';
import { flashcardService, FlashcardSet } from '../../services/flashcardService';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import {
  HiArrowLeft,
  HiUserGroup,
  HiUsers,
  HiCog6Tooth,
  HiPhoto,
  HiPencilSquare,
  HiHeart,
  HiChatBubbleLeft,
  HiArrowRightOnRectangle,
  HiRectangleStack,
  HiXMark,
  HiArrowPath,
  HiPaperAirplane,
  HiBookOpen,
  HiCamera,
  HiEllipsisHorizontal,
  HiTrash,
  HiMapPin,
  HiPlus,
  HiCheckCircle,
} from 'react-icons/hi2';

const GroupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToastContext();

  const [group, setGroup] = useState<Group | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'members' | 'settings'>('posts');

  // Post creation
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImages, setNewPostImages] = useState<string[]>([]);
  const [selectedFlashcardSet, setSelectedFlashcardSet] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [userFlashcardSets, setUserFlashcardSets] = useState<FlashcardSet[]>([]);
  const [showFlashcardPicker, setShowFlashcardPicker] = useState(false);
  
  // Poll creation
  const [isPollMode, setIsPollMode] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);

  // Settings modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editCoverImage, setEditCoverImage] = useState('');
  const [allowAnonymous, setAllowAnonymous] = useState(false);
  const [requireApproval, setRequireApproval] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Comment visibility state
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  
  // Post menu state
  const [activePostMenu, setActivePostMenu] = useState<string | null>(null);
  const postMenuRef = useRef<HTMLDivElement>(null);

  // Image viewer state
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  // Heart animation state
  const [heartAnimations, setHeartAnimations] = useState<{postId: string, id: number}[]>([]);

  const handlePostDoubleClick = (postId: string) => {
    const post = posts.find(p => p._id === postId);
    if (post && !post.likes.includes(user!.id)) {
      handleToggleLike(postId);
    }
    
    // Add heart animation
    const id = Date.now();
    setHeartAnimations(prev => [...prev, { postId, id }]);
    setTimeout(() => {
      setHeartAnimations(prev => prev.filter(h => h.id !== id));
    }, 1000);
  };
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (postMenuRef.current && !postMenuRef.current.contains(event.target as Node)) {
        setActivePostMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (id) {
      loadGroup();
      loadPosts();
    }
  }, [id]);

  const loadGroup = async () => {
    try {
      const response = await groupService.getGroup(id!);
      if (response.success) {
        setGroup(response.data.group);
        setEditName(response.data.group.name);
        setEditDescription(response.data.group.description || '');
        setEditImage(response.data.group.image || '');
        setEditCoverImage(response.data.group.coverImage || '');
        setAllowAnonymous(response.data.group.settings?.allowAnonymousPosts || false);
        setRequireApproval(response.data.group.settings?.requireApproval || false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi tải nhóm');
      navigate('/groups');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      const response = await groupService.getPosts(id!);
      if (response.success) {
        console.log('Posts loaded from API:', response.data.posts.map(p => ({ id: p._id, content: p.content, hasImages: p.images.length > 0 })));
        setPosts(response.data.posts);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    }
  };

  // ... (previous code)

  const handleCreatePost = async () => {
    // Debug log
    console.log('Preparing to create post:', { 
      isPollMode, 
      contentLength: newPostContent.length, 
      imagesCount: newPostImages.length 
    });

    if (isPollMode) {
      if (!pollQuestion.trim()) {
        toast.error('Vui lòng nhập câu hỏi');
        return;
      }
      const validOptions = pollOptions.filter(o => o.trim());
      if (validOptions.length < 2) {
        toast.error('Vui lòng nhập ít nhất 2 lựa chọn');
        return;
      }
    } else {
      // Normal post validation
      const hasContent = newPostContent.trim().length > 0;
      const hasSet = !!selectedFlashcardSet;
      const hasImages = newPostImages.length > 0;
      
      if (!hasContent && !hasSet && !hasImages) {
        toast.error('Vui lòng nhập nội dung, chọn ảnh hoặc chia sẻ bộ thẻ');
        return;
      }
    }

    setIsPosting(true);
    try {
      const contentToSend = isPollMode ? pollQuestion.trim() : newPostContent.trim();
      
      const postData: any = {
        content: contentToSend,
        images: isPollMode ? [] : newPostImages,
        sharedFlashcardSet: isPollMode ? undefined : (selectedFlashcardSet || undefined),
      };

      if (isPollMode) {
        postData.poll = {
          question: pollQuestion.trim(),
          options: pollOptions.filter(o => o.trim()),
        };
      }

      console.log('Sending post data:', postData); // Debug log

      const response = await groupService.createPost(id!, postData);

      if (response.success) {
        toast.success('Đăng bài thành công!');
        setNewPostContent('');
        setNewPostImages([]);
        setSelectedFlashcardSet(null);
        setIsCreatePostOpen(false);
        
        // Reset poll
        setPollQuestion('');
        setPollOptions(['', '']);
        setIsPollMode(false);
        
        loadPosts();
      }
    } catch (error: any) {
      console.error('Create post error:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi đăng bài');
    } finally {
      setIsPosting(false);
    }
  };

  const handleVote = async (postId: string, optionIndex: number) => {
    try {
      const response = await groupService.votePoll(id!, postId, optionIndex);
      if (response.success) {
        setPosts(posts.map(p => p._id === postId ? { ...p, poll: response.data.poll } : p));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi bình chọn');
    }
  };
  
  const handleTogglePin = async (postId: string) => {
    try {
      const response = await groupService.togglePinPost(id!, postId);
      if (response.success) {
        toast.success(response.message);
        loadPosts();
        setActivePostMenu(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Bạn có chắc muốn xóa bài viết này?')) return;
    try {
      await groupService.deletePost(id!, postId);
      toast.success('Đã xóa bài viết');
      loadPosts();
      setActivePostMenu(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi');
    }
  };

  // ... (toggle like code)
  const handleToggleLike = async (postId: string) => {
    try {
      const response = await groupService.toggleLike(id!, postId);
      if (response.success) {
        setPosts(posts.map(p => {
          if (p._id === postId) {
            const liked = response.data.liked;
            return {
              ...p,
              likes: liked 
                ? [...p.likes, user!.id]
                : p.likes.filter(l => l !== user!.id)
            };
          }
          return p;
        }));
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const response = await groupService.updateGroup(id!, {
        name: editName,
        description: editDescription,
        image: editImage,
        coverImage: editCoverImage,
        settings: {
          allowAnonymousPosts: allowAnonymous,
          requireApproval: requireApproval,
        },
      });

      if (response.success) {
        toast.success('Cập nhật nhóm thành công!');
        setGroup(response.data.group);
        setIsSettingsOpen(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!confirm('Bạn có chắc muốn rời nhóm này?')) return;

    try {
      const response = await groupService.leaveGroup(id!);
      if (response.success) {
        toast.success('Đã rời nhóm');
        navigate('/groups');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi');
    }
  };

  const handleToggleCommentLike = async (postId: string, commentId: string) => {
    try {
      await groupService.toggleCommentLike(id!, postId, commentId);
      loadPosts();
    } catch (error) {
      console.error('Failed to toggle comment like:', error);
    }
  };

  const handleAddComment = async (postId: string, content: string) => {
    try {
      const response = await groupService.addComment(id!, postId, content);
      if (response.success) {
        setPosts(posts.map(p => p._id === postId ? { ...p, comments: response.data.comments } : p));
        toast.success('Đã thêm bình luận');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi thêm bình luận');
    }
  };

  const handleAddReply = async (postId: string, commentId: string, content: string) => {
    try {
      await groupService.addReply(id!, postId, commentId, content);
      loadPosts();
      toast.success('Đã thêm trả lời');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi thêm trả lời');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setNewPostImages([...newPostImages, base64]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const loadUserFlashcardSets = async () => {
    try {
      const response = await flashcardService.getAll();
      if (response.success) {
        setUserFlashcardSets(response.data.flashcardSets);
      }
    } catch (error) {
      console.error('Failed to load flashcard sets:', error);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <HiArrowPath className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (!group) {
    return (
      <MainLayout>
        <div className="text-center py-16">
          <p className="text-slate-600 dark:text-slate-400">Không tìm thấy nhóm</p>
        </div>
      </MainLayout>
    );
  }

  const isAdmin = group.admins.some(a => a._id === user?.id);
  const isMember = group.members.some(m => m._id === user?.id);
  const isCreator = group.createdBy._id === user?.id;

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden mb-6 border border-slate-200 dark:border-slate-700">
          <div className="h-56 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 relative bg-cover bg-center" 
            style={group.coverImage ? { backgroundImage: `url(${group.coverImage})` } : {}}
          >
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <button
              onClick={() => navigate('/groups')}
              className="absolute top-4 left-4 z-10 p-2 bg-black/20 hover:bg-black/40 rounded-lg transition-colors cursor-pointer backdrop-blur-sm"
            >
              <HiArrowLeft className="w-5 h-5 text-white" />
            </button>
            {isAdmin && (
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 rounded-lg transition-colors cursor-pointer backdrop-blur-sm"
              >
                <HiCog6Tooth className="w-5 h-5 text-white" />
              </button>
            )}
          </div>

          <div className="p-5 -mt-10 relative">
            <div className="flex items-end gap-4 mb-4">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden">
                {group.image ? (
                  <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
                ) : (
                  <HiUserGroup className="w-10 h-10 text-white" />
                )}
              </div>
              <div className="flex-1 pb-1">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{group.name}</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <HiUsers className="w-4 h-4" />
                  {group.members.length} thành viên
                </p>
              </div>
            </div>

            {group.description && (
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">{group.description}</p>
            )}

            <div className="flex gap-1 border-t border-slate-200 dark:border-slate-700 pt-4 -mx-5 px-5">
              {[
                { key: 'posts', label: 'Bài viết' },
                { key: 'members', label: 'Thành viên' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === key
                      ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {label}
                </button>
              ))}
              {!isCreator && isMember && (
                <button
                  onClick={handleLeaveGroup}
                  className="ml-auto px-4 py-2 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <HiArrowRightOnRectangle className="w-4 h-4" />
                  Rời nhóm
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="ml-auto px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2 cursor-pointer text-sm font-medium"
                >
                  <HiCog6Tooth className="w-4 h-4" />
                  Cài đặt
                </button>
              )}
            </div>
          </div>
        </div>

        {activeTab === 'posts' && (
          <div className="space-y-4">
            {isMember && (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => {
                    setIsCreatePostOpen(true);
                    loadUserFlashcardSets();
                  }}
                  className="w-full flex items-center gap-3 text-left cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 transition-colors">
                    <HiPencilSquare className="w-5 h-5 text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  </div>
                  <span className="text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">Viết bài mới...</span>
                </button>
              </div>
            )}

            {posts.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="text-slate-600 dark:text-slate-400">Chưa có bài viết nào</p>
              </div>
            ) : (
              posts.map((post) => (
                <div 
                  key={post._id} 
                  onDoubleClick={() => handlePostDoubleClick(post._id)}
                  className={`bg-white dark:bg-slate-800 rounded-xl border ${post.isPinned ? 'border-blue-200 dark:border-blue-900 ring-1 ring-blue-100 dark:ring-blue-900' : 'border-slate-200 dark:border-slate-700'} overflow-hidden relative transition-all select-none cursor-pointer hover:shadow-md`}
                >
                  {/* Heart Animation Layer */}
                  {heartAnimations.filter(h => h.postId === post._id).map(h => (
                    <div key={h.id} className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                      <HiHeart className="w-24 h-24 text-red-500 fill-current animate-ping opacity-75 drop-shadow-xl" />
                    </div>
                  ))}
                  
                  {/* Pin Indicator */}
                  {post.isPinned && (
                    <div className="absolute top-0 right-0 p-2">
                       <HiMapPin className="w-5 h-5 text-blue-500 rotate-45" />
                    </div>
                  )}

                  {/* Post Header */}
                  <div className="p-4 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar 
                        avatarUrl={post.author.avatar}
                        displayName={post.author.displayName}
                        frameId={(post.author as any).avatarFrame}
                        size="sm"
                      />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                          {post.author.displayName}
                          {post.isPinned && <span className="text-xs font-normal text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full flex items-center gap-1"><HiMapPin className="w-3 h-3" /> Đã ghim</span>}
                        </p>
                        <p className="text-xs text-slate-500">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                    
                    {/* Post Menu */}
                    {(isAdmin || post.author._id === user?.id) && (
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActivePostMenu(activePostMenu === post._id ? null : post._id);
                          }}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors cursor-pointer"
                        >
                          <HiEllipsisHorizontal className="w-6 h-6" />
                        </button>
                        
                        {activePostMenu === post._id && (
                          <div ref={postMenuRef} className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-100">
                            {isAdmin && (
                              <button
                                onClick={() => handleTogglePin(post._id)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-left cursor-pointer"
                              >
                                <HiMapPin className="w-4 h-4" />
                                {post.isPinned ? 'Bỏ ghim' : 'Ghim bài'}
                              </button>
                            )}
                            <button
                              onClick={() => handleDeletePost(post._id)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 text-left cursor-pointer"
                            >
                              <HiTrash className="w-4 h-4" />
                              Xóa bài
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Post Content - Computed to ensure visibility */}
                  {post.content && (
                    <div className="px-4 pb-3">
                      <p className="text-slate-900 dark:text-gray-100 whitespace-pre-wrap break-words text-[15px] leading-relaxed">
                        {post.content}
                      </p>
                    </div>
                  )}

                  {/* Poll Display */}
                  {post.poll && (
                    <div className="px-4 pb-3">
                      <h3 className="font-medium text-lg mb-3 dark:text-white">{post.poll.question}</h3>
                      <div className="space-y-2">
                        {post.poll.options.map((option, idx) => {
                          const totalVotes = post.poll!.options.reduce((acc, curr) => acc + curr.votes.length, 0);
                          const percent = totalVotes === 0 ? 0 : Math.round((option.votes.length / totalVotes) * 100);
                          const isVoted = user?.id ? option.votes.includes(user.id) : false;
                          return (
                            <div key={idx} onClick={() => handleVote(post._id, idx)} className="relative h-10 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors group">
                              <div className={`absolute left-0 top-0 bottom-0 transition-all duration-500 ${isVoted ? 'bg-blue-200 dark:bg-blue-900/50' : 'bg-slate-200 dark:bg-slate-600'}`} style={{ width: `${percent}%` }} />
                              <div className="absolute inset-0 flex items-center justify-between px-3">
                                <span className="font-medium text-sm text-slate-800 dark:text-slate-200 z-10">{option.text}</span>
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 z-10">{percent}% ({option.votes.length}) {isVoted && <HiCheckCircle className="inline text-blue-500"/>}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Shared Flashcard Set */}
                  {post.sharedFlashcardSet && (
                    <Link
                      to={`/study/${post.sharedFlashcardSet._id}`}
                      className="mx-4 mb-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-500/10 dark:to-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/30 flex items-center gap-3 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
                    >
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: post.sharedFlashcardSet.color }}>
                        <HiRectangleStack className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{post.sharedFlashcardSet.name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{post.sharedFlashcardSet.cards?.length || 0} thẻ</p>
                      </div>
                      <HiBookOpen className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                    </Link>
                  )}

                  {/* Images */}
                  {post.images.length > 0 && (
                    <div className="px-4 pb-3">
                      <div className={`grid gap-2 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                        {post.images.map((img, idx) => (
                          <img 
                            key={idx} 
                            src={img} 
                            alt="" 
                            onClick={() => setViewingImage(img)}
                            className={`rounded-lg w-full object-cover cursor-pointer hover:opacity-95 transition-opacity hover:shadow-lg ${
                              post.images.length === 1 ? 'max-h-[500px]' : 'max-h-96'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700 flex items-center gap-4">
                    <button
                      onClick={() => handleToggleLike(post._id)}
                      className={`flex items-center gap-1.5 text-sm font-medium transition-colors cursor-pointer ${
                        post.likes.includes(user!.id)
                          ? 'text-red-500'
                          : 'text-slate-500 hover:text-red-500'
                      }`}
                    >
                      <HiHeart className={`w-5 h-5 ${post.likes.includes(user!.id) ? 'fill-current' : ''}`} />
                      {post.likes.length > 0 && post.likes.length}
                    </button>
                    <button 
                      onClick={() => setShowComments({ ...showComments, [post._id]: !showComments[post._id] })}
                      className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-500 transition-colors cursor-pointer"
                    >
                      <HiChatBubbleLeft className="w-5 h-5" />
                      {post.comments.length > 0 && post.comments.length}
                    </button>
                  </div>

                  {/* Comments Section */}
                  <CommentSection
                    post={post}
                    currentUserId={user!.id}
                    showComments={!!showComments[post._id]}
                    onToggleCommentLike={handleToggleCommentLike}
                    onAddReply={handleAddReply}
                    onAddComment={handleAddComment}
                  />
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Thành viên ({group.members.length})</h3>
            <div className="space-y-3">
              {group.members.map((member) => (
                <div key={member._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-default group">
                  <Avatar 
                    avatarUrl={member.avatar}
                    displayName={member.displayName}
                    frameId={(member as any).avatarFrame}
                    size="sm"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-white">{member.displayName}</p>
                    <p className="text-sm text-slate-500">@{member.username}</p>
                  </div>
                  {group.admins.some(a => a._id === member._id) && (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full">
                      Admin
                    </span>
                  )}
                  {group.createdBy._id === member._id && (
                    <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-xs font-medium rounded-full">
                      Người tạo
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Post Modal */}
        {isCreatePostOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
                <div className="flex flex-1">
                  <button 
                    onClick={() => setIsPollMode(false)}
                    className={`flex-1 p-4 text-sm font-bold transition-colors border-b-2 ${!isPollMode ? 'text-blue-600 border-blue-600' : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300'}`}
                  >
                    Bài viết
                  </button>
                  <button 
                    onClick={() => setIsPollMode(true)}
                    className={`flex-1 p-4 text-sm font-bold transition-colors border-b-2 ${isPollMode ? 'text-blue-600 border-blue-600' : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300'}`}
                  >
                    Bình chọn
                  </button>
                </div>
                <button
                  onClick={() => setIsCreatePostOpen(false)}
                  className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <HiXMark className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                {isPollMode ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Câu hỏi</label>
                       <input
                          value={pollQuestion}
                          onChange={(e) => setPollQuestion(e.target.value)}
                          placeholder="Đặt câu hỏi của bạn..."
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Các lựa chọn</label>
                       {pollOptions.map((opt, idx) => (
                          <div key={idx} className="flex gap-2">
                             <input
                                value={opt}
                                onChange={(e) => {
                                   const newOptions = [...pollOptions];
                                   newOptions[idx] = e.target.value;
                                   setPollOptions(newOptions);
                                }}
                                placeholder={`Lựa chọn ${idx + 1}`}
                                className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                             />
                             {pollOptions.length > 2 && (
                                <button 
                                  onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}
                                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg cursor-pointer"
                                >
                                  <HiXMark className="w-5 h-5" />
                                </button>
                             )}
                          </div>
                       ))}
                       <button
                          onClick={() => setPollOptions([...pollOptions, ''])}
                          className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline p-1 cursor-pointer"
                       >
                          <HiPlus className="w-4 h-4" /> Thêm lựa chọn
                       </button>
                    </div>
                  </div>
                ) : (
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Viết gì đó..."
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-slate-900 dark:text-white"
                  />
                )}

                {/* Image Preview */}
                {newPostImages.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {newPostImages.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20">
                        <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
                        <button
                          onClick={() => setNewPostImages(newPostImages.filter((_, i) => i !== idx))}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full cursor-pointer"
                        >
                          <HiXMark className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Selected Flashcard Set */}
                {selectedFlashcardSet && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      Chia sẻ: {userFlashcardSets.find(s => s._id === selectedFlashcardSet)?.name}
                    </span>
                    <button
                      onClick={() => setSelectedFlashcardSet(null)}
                      className="text-blue-500 hover:text-blue-600 cursor-pointer"
                    >
                      <HiXMark className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Flashcard Picker */}
                {showFlashcardPicker && (
                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg max-h-48 overflow-y-auto">
                    {userFlashcardSets.length === 0 ? (
                      <p className="p-4 text-center text-slate-500 text-sm">Bạn chưa có bộ thẻ nào</p>
                    ) : (
                      userFlashcardSets.map((set) => (
                        <button
                          key={set._id}
                          onClick={() => {
                            setSelectedFlashcardSet(set._id);
                            setShowFlashcardPicker(false);
                          }}
                          className="w-full p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: set.color }}>
                            <HiRectangleStack className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white text-sm">{set.name}</p>
                            <p className="text-xs text-slate-500">{set.cards?.length || 0} thẻ</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}

                {/* Actions */}
                {!isPollMode && (
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                    >
                      <HiPhoto className="w-4 h-4" />
                      Ảnh
                    </button>
                    <button
                      onClick={() => setShowFlashcardPicker(!showFlashcardPicker)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                    >
                      <HiRectangleStack className="w-4 h-4" />
                      Chia sẻ thẻ
                    </button>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={handleCreatePost}
                  disabled={isPosting || (isPollMode ? (!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2) : (!newPostContent.trim() && !selectedFlashcardSet))}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isPosting ? (
                    <>
                      <HiArrowPath className="w-4 h-4 animate-spin" />
                      Đang đăng...
                    </>
                  ) : (
                    <>
                      <HiPaperAirplane className="w-4 h-4" />
                      Đăng bài
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Cài đặt nhóm</h2>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  <HiXMark className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar">
                {/* Edit Cover Image */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ảnh bìa</label>
                  <div className="relative h-40 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 group cursor-pointer"
                    onClick={() => coverInputRef.current?.click()}
                  >
                    {editCoverImage ? (
                      <img src={editCoverImage} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500" />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <HiCamera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                  />
                </div>

                {/* Edit Avatar */}
                <div className="flex justify-center -mt-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden cursor-pointer group"
                      onClick={() => avatarInputRef.current?.click()}
                    >
                      {editImage ? (
                        <img src={editImage} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <HiUserGroup className="w-10 h-10 text-white" />
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <HiCamera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tên nhóm</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Mô tả</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-slate-900 dark:text-white"
                  />
                </div>

                {/* Divider */}
                <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>

                {/* Privacy & Moderation Settings */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Quyền riêng tư & Kiểm duyệt</h3>
                  
                  {/* Allow Anonymous Posts */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Cho phép đăng ẩn danh</label>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Thành viên có thể đăng bài và bình luận mà không hiện tên</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAllowAnonymous(!allowAnonymous)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        allowAnonymous ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          allowAnonymous ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Require Approval */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Yêu cầu phê duyệt bài viết</label>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Bài viết phải được quản trị viên duyệt trước khi hiển thị</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRequireApproval(!requireApproval)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        requireApproval ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          requireApproval ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 p-4 border-t border-slate-200 dark:border-slate-700 shrink-0">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSaving ? (
                    <HiArrowPath className="w-4 h-4 animate-spin" />
                  ) : (
                    'Lưu thay đổi'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Viewer Modal */}
        <ImageViewerModal
          isOpen={!!viewingImage}
          imageUrl={viewingImage || ''}
          onClose={() => setViewingImage(null)}
        />
      </div>
    </MainLayout>
  );
};

export default GroupDetail;
