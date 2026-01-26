import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Group } from '../models/Group.js';
import { Post } from '../models/Post.js';
import { Types } from 'mongoose';

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
export const createGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, image, isPublic, tags } = req.body;

    const group = await Group.create({
      name,
      description,
      image,
      createdBy: req.userId,
      admins: [req.userId],
      members: [req.userId],
      isPublic: isPublic !== false,
      tags: tags || [],
    });

    res.status(201).json({
      success: true,
      message: 'Tạo nhóm thành công',
      data: { group },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi tạo nhóm',
    });
  }
};

// @desc    Get all groups (public + user's groups)
// @route   GET /api/groups
// @access  Private
export const getGroups = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, filter } = req.query;
    
    let query: any = {};
    
    if (filter === 'my') {
      // Only user's groups
      query.members = req.userId;
    } else if (filter === 'created') {
      // Groups created by user
      query.createdBy = req.userId;
    } else {
      // Public groups + user's groups
      query.$or = [
        { isPublic: true },
        { members: req.userId },
      ];
    }

    if (search) {
      query.$text = { $search: search as string };
    }

    const groups = await Group.find(query)
      .populate('createdBy', 'username displayName avatar avatarFrame')
      .populate('members', 'username displayName avatar avatarFrame')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: { groups },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách nhóm',
    });
  }
};

// @desc    Get single group
// @route   GET /api/groups/:id
// @access  Private
export const getGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('createdBy', 'username displayName avatar avatarFrame')
      .populate('admins', 'username displayName avatar avatarFrame')
      .populate('members', 'username displayName avatar avatarFrame');

    if (!group) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhóm',
      });
      return;
    }

    // Check if user can access
    const isMember = group.members.some((m: any) => m._id.toString() === req.userId);
    if (!group.isPublic && !isMember) {
      res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập nhóm này',
      });
      return;
    }

    res.json({
      success: true,
      data: { group },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy thông tin nhóm',
    });
  }
};

// @desc    Update group (admin only)
// @route   PUT /api/groups/:id
// @access  Private (Admin)
export const updateGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhóm',
      });
      return;
    }

    // Check if user is admin
    const isAdmin = group.admins.some((a) => a.toString() === req.userId);
    if (!isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chỉnh sửa nhóm này',
      });
      return;
    }

    const { name, description, image, coverImage, isPublic, tags, settings } = req.body;

    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    if (image !== undefined) group.image = image;
    if (coverImage !== undefined) group.coverImage = coverImage;
    if (isPublic !== undefined) group.isPublic = isPublic;
    if (tags) group.tags = tags;
    if (settings) {
      if (group.settings) {
         if (settings.allowAnonymousPosts !== undefined) group.settings.allowAnonymousPosts = settings.allowAnonymousPosts;
         if (settings.requireApproval !== undefined) group.settings.requireApproval = settings.requireApproval;
      } else {
         group.settings = {
            allowAnonymousPosts: settings.allowAnonymousPosts || false,
            requireApproval: settings.requireApproval || false
         };
      }
    }

    await group.save();

    res.json({
      success: true,
      message: 'Cập nhật nhóm thành công',
      data: { group },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật nhóm',
    });
  }
};

// @desc    Join group
// @route   POST /api/groups/:id/join
// @access  Private
export const joinGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhóm',
      });
      return;
    }

    const isMember = group.members.some((m) => m.toString() === req.userId);
    if (isMember) {
      res.status(400).json({
        success: false,
        message: 'Bạn đã là thành viên của nhóm này',
      });
      return;
    }

    group.members.push(new Types.ObjectId(req.userId));
    await group.save();

    res.json({
      success: true,
      message: 'Tham gia nhóm thành công',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi tham gia nhóm',
    });
  }
};

// @desc    Leave group
// @route   POST /api/groups/:id/leave
// @access  Private
export const leaveGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhóm',
      });
      return;
    }

    // Creator cannot leave
    if (group.createdBy.toString() === req.userId) {
      res.status(400).json({
        success: false,
        message: 'Người tạo nhóm không thể rời nhóm. Hãy chuyển quyền sở hữu trước.',
      });
      return;
    }

    group.members = group.members.filter((m) => m.toString() !== req.userId);
    group.admins = group.admins.filter((a) => a.toString() !== req.userId);
    await group.save();

    res.json({
      success: true,
      message: 'Rời nhóm thành công',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi rời nhóm',
    });
  }
};

