import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Avatar from '../../components/Avatar';
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

  // Settings modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImage, setEditImage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
        setPosts(response.data.posts);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
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

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && !selectedFlashcardSet) {
      toast.error('Vui lòng nhập nội dung hoặc chia sẻ bộ thẻ');
      return;
    }

    setIsPosting(true);
    try {
      const response = await groupService.createPost(id!, {
        content: newPostContent.trim(),
        images: newPostImages,
        sharedFlashcardSet: selectedFlashcardSet || undefined,
      });

      if (response.success) {
        toast.success('Đăng bài thành công!');
        setNewPostContent('');
        setNewPostImages([]);
        setSelectedFlashcardSet(null);
        setIsCreatePostOpen(false);
        loadPosts();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi đăng bài');
    } finally {
      setIsPosting(false);
    }
  };

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

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <HiArrowPath className="w-8 h-8 text-indigo-500 animate-spin" />
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden mb-6 border border-slate-200 dark:border-slate-700">
          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
            <button
              onClick={() => navigate('/groups')}
              className="absolute top-4 left-4 p-2 bg-black/20 hover:bg-black/40 rounded-lg transition-colors cursor-pointer"
            >
              <HiArrowLeft className="w-5 h-5 text-white" />
            </button>
            {isAdmin && (
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-lg transition-colors cursor-pointer"
              >
                <HiCog6Tooth className="w-5 h-5 text-white" />
              </button>
            )}
          </div>

          {/* Info */}
          <div className="p-5 -mt-10 relative">
            <div className="flex items-end gap-4 mb-4">
              {/* Group Image */}
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden">
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

            {/* Tabs */}
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
                      ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
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
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {/* Create Post */}
            {isMember && (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => {
                    setIsCreatePostOpen(true);
                    loadUserFlashcardSets();
                  }}
                  className="w-full flex items-center gap-3 text-left cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <HiPencilSquare className="w-5 h-5 text-slate-500" />
                  </div>
                  <span className="text-slate-500 dark:text-slate-400">Viết bài mới...</span>
                </button>
              </div>
            )}

            {/* Posts */}
            {posts.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="text-slate-600 dark:text-slate-400">Chưa có bài viết nào</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post._id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  {/* Post Header */}
                  <div className="p-4 flex items-center gap-3">
                    <Avatar 
                      avatarUrl={post.author.avatar}
                      displayName={post.author.displayName}
                      frameId={(post.author as any).avatarFrame}
                      size="sm"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">{post.author.displayName}</p>
                      <p className="text-xs text-slate-500">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="px-4 pb-3">
                    <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{post.content}</p>
                  </div>

                  {/* Shared Flashcard Set */}
                  {post.sharedFlashcardSet && (
                    <Link
                      to={`/study/${post.sharedFlashcardSet._id}`}
                      className="mx-4 mb-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-lg border border-indigo-200 dark:border-indigo-500/30 flex items-center gap-3 hover:shadow-md transition-shadow"
                    >
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: post.sharedFlashcardSet.color }}>
                        <HiRectangleStack className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 dark:text-white">{post.sharedFlashcardSet.name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{post.sharedFlashcardSet.cards?.length || 0} thẻ</p>
                      </div>
                      <HiBookOpen className="w-5 h-5 text-indigo-500" />
                    </Link>
                  )}

                  {/* Images */}
                  {post.images.length > 0 && (
                    <div className="px-4 pb-3">
                      <div className={`grid gap-2 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                        {post.images.map((img, idx) => (
                          <img key={idx} src={img} alt="" className="rounded-lg w-full object-cover max-h-80" />
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
                    <button className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-500 transition-colors cursor-pointer">
                      <HiChatBubbleLeft className="w-5 h-5" />
                      {post.comments.length > 0 && post.comments.length}
                    </button>
                  </div>
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
                <div key={member._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
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
                    <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-medium rounded-full">
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
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Tạo bài viết</h2>
                <button
                  onClick={() => setIsCreatePostOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  <HiXMark className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Viết gì đó..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-900 dark:text-white"
                />

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
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg flex items-center justify-between">
                    <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                      Chia sẻ: {userFlashcardSets.find(s => s._id === selectedFlashcardSet)?.name}
                    </span>
                    <button
                      onClick={() => setSelectedFlashcardSet(null)}
                      className="text-indigo-500 hover:text-indigo-600 cursor-pointer"
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
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={handleCreatePost}
                  disabled={isPosting || (!newPostContent.trim() && !selectedFlashcardSet)}
                  className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
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
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Cài đặt nhóm</h2>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  <HiXMark className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ảnh nhóm (URL)</label>
                  <input
                    type="text"
                    value={editImage}
                    onChange={(e) => setEditImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tên nhóm</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Mô tả</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 p-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
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
      </div>
    </MainLayout>
  );
};

export default GroupDetail;
