// Flashcard Card component để hiển thị một flashcard set
import React from 'react';
import type { FlashcardSet } from '../types';

interface FlashcardCardProps {
  set: FlashcardSet;
  onClick: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const FlashcardCard: React.FC<FlashcardCardProps> = ({
  set,
  onClick,
  onEdit,
  onDelete,
}) => {
  const handleCardClick = () => {
    onClick(set.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(set.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(set.id);
  };

  return (
    <div className="flashcard-grid-item" onClick={handleCardClick}>
      <div className="set-card">
        <div className="set-card-header">
          <h3 className="set-title">{set.name}</h3>
          <div className="set-actions">
            <button
              className="btn-icon"
              onClick={handleEdit}
              aria-label="Chỉnh sửa"
            >
              ✏️
            </button>
            <button
              className="btn-icon"
              onClick={handleDelete}
              aria-label="Xóa"
            >
              🗑️
            </button>
          </div>
        </div>
        <p className="set-description">{set.description}</p>
        <div className="set-footer">
          <span className="set-category">{set.category}</span>
          <span className="set-cards-count">{set.cards.length} thẻ</span>
        </div>
      </div>
    </div>
  );
};