// @desc    Delete group (creator only)
// @route   DELETE /api/groups/:id
// @access  Private (Creator)
export const deleteGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhóm',
      });
      return;
    }

    if (group.createdBy.toString() !== req.userId) {
      res.status(403).json({
        success: false,
        message: 'Chỉ người tạo mới có thể xóa nhóm',
      });
      return;
    }

    // Delete all posts in group
    await Post.deleteMany({ groupId: group._id });
    await group.deleteOne();

    res.json({
      success: true,
      message: 'Xóa nhóm thành công',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi xóa nhóm',
    });
  }
};

// ==================== POST CONTROLLERS ====================

// @desc    Create post in group
// @route   POST /api/groups/:id/posts
// @access  Private (Member)
export const createPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhóm',
      });
      return;
    }

    const isMember = group.members.some((m) => m.toString() === req.userId);
    if (!isMember) {
      res.status(403).json({
        success: false,
        message: 'Bạn phải là thành viên để đăng bài',
      });
      return;
    }

    const { content, images, sharedFlashcardSet, poll, isAnonymous } = req.body;

    // Check approval setting
    const isAdmin = group.admins.some(a => a.toString() === req.userId);
    const requireApproval = group.settings?.requireApproval && !isAdmin;
    const status = requireApproval ? 'pending' : 'approved';

    const post = await Post.create({
      groupId: group._id,
      author: req.userId,
      content,
      images: images || [],
      sharedFlashcardSet,
      poll: poll && poll.question && poll.options?.length >= 2 ? {
        question: poll.question,
        options: poll.options.map((text: string) => ({ text, votes: [] }))
      } : undefined,
      isAnonymous: !!isAnonymous,
      status,
    });

    await post.populate('author', 'username displayName avatar');
    if (post.sharedFlashcardSet) {
      await post.populate('sharedFlashcardSet', 'name description cards color');
    }

    res.status(201).json({
      success: true,
      message: status === 'pending' ? 'Bài viết đang chờ duyệt bởi quản trị viên' : 'Đăng bài thành công',
      data: { post },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi đăng bài',
    });
  }
};

// @desc    Get posts in group
// @route   GET /api/groups/:id/posts
// @access  Private (Member)
export const getPosts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhóm',
      });
      return;
    }

    const isMember = group.members.some((m) => m.toString() === req.userId);
    if (!group.isPublic && !isMember) {
      res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem bài viết trong nhóm này',
      });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Filter by status
    const status = req.query.status as string;
    const isAdmin = group.admins.some(a => a.toString() === req.userId);
    
    let query: any = { groupId: group._id };
    
    if (status && ['approved', 'pending', 'rejected'].includes(status)) {
       // Only admin can view pending/rejected
       if (isAdmin) {
          query.status = status;
       } else {
          query.status = 'approved'; 
       }
    } else {
       query.status = 'approved';
    }
    
    // Also user can see their own pending posts? maybe later.

    const posts = await Post.find(query)
      .populate('author', 'username displayName avatar avatarFrame')
      .populate('sharedFlashcardSet', 'name description cards color')
      .populate('comments.author', 'username displayName avatar avatarFrame')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(query);

    // Handle Anonymity
    const transformedPosts = posts.map(post => {
       const p = post.toObject() as any;
       
       if (p.isAnonymous) {
          // If admin, maybe they can see? For now, let's hide for everyone to be safe, or show for admin?
          // Usually admins should know. But for privacy, let's keep it strictly anonymous or mark it.
          // Let's hide it for now, but maybe add a flag "realAuthor" for admin? 
          // Requirement: "comment ẩn danh"
          
          if (!isAdmin) {
             p.author = {
                _id: 'anonymous',
                username: 'anonymous',
                displayName: 'Thành viên ẩn danh',
                avatar: '', // You might want a specific anonymous avatar
                avatarFrame: 'none'
             };
          } else {
             p.author.displayName = `${p.author.displayName} (Ẩn danh)`;
          }
       }

       if (p.comments) {
          p.comments = p.comments.map((c: any) => {
             if (c.isAnonymous) {
                if (!isAdmin) {
                   c.author = {
                      _id: 'anonymous',
                      username: 'anonymous',
                      displayName: 'Thành viên ẩn danh',
                      avatar: '',
                   };
                } else {
                   c.author.displayName = `${c.author.displayName} (Ẩn danh)`;
                }
             }
             return c;
          });
       }
       return p;
    });

    res.json({
      success: true,
      data: {
        posts: transformedPosts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });


  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy bài viết',
    });
  }
};

