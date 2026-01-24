import { Response } from 'express';
import { Folder } from '../models/Folder.js';
import { FlashcardSet } from '../models/FlashcardSet.js';
import { AuthRequest } from '../middleware/auth.js';

// @desc    Create new folder
// @route   POST /api/folders
// @access  Private
export const createFolder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, color, icon } = req.body;

    const folder = await Folder.create({
      userId: req.userId,
      name,
      description,
      color,
      icon,
    });

    res.status(201).json({
      success: true,
      message: 'Folder created successfully',
      data: { folder },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating folder',
    });
  }
};

// @desc    Get all folders for user
// @route   GET /api/folders
// @access  Private
export const getFolders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const folders = await Folder.find({ userId: req.userId }).sort({ createdAt: -1 });

    // Get flashcard set count for each folder
    const foldersWithCount = await Promise.all(
      folders.map(async (folder) => {
        const setCount = await FlashcardSet.countDocuments({ folderId: folder._id });
        return {
          ...folder.toObject(),
          setCount,
        };
      })
    );

    res.json({
      success: true,
      data: { folders: foldersWithCount },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching folders',
    });
  }
};

// @desc    Get single folder with its flashcard sets
// @route   GET /api/folders/:id
// @access  Private
export const getFolder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, userId: req.userId });

    if (!folder) {
      res.status(404).json({
        success: false,
        message: 'Folder not found',
      });
      return;
    }

    const flashcardSets = await FlashcardSet.find({ folderId: folder._id, userId: req.userId })
      .sort({ updatedAt: -1 });

    // Map to include cardCount since we want to show card count but not send entire cards array
    const flashcardSetsWithCount = flashcardSets.map(set => ({
      _id: set._id,
      name: set.name,
      description: set.description,
      cardCount: set.cards?.length || 0,
      userId: set.userId,
      isPublic: set.isPublic,
      tags: set.tags,
      color: set.color,
      createdAt: set.createdAt,
      updatedAt: set.updatedAt,
      lastStudied: set.lastStudied,
      totalStudies: set.totalStudies,
      folderId: set.folderId,
    }));

    res.json({
      success: true,
      data: { 
        folder,
        flashcardSets: flashcardSetsWithCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching folder',
    });
  }
};

// @desc    Update folder
// @route   PUT /api/folders/:id
// @access  Private
export const updateFolder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, color, icon } = req.body;

    const folder = await Folder.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { name, description, color, icon },
      { new: true, runValidators: true }
    );

    if (!folder) {
      res.status(404).json({
        success: false,
        message: 'Folder not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Folder updated successfully',
      data: { folder },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating folder',
    });
  }
};

// @desc    Delete folder (sets inside will be moved out, not deleted)
// @route   DELETE /api/folders/:id
// @access  Private
export const deleteFolder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, userId: req.userId });

    if (!folder) {
      res.status(404).json({
        success: false,
        message: 'Folder not found',
      });
      return;
    }

    // Move all flashcard sets out of folder (set folderId to null)
    await FlashcardSet.updateMany(
      { folderId: folder._id },
      { $set: { folderId: null } }
    );

    await folder.deleteOne();

    res.json({
      success: true,
      message: 'Folder deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting folder',
    });
  }
};

// @desc    Move flashcard set to folder
// @route   PUT /api/folders/:id/sets/:setId
// @access  Private
export const moveSetToFolder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id: folderId, setId } = req.params;

    // Verify folder exists and belongs to user (or folderId is 'none' to remove from folder)
    if (folderId !== 'none') {
      const folder = await Folder.findOne({ _id: folderId, userId: req.userId });
      if (!folder) {
        res.status(404).json({
          success: false,
          message: 'Folder not found',
        });
        return;
      }
    }

    // Update flashcard set
    const flashcardSet = await FlashcardSet.findOneAndUpdate(
      { _id: setId, userId: req.userId },
      { folderId: folderId === 'none' ? null : folderId },
      { new: true }
    );

    if (!flashcardSet) {
      res.status(404).json({
        success: false,
        message: 'Flashcard set not found',
      });
      return;
    }

    res.json({
      success: true,
      message: folderId === 'none' ? 'Set removed from folder' : 'Set moved to folder',
      data: { flashcardSet },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error moving set to folder',
    });
  }
};
