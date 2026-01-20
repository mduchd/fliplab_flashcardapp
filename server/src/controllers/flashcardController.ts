import { Response } from 'express';
import { FlashcardSet } from '../models/FlashcardSet.js';
import { AuthRequest } from '../middleware/auth.js';

// @desc    Get all flashcard sets for user
// @route   GET /api/flashcards
// @access  Private
export const getFlashcardSets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, tags } = req.query;
    
    let query: any = { userId: req.userId };
    
    // Search by name or description
    if (search) {
      query.$text = { $search: search as string };
    }
    
    // Filter by tags
    if (tags) {
      const tagArray = (tags as string).split(',');
      query.tags = { $in: tagArray };
    }
    
    const flashcardSets = await FlashcardSet.find(query)
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: { flashcardSets },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching flashcard sets',
    });
  }
};

// @desc    Get single flashcard set
// @route   GET /api/flashcards/:id
// @access  Private
export const getFlashcardSet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const flashcardSet = await FlashcardSet.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!flashcardSet) {
      res.status(404).json({
        success: false,
        message: 'Flashcard set not found',
      });
      return;
    }

    res.json({
      success: true,
      data: { flashcardSet },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching flashcard set',
    });
  }
};

// @desc    Create flashcard set
// @route   POST /api/flashcards
// @access  Private
export const createFlashcardSet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const flashcardSet = await FlashcardSet.create({
      ...req.body,
      userId: req.userId,
    });

    res.status(201).json({
      success: true,
      message: 'Flashcard set created successfully',
      data: { flashcardSet },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating flashcard set',
    });
  }
};

// @desc    Update flashcard set
// @route   PUT /api/flashcards/:id
// @access  Private
export const updateFlashcardSet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const flashcardSet = await FlashcardSet.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
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
      message: 'Flashcard set updated successfully',
      data: { flashcardSet },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating flashcard set',
    });
  }
};

// @desc    Delete flashcard set
// @route   DELETE /api/flashcards/:id
// @access  Private
export const deleteFlashcardSet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const flashcardSet = await FlashcardSet.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!flashcardSet) {
      res.status(404).json({
        success: false,
        message: 'Flashcard set not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Flashcard set deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting flashcard set',
    });
  }
};

// @desc    Update study progress
// @route   POST /api/flashcards/:id/study
// @access  Private
export const updateStudyProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { cardId, box } = req.body;
    
    const flashcardSet = await FlashcardSet.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!flashcardSet) {
      res.status(404).json({
        success: false,
        message: 'Flashcard set not found',
      });
      return;
    }

    // Update card box (spaced repetition)
    const card = flashcardSet.cards.id(cardId);
    if (card) {
      card.box = box;
      if (box > 1) {
        // Set next review date based on box number
        const daysToAdd = Math.pow(2, box - 1);
        card.nextReview = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);
      }
    }

    flashcardSet.lastStudied = new Date();
    flashcardSet.totalStudies += 1;
    await flashcardSet.save();

    res.json({
      success: true,
      message: 'Study progress updated',
      data: { flashcardSet },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating study progress',
    });
  }
};