// @desc    Like/Unlike post
// @route   POST /api/groups/:groupId/posts/:postId/like
// @access  Private (Member)
export const toggleLike = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết',
      });
      return;
    }

    const likeIndex = post.likes.findIndex((l) => l.toString() === req.userId);
    
    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push(new Types.ObjectId(req.userId));
    }

    await post.save();

    res.json({
      success: true,
      data: { 
        liked: likeIndex === -1,
        likesCount: post.likes.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi',
    });
  }
};

// @desc    Add comment to post
// @route   POST /api/groups/:groupId/posts/:postId/comments
// @access  Private (Member)
export const addComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết',
      });
      return;
    }

    const { content, isAnonymous } = req.body;

    post.comments.push({
      author: new Types.ObjectId(req.userId),
      content,
      likes: [],
      replies: [],
      createdAt: new Date(),
      isAnonymous: !!isAnonymous,
    });

    await post.save();
    await post.populate('comments.author', 'username displayName avatar');

    res.status(201).json({
      success: true,
      message: 'Đã thêm bình luận',
      data: { comments: post.comments },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi thêm bình luận',
    });
  }
};

// @desc    Delete post
// @route   DELETE /api/groups/:groupId/posts/:postId
// @access  Private (Author or Admin)
export const deletePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết',
      });
      return;
    }

    const group = await Group.findById(post.groupId);
    const isAdmin = group?.admins.some((a) => a.toString() === req.userId);
    const isAuthor = post.author.toString() === req.userId;

    if (!isAdmin && !isAuthor) {
      res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa bài viết này',
      });
      return;
    }

    await post.deleteOne();

    res.json({
      success: true,
      message: 'Xóa bài viết thành công',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi xóa bài viết',
    });
  }
};

// @desc    Toggle like on comment
// @route   POST /api/groups/:groupId/posts/:postId/comments/:commentId/like
// @access  Private (Member)
export const toggleCommentLike = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết',
      });
      return;
    }

    const comment = (post.comments as any).id(req.params.commentId);
    if (!comment) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy bình luận',
      });
      return;
    }

    const likeIndex = comment.likes.findIndex((l: Types.ObjectId) => l.toString() === req.userId);
    
    if (likeIndex > -1) {
      comment.likes.splice(likeIndex, 1);
    } else {
      comment.likes.push(new Types.ObjectId(req.userId));
    }

    await post.save();

    res.json({
      success: true,
      data: { 
        liked: likeIndex === -1,
        likesCount: comment.likes.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi',
    });
  }
};

// @desc    Add reply to comment
// @route   POST /api/groups/:groupId/posts/:postId/comments/:commentId/replies
// @access  Private (Member)
export const addReply = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết',
      });
      return;
    }

    const comment = (post.comments as any).id(req.params.commentId);
    if (!comment) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy bình luận',
      });
      return;
    }

    const { content } = req.body;

    comment.replies.push({
      author: new Types.ObjectId(req.userId),
      content,
      createdAt: new Date(),
    });

    await post.save();
    await post.populate('comments.replies.author', 'username displayName avatar avatarFrame');

    res.status(201).json({
      success: true,
      message: 'Đã thêm trả lời',
      data: { replies: comment.replies },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi thêm trả lời',
    });
  }
};


// @desc    Toggle pin post
// @route   POST /api/groups/:groupId/posts/:postId/pin
// @access  Private (Admin only)
export const togglePinPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết',
      });
      return;
    }

    const group = await Group.findById(post.groupId);
    const isAdmin = group?.admins.some((a) => a.toString() === req.userId);

    if (!isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Chỉ quản trị viên mới có thể ghim bài viết',
      });
      return;
    }

    post.isPinned = !post.isPinned;
    await post.save();

    res.json({
      success: true,
      message: post.isPinned ? 'Đã ghim bài viết' : 'Đã bỏ ghim bài viết',
      data: { isPinned: post.isPinned },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi ghim bài viết',
    });
  }
};

