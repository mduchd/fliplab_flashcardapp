// Custom hook để quản lý Flashcard Sets - chuyển đổi từ app.js
import { useState, useEffect } from 'react';
import type { FlashcardSet } from '../types';
import { getFlashcardSets, saveFlashcardSets } from '../utils/localStorage';
import { generateId } from '../utils/helpers';

export const useFlashcardSets = () => {
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);

  // Load từ localStorage khi component mount
  useEffect(() => {
    const loadedSets = getFlashcardSets();
    setSets(loadedSets);
    setLoading(false);
  }, []);

  // Save vào localStorage mỗi khi sets thay đổi
  useEffect(() => {
    if (!loading) {
      saveFlashcardSets(sets);
    }
  }, [sets, loading]);

  const addSet = (set: Omit<FlashcardSet, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSet: FlashcardSet = {
      ...set,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSets((prev) => [...prev, newSet]);
    return newSet;
  };

  const updateSet = (id: string, updates: Partial<FlashcardSet>) => {
    setSets((prev) =>
      prev.map((set) =>
        set.id === id
          ? { ...set, ...updates, updatedAt: new Date().toISOString() }
          : set
      )
    );
  };

  const deleteSet = (id: string) => {
    setSets((prev) => prev.filter((set) => set.id !== id));
  };

  const getSetById = (id: string): FlashcardSet | undefined => {
    return sets.find((set) => set.id === id);
  };

  return {
    sets,
    loading,
    addSet,
    updateSet,
    deleteSet,
    getSetById,
  };
};
