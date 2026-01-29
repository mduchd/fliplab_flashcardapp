import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Comment } from '../models/Comment.js';
import { Post } from '../models/Post.js';
import { Notification } from '../models/Notification.js';

// Tạo bình luận mới
export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const { postId, content, parentId, isAnonymous } = req.body;
    const userId = req.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Bài viết không tồn tại' });
    }

    const newComment = new Comment({
      postId,
      author: userId,
      content,
      parentId: parentId || null,
      isAnonymous: isAnonymous || false,
    });

    await newComment.save();

    // Nếu người comment không phải tác giả bài viết -> Tạo thông báo
    if (post.author.toString() !== userId?.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: userId,
        type: 'comment_post',
        referenceId: postId,
        referenceModel: 'Post',
        content: `đã bình luận về bài viết của bạn: "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`,
        isRead: false
      });
    }

    // Populate thông tin tác giả để trả về frontend hiển thị ngay
    await newComment.populate('author', 'username displayName avatar avatarFrame');

    res.status(201).json({
      success: true,
      data: newComment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error });
  }
};

// Lấy danh sách bình luận của bài viết
export const getPostComments = async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;
    
    // Lấy comment cha trước (parentId = null)
    // Sắp xếp cũ nhất lên trước (giống Facebook) hoặc mới nhất lên trước tùy bạn
    // Lấy tất cả comments (cả cha lẫn con) để frontend tự xử lý phân cấp
    const comments = await Comment.find({ postId })
      .populate('author', 'username displayName avatar avatarFrame')
      .sort({ createdAt: 1 });

    // TODO: Nếu muốn lấy cả reply, có thể implement logic đệ quy hoặc lấy flat list rồi ghép ở frontend
    // Ở đây tạm thời trả về comment cha

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error });
  }
};

// Xóa bình luận (Chỉ tác giả hoặc Admin mới xóa được)
export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Bình luận không tồn tại' });
    }

    // Kiểm tra quyền
    if (comment.author.toString() !== userId?.toString()) {
       // TODO: Check thêm quyền Admin nếu cần
      return res.status(403).json({ success: false, message: 'Không có quyền xóa' });
    }

    await comment.deleteOne();
    // Xóa luôn các reply của comment này
    await Comment.deleteMany({ parentId: id });

    res.status(200).json({ success: true, message: 'Đã xóa bình luận' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error });
  }
};
