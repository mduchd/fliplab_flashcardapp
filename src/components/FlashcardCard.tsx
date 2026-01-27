// Flashcard Card component để hiển thị một flashcard set
import React from 'react';
import type { FlashcardSet } from '../types';
import { HiPencil, HiTrash } from 'react-icons/hi2';

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
              title="Chỉnh sửa"
            >
              <HiPencil className="w-4 h-4" />
            </button>
            <button
              className="btn-icon text-red-500 hover:text-red-700"
              onClick={handleDelete}
              aria-label="Xóa"
              title="Xóa"
            >
              <HiTrash className="w-4 h-4" />
            </button>
          </div>
        </div>
        {set.description && <p className="set-description">{set.description}</p>}
        <div className="set-footer">
          <span className="set-category">{set.category || 'Chưa phân loại'}</span>
          <span className="set-cards-count">{set.cards?.length || 0} thẻ</span>
        </div>
      </div>
    </div>
  );
};
