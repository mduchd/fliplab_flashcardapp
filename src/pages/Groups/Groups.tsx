import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { groupService, Group } from '../../services/groupService';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import {
  HiPlus,
  HiUserGroup,
  HiUsers,
  HiGlobeAlt,
  HiLockClosed,
  HiMagnifyingGlass,
  HiArrowPath,
  HiCheck,
  HiXMark,
} from 'react-icons/hi2';

const Groups: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToastContext();

  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'my' | 'created'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Create group form
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupIsPublic, setNewGroupIsPublic] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadGroups();
  }, [filter]);

  const loadGroups = async () => {
    setIsLoading(true);
    try {
      const filterParam = filter === 'all' ? undefined : filter;
      const response = await groupService.getGroups(filterParam, searchQuery || undefined);
      if (response.success) {
        setGroups(response.data.groups);
      }
    } catch (error) {
      console.error('Failed to load groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadGroups();
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast.error('Vui lòng nhập tên nhóm');
      return;
    }

    setIsCreating(true);
    try {
      const response = await groupService.createGroup({
        name: newGroupName.trim(),
        description: newGroupDescription.trim(),
        isPublic: newGroupIsPublic,
      });

      if (response.success) {
        toast.success('Tạo nhóm thành công!');
        setIsCreateModalOpen(false);
        setNewGroupName('');
        setNewGroupDescription('');
        navigate(`/groups/${response.data.group._id}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi tạo nhóm');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGroup = async (groupId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const response = await groupService.joinGroup(groupId);
      if (response.success) {
        toast.success('Đã tham gia nhóm');
        loadGroups();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi');
    }
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-xl">
                <HiUserGroup className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              Nhóm học tập
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Tham gia nhóm để học tập cùng bạn bè
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors cursor-pointer"
          >
            <HiPlus className="w-5 h-5" />
            Tạo nhóm mới
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Filter Tabs */}
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            {[
              { key: 'all', label: 'Tất cả', icon: HiGlobeAlt },
              { key: 'my', label: 'Nhóm của tôi', icon: HiUsers },
              { key: 'created', label: 'Đã tạo', icon: HiUserGroup },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                  filter === key
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 relative">
            <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm nhóm..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
            />
          </form>
        </div>

        {/* Groups Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-5 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                  <div className="flex-1">
                    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <HiUserGroup className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Chưa có nhóm nào
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {filter === 'my' ? 'Bạn chưa tham gia nhóm nào' : 'Hãy tạo nhóm đầu tiên!'}
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors cursor-pointer"
            >
              <HiPlus className="w-5 h-5" />
              Tạo nhóm mới
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => {
              const isMember = group.members.some((m) => m._id === user?.id);
              
              return (
                <Link
                  key={group._id}
                  to={`/groups/${group._id}`}
                  className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:-translate-y-1 transition-all group"
                >
                  <div className="flex items-start gap-4 mb-4">
                    {/* Group Image */}
                    <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {group.image ? (
                        <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
                      ) : (
                        <HiUserGroup className="w-7 h-7 text-white" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {group.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <HiUsers className="w-4 h-4" />
                        <span>{group.members.length} thành viên</span>
                        {group.isPublic ? (
                          <HiGlobeAlt className="w-4 h-4 text-green-500" />
                        ) : (
                          <HiLockClosed className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  {group.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
                      {group.description}
                    </p>
                  )}

                  {/* Action */}
                  {isMember ? (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium">
                      <HiCheck className="w-4 h-4" />
                      Đã tham gia
                    </div>
                  ) : (
                    <button
                      onClick={(e) => handleJoinGroup(group._id, e)}
                      className="w-full py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg font-medium hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors cursor-pointer"
                    >
                      Tham gia
                    </button>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {/* Create Group Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Tạo nhóm mới</h2>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  <HiXMark className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Tên nhóm *
                  </label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="VD: Nhóm học IELTS"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    placeholder="Mô tả về nhóm..."
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {newGroupIsPublic ? (
                      <HiGlobeAlt className="w-5 h-5 text-green-500" />
                    ) : (
                      <HiLockClosed className="w-5 h-5 text-yellow-500" />
                    )}
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white text-sm">
                        {newGroupIsPublic ? 'Công khai' : 'Riêng tư'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {newGroupIsPublic ? 'Ai cũng có thể tìm và tham gia' : 'Chỉ người được mời mới tham gia được'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNewGroupIsPublic(!newGroupIsPublic)}
                    className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${
                      newGroupIsPublic ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      newGroupIsPublic ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>

              <div className="flex gap-3 p-5 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateGroup}
                  disabled={isCreating || !newGroupName.trim()}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isCreating ? (
                    <>
                      <HiArrowPath className="w-4 h-4 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    'Tạo nhóm'
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

export default Groups;