// @desc    Vote in poll
// @route   POST /api/groups/:groupId/posts/:postId/vote
// @access  Private (Member)
export const votePoll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { optionIndex } = req.body;
    const postId = req.params.postId;
    
    // Verify post exists and has poll
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết',
      });
      return;
    }

    if (!post.poll) {
      res.status(400).json({
        success: false,
        message: 'Bài viết không có bình chọn',
      });
      return;
    }

    // Check if user is member
    const group = await Group.findById(post.groupId);
    if (!group?.members.some(m => m.toString() === req.userId)) {
      res.status(403).json({
        success: false,
        message: 'Bạn phải là thành viên nhóm để bình chọn',
      });
      return;
    }

    // Validate option index
    if (typeof optionIndex !== 'number' || optionIndex < 0 || optionIndex >= post.poll.options.length) {
      res.status(400).json({
        success: false,
        message: 'Lựa chọn không hợp lệ',
      });
      return;
    }

    const userId = new Types.ObjectId(req.userId);

    // ATOMIC UPDATE: Remove user's vote from all options, then add to selected option
    // Step 1: Remove existing votes (for single-choice behavior)
    const pullUpdates: any = {};
    for (let i = 0; i < post.poll.options.length; i++) {
      pullUpdates[`poll.options.${i}.votes`] = userId;
    }

    await Post.updateOne(
      { _id: postId },
      { $pull: pullUpdates }
    );

    // Step 2: Add vote to selected option
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $addToSet: { [`poll.options.${optionIndex}.votes`]: userId } },
      { new: true }
    );

    if (!updatedPost || !updatedPost.poll) {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật vote',
      });
      return;
    }

    res.json({
      success: true,
      data: { poll: updatedPost.poll },
    });
  } catch (error: any) {
    console.error('Vote poll error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi bình chọn',
    });
  }
};

// @desc    Delete comment
// @route   DELETE /api/groups/:groupId/posts/:postId/comments/:commentId
// @access  Private (Author or Admin)
export const deleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết',
      });
      return;
    }

    const comment = (post.comments as any).id(req.params.commentId);
    if (!comment) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy bình luận',
      });
      return;
    }

    const group = await Group.findById(post.groupId);
    const isAdmin = group?.admins.some(a => a.toString() === req.userId);
    const isAuthor = comment.author.toString() === req.userId;

    if (!isAdmin && !isAuthor) {
      res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa bình luận này',
      });
      return;
    }

    comment.deleteOne();
    await post.save();

    res.json({
      success: true,
      message: 'Đã xóa bình luận',
      data: { comments: post.comments }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi xóa bình luận',
    });
  }
};

// @desc    Approve post
// @route   POST /api/groups/:groupId/posts/:postId/approve
// @access  Private (Admin)
export const approvePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      res.status(404).json({ success: false, message: 'Post not found' });
      return;
    }

    const group = await Group.findById(post.groupId);
    const isAdmin = group?.admins.some(a => a.toString() === req.userId);

    if (!isAdmin) {
      res.status(403).json({ success: false, message: 'Chỉ quản trị viên mới có quyền duyệt bài' });
      return;
    }

    post.status = 'approved';
    await post.save();

    res.json({ success: true, message: 'Đã duyệt bài viết', data: { post } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject post
// @route   POST /api/groups/:groupId/posts/:postId/reject
// @access  Private (Admin)
export const rejectPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      res.status(404).json({ success: false, message: 'Post not found' });
      return;
    }

    const group = await Group.findById(post.groupId);
    const isAdmin = group?.admins.some(a => a.toString() === req.userId);

    if (!isAdmin) {
      res.status(403).json({ success: false, message: 'Chỉ quản trị viên mới có quyền từ chối bài' });
      return;
    }

    post.status = 'rejected';
    await post.save();

    res.json({ success: true, message: 'Đã từ chối bài viết', data: { post } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Explore groups and flashcards
// @route   GET /api/groups/explore/all
// @access  Private
export const exploreContent = async (req: AuthRequest, res: Response): Promise<void> => {
   try {
      // Suggest groups: Public groups, sorted by member count, limit 10
      const suggestedGroups = await Group.find({ isPublic: true })
         .sort({ members: -1 }) // Sort by number of members descending (simplified assumption for now, or just createdAt)
         .limit(10)
         .select('name description image members tags');

      // Note: to sort by member count size we need aggregation usually, or just store memberCount in model
      // For now, let's just show newest or random public groups

      res.json({
         success: true,
         data: {
            groups: suggestedGroups,
            // flashcards: ... (can add later if Flashcard model is imported)
         }
      });
   } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
   }
};
