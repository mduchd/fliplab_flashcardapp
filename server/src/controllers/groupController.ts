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

    const { name, description, image, coverImage, isPublic, tags } = req.body;

    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    if (image !== undefined) group.image = image;
    if (coverImage !== undefined) group.coverImage = coverImage;
    if (isPublic !== undefined) group.isPublic = isPublic;
    if (tags) group.tags = tags;

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

    const { content, images, sharedFlashcardSet } = req.body;

    const post = await Post.create({
      groupId: group._id,
      author: req.userId,
      content,
      images: images || [],
      sharedFlashcardSet,
    });

    await post.populate('author', 'username displayName avatar');
    if (post.sharedFlashcardSet) {
      await post.populate('sharedFlashcardSet', 'name description cards color');
    }

    res.status(201).json({
      success: true,
      message: 'Đăng bài thành công',
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

    const posts = await Post.find({ groupId: group._id })
      .populate('author', 'username displayName avatar avatarFrame')
      .populate('sharedFlashcardSet', 'name description cards color')
      .populate('comments.author', 'username displayName avatar avatarFrame')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ groupId: group._id });

    res.json({
      success: true,
      data: { 
        posts,
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

    const { content } = req.body;

    post.comments.push({
      author: new Types.ObjectId(req.userId),
      content,
      likes: [],
      replies: [],
      createdAt: new Date(),
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

