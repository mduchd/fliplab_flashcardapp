import React from 'react';
import { HiXMark } from 'react-icons/hi2';

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
}

const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ isOpen, onClose, imageUrl }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fadeIn"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer"
      >
        <HiXMark className="w-6 h-6" />
      </button>
      
      <img
        src={imageUrl}
        alt="Full size"
        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

export default ImageViewerModal;
