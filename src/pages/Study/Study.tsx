import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flashcardService, FlashcardSet } from '../../services/flashcardService';
import MainLayout from '../../components/layout/MainLayout';
import { 
  HiArrowLeft as ArrowLeft, 
  HiArrowRight as ArrowRight, 
  HiArrowPath as RotateCw, 
  HiCheck as Check, 
  HiXMark as X, 
  HiArrowUturnLeft as RotateCcw, 
  HiTrophy as Trophy,
  HiArrowPath as Loader2,
  HiHome as Home,
  HiExclamationCircle as AlertCircle,
  HiSquares2X2 as Layers,
  HiArrowsRightLeft as Shuffle,
  HiViewColumns as LayoutGrid,
  HiCreditCard as CreditCard,
  HiPuzzlePiece as Puzzle,
  HiPencil as Edit2,
  HiBookmarkSquare as Save
} from 'react-icons/hi2';
import { useToastContext } from '../../contexts/ToastContext';
import { shuffleArray } from '../../utils/helpers';
import { playSuccessSound, playErrorSound, playFlipSound, playCompleteSound } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface MatchItem {
  id: string; // unique id for the grid item
  cardId: string; // id of the original flashcard logic
  content: string;
  type: 'term' | 'definition';
}

const Study: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToastContext();
  
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Study State
  const [activeCards, setActiveCards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studiedCards, setStudiedCards] = useState<Set<number>>(new Set());
  const [knownCards, setKnownCards] = useState<Set<number>>(new Set());
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Quiz State
  const [studyMode, setStudyMode] = useState<'flashcard' | 'quiz' | 'match'>('flashcard');
  const [quizOptions, setQuizOptions] = useState<any[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerStatus, setAnswerStatus] = useState<'correct' | 'wrong' | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');



  // Match Mode State
  const [matchItems, setMatchItems] = useState<MatchItem[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchItem | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [wrongPair, setWrongPair] = useState<string[]>([]);
  const [correctPair, setCorrectPair] = useState<string[]>([]);
  const [matchTime, setMatchTime] = useState(0);
  const [isMatchPlaying, setIsMatchPlaying] = useState(false);
  const [isMatchStarted, setIsMatchStarted] = useState(false);
  const [matchBestTime, setMatchBestTime] = useState<number | null>(null);

  // Edit Card Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTerm, setEditTerm] = useState('');
  const [editDefinition, setEditDefinition] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  useEffect(() => {
    if (activeCards.length > 0) {
      if (studyMode === 'quiz') {
         // quiz existing logic
      } else if (studyMode === 'match') {
         // Reset state when entering match mode, but wait for user to start
         setIsMatchStarted(false);
         setIsMatchPlaying(false);
      }
    }
  }, [studyMode, activeCards]);

  // Timer for Match Mode
  useEffect(() => {
    let interval: any;
    if (isMatchPlaying && isMatchStarted && studyMode === 'match') {
      interval = setInterval(() => {
        setMatchTime(prev => prev + 0.1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isMatchPlaying, isMatchStarted, studyMode]);

  const startMatchGame = () => {
    // Take up to 6 cards
    const gameCards = shuffleArray([...activeCards]).slice(0, 6);
    const items: MatchItem[] = [];
    
    gameCards.forEach(card => {
       items.push({ id: `term-${card._id}`, cardId: card._id, content: card.term, type: 'term' });
       items.push({ id: `def-${card._id}`, cardId: card._id, content: card.definition, type: 'definition' });
    });

    setMatchItems(shuffleArray(items));
    setMatchedPairs(new Set());
    setSelectedMatch(null);
    setWrongPair([]);
    setCorrectPair([]);
    setMatchTime(0);
    setIsMatchPlaying(true);
    setIsMatchStarted(true);
  };

  const handleMatchClick = (item: MatchItem) => {
    if (matchedPairs.has(item.id) || selectedMatch?.id === item.id || wrongPair.length > 0 || correctPair.length > 0) return;

    playFlipSound();

    if (!selectedMatch) {
      setSelectedMatch(item);
    } else {
      // Check match
      if (selectedMatch.cardId === item.cardId) {
        // Correct
        playSuccessSound();
        const currentSelected = selectedMatch;
        setCorrectPair([currentSelected.id, item.id]);
        setSelectedMatch(null);

        // Delay to show green effect
        setTimeout(() => {
            const newMatched = new Set(matchedPairs);
            newMatched.add(currentSelected.id);
            newMatched.add(item.id);
            setMatchedPairs(newMatched);
            setCorrectPair([]);

            // Check Win
            if (newMatched.size === matchItems.length) {
                setIsMatchPlaying(false);
                setIsMatchStarted(false);
                playCompleteSound();
                
                // Fire confetti
                confetti({
                  particleCount: 100,
                  spread: 70,
                  origin: { y: 0.6 }
                });

                if (matchBestTime === null || matchTime < matchBestTime) {
                    setMatchBestTime(matchTime);
                    toast.success(`Kỷ lục mới! ${matchTime.toFixed(1)}s`);
                } else {
                    toast.success(`Hoàn thành trong ${matchTime.toFixed(1)}s`);
                }
            }
        }, 500);
      } else {
        // Wrong
        playErrorSound();
        setWrongPair([selectedMatch.id, item.id]);
        setTimeout(() => {
          setWrongPair([]);
          setSelectedMatch(null);
        }, 600);
      }
    }
  };

  useEffect(() => {
    if (activeCards.length > 0) {
      const correct = activeCards[currentIndex]; 
      // ... existing quiz generation logic ...
      const others = activeCards.filter((_, i) => i !== currentIndex);
      const wrong = shuffleArray(others).slice(0, 3);
      const options = shuffleArray([correct, ...wrong]);
      setQuizOptions(options);
      setSelectedAnswer(null);
      setAnswerStatus(null);
    }
  }, [currentIndex, activeCards, studyMode]);

  const handleQuizAnswer = (option: any) => {
    if (selectedAnswer !== null) return; // Prevent multiple clicks

    const isCorrect = option === activeCards[currentIndex];
    setSelectedAnswer(option._id || option); // Use ID or object ref
    setAnswerStatus(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
      playSuccessSound();
      if (!isFlipped) setIsFlipped(true); // Reveal card conceptually if needed, or just sound
      // Auto advance
      setTimeout(() => {
        handleKnow();
      }, 1000);
    } else {
       playErrorSound();
       setIsShaking(true);
       setTimeout(() => setIsShaking(false), 400);
       
       // Show wrong
       setTimeout(() => {
         handleDontKnow();
       }, 1500);
    }
  };

  useEffect(() => {
    loadFlashcardSet();
  }, [id]);

  const loadFlashcardSet = async () => {
    try {
      setIsLoading(true);
      const response = await flashcardService.getById(id!);
      setFlashcardSet(response.data.flashcardSet);
      setActiveCards(response.data.flashcardSet.cards);
    } catch (err) {
      setError('Không thể tải bộ thẻ');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const currentCard = activeCards[currentIndex];
  const progress = activeCards.length > 0 ? (studiedCards.size / activeCards.length) * 100 : 0;

  const handleFlip = () => {
    playFlipSound();
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < activeCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      setIsCompleted(true);
      playCompleteSound();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleKnow = () => {
    const card = activeCards[currentIndex];
    if (flashcardSet && card) {
      // Call API to update progress (Backend)
      flashcardService.updateStudyProgress(flashcardSet._id, card._id, (card.box || 1) + 1);
      // Dispatch event for Sidebar Goal (Frontend)
      window.dispatchEvent(new Event('cardStudied'));
    }

    setKnownCards(new Set(knownCards).add(currentIndex));
    setStudiedCards(new Set(studiedCards).add(currentIndex));
    handleNext();
  };

  const handleDontKnow = () => {
    const card = activeCards[currentIndex];
    if (flashcardSet && card) {
      // Call API (reset box to 1)
      flashcardService.updateStudyProgress(flashcardSet._id, card._id, 1);
      // Dispatch event
      window.dispatchEvent(new Event('cardStudied'));
    }

    setStudiedCards(new Set(studiedCards).add(currentIndex));
    handleNext();
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setStudiedCards(new Set());
    setKnownCards(new Set());
    setIsCompleted(false);
  };

  const handleShuffle = () => {
    const shuffled = [...activeCards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setActiveCards(shuffled);
    handleRestart();
    toast.success('Đã trộn lại bộ thẻ!');
  };

  // Open edit modal for current card
  const openEditModal = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card flip
    if (currentCard) {
      setEditTerm(currentCard.term);
      setEditDefinition(currentCard.definition);
      setIsEditModalOpen(true);
    }
  };

  // Save edited card
  const handleSaveEdit = async () => {
    if (!flashcardSet || !currentCard) return;
    
    setIsSavingEdit(true);
    try {
      // Update local state first
      const updatedCards = activeCards.map(card => 
        card._id === currentCard._id 
          ? { ...card, term: editTerm, definition: editDefinition }
          : card
      );
      setActiveCards(updatedCards);
      
      // Update in flashcardSet
      const updatedFlashcardSet = {
        ...flashcardSet,
        cards: flashcardSet.cards.map(card =>
          card._id === currentCard._id
            ? { ...card, term: editTerm, definition: editDefinition }
            : card
        )
      };
      setFlashcardSet(updatedFlashcardSet);
      
      // Save to backend
      await flashcardService.update(flashcardSet._id, {
        name: flashcardSet.name,
        description: flashcardSet.description,
        cards: updatedFlashcardSet.cards.map(c => ({
          term: c.term,
          definition: c.definition,
          image: c.image,
          starred: c.starred,
          box: c.box
        })),
        tags: flashcardSet.tags,
        color: flashcardSet.color
      });
      
      setIsEditModalOpen(false);
      toast.success('Đã lưu thay đổi!');
    } catch (err) {
      toast.error('Không thể lưu thay đổi');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (isLoading || error || !flashcardSet || isCompleted) return;

    switch (e.key) {
      case ' ':
      case 'Enter':
        e.preventDefault();
        handleFlip();
        break;
      case 'ArrowLeft':
        handlePrev();
        break;
      case 'ArrowRight':
        handleNext();
        break;
      case '1':
        handleDontKnow();
        break;
      case '2':
        handleKnow();
        break;
    }
  }, [currentIndex, isFlipped, isLoading, error, flashcardSet, isCompleted]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-blue-500" size={40} />
        </div>
      </MainLayout>
    );
  }

  if (error || !flashcardSet) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <div className="flex justify-center mb-4">
            <AlertCircle className="text-red-500" size={60} />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">{error || 'Bộ thẻ không tồn tại'}</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={20} />
            Quay về trang chủ
          </button>
        </div>
      </MainLayout>
    );
  }

  if (isCompleted) {
    const accuracy = activeCards.length > 0 ? Math.round((knownCards.size / activeCards.length) * 100) : 0;
    
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-xl p-12 shadow-sm">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Trophy className="text-white" size={48} />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Hoàn thành!</h1>
            <p className="text-slate-600 dark:text-slate-300 mb-8">
              Bạn đã học xong bộ thẻ "{flashcardSet.name}"
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-100 dark:bg-white/10 rounded-lg p-4">
                <div className="flex justify-center mb-2 text-slate-600 dark:text-slate-300">
                  <Layers size={24} />
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{activeCards.length}</div>
                <div className="text-slate-600 dark:text-slate-400 text-sm font-medium">Tổng thẻ</div>
              </div>
              <div className="bg-green-100 dark:bg-green-500/20 rounded-lg p-4">
                <div className="flex justify-center mb-2 text-green-600 dark:text-green-400">
                  <Check size={24} />
                </div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">{knownCards.size}</div>
                <div className="text-slate-600 dark:text-slate-400 text-sm font-medium">Đã biết</div>
              </div>
              <div className="bg-blue-100 dark:bg-blue-500/20 rounded-lg p-4">
                <div className="flex justify-center mb-2 text-blue-600 dark:text-blue-400">
                  <Trophy size={24} />
                </div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{accuracy}%</div>
                <div className="text-slate-600 dark:text-slate-400 text-sm font-medium">Độ chính xác</div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={handleRestart}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-500 hover:to-indigo-500 transition-all flex items-center gap-2"
              >
                <RotateCcw size={20} />
                Học lại
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-200 dark:hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <Home size={20} />
                Trang chủ
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{flashcardSet.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/create/${id}`)}
              className="px-4 py-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-500/30 transition-all flex items-center gap-2 font-medium cursor-pointer"
            >
              <Edit2 size={18} />
              Chỉnh sửa bộ thẻ
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-white/20 transition-all flex items-center gap-2 font-medium cursor-pointer hover:shadow-sm active:scale-95"
            >
              <X size={20} />
              Thoát
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-slate-200 dark:bg-white/10 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>



        {/* Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-slate-100 dark:bg-white/10 p-1 rounded-lg inline-flex">
            <button
              onClick={() => {
                setSlideDirection('left');
                setStudyMode('flashcard');
              }}
              className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all cursor-pointer ${
                studyMode === 'flashcard'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
              }`}
            >
              <CreditCard size={18} />
              Lật thẻ
            </button>
            <button
              onClick={() => {
                if (studyMode === 'flashcard') setSlideDirection('right');
                else if (studyMode === 'match') setSlideDirection('left');
                setStudyMode('quiz');
              }}
              className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all cursor-pointer ${
                studyMode === 'quiz'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
              }`}
            >
              <LayoutGrid size={18} />
              Trắc nghiệm
            </button>
            <button
              onClick={() => {
                setSlideDirection('right');
                setStudyMode('match');
              }}
              className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all cursor-pointer ${
                studyMode === 'match'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
              }`}
            >
              <Puzzle size={18} />
              Ghép thẻ
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="relative w-full max-w-2xl mx-auto mode-content-container">
          {studyMode === 'flashcard' ? (
            <div
              key={`flashcard-${studyMode}-${currentIndex}`}
              onClick={handleFlip}
              className={`relative w-full h-96 cursor-pointer perspective-1000 group ${slideDirection === 'right' ? 'slide-in-from-right-mode' : 'slide-in-from-left-mode'}`}
            >
              <div
                className={`absolute inset-0 w-full h-full card-flip-transition transform-style-3d ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front */}
                <div
                  className="absolute inset-0 w-full h-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center p-8 backface-hidden group-hover:border-blue-400 dark:group-hover:border-blue-500/50 transition-colors shadow-sm"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  {/* Edit Button - Top Right */}
                  <button
                    onClick={openEditModal}
                    className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all opacity-0 group-hover:opacity-100 z-10 cursor-pointer"
                  >
                    <Edit2 size={16} />
                  </button>

                  <div className="text-center w-full max-w-lg mx-auto">
                    <span className="block text-blue-600 dark:text-blue-400 text-sm font-semibold mb-4 uppercase tracking-wide">Thuật ngữ</span>
                    
                    {currentCard?.image && (
                      <div className="mb-4 h-40 flex items-center justify-center">
                        <img 
                          src={currentCard.image} 
                          alt="Card visual" 
                          className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
                        />
                      </div>
                    )}

                    <span className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white block break-words leading-tight">
                      {currentCard?.term}
                    </span>
                    
                    <div className="absolute bottom-8 left-0 right-0 flex justify-center text-slate-400 dark:text-slate-500 text-sm items-center gap-2">
                      <RotateCw size={16} />
                      Nhấn để lật thẻ
                    </div>
                  </div>
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 w-full h-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center p-8 shadow-sm"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  {/* Edit Button - Top Right (Back) */}
                  <button
                    onClick={openEditModal}
                    className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all z-10 cursor-pointer"
                  >
                    <Edit2 size={16} />
                  </button>

                  <div className="text-center">
                    <span className="block text-green-600 dark:text-green-400 text-sm font-semibold mb-4 uppercase tracking-wide">Định nghĩa</span>
                    <span className="text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white leading-relaxed">
                      {currentCard?.definition}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : studyMode === 'match' ? (
            <div key={`match-${studyMode}`} className={`min-h-[400px] ${slideDirection === 'right' ? 'slide-in-from-right-mode' : 'slide-in-from-left-mode'}`}>
               {/* Match Header */}
               <div className="flex justify-center mb-6">
                 <div className="bg-slate-800 text-white px-6 py-2 rounded-full font-mono text-xl font-bold shadow-lg shadow-blue-500/20 tabular-nums">
                    {matchTime.toFixed(1)}s
                 </div>
               </div>

               {!isMatchStarted && !isMatchPlaying ? (
                 <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-xl">
                    <div className="text-center">
                        <Puzzle size={60} className="mx-auto text-blue-600 mb-4 animate-bounce" />
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Sẵn sàng chưa?</h3>
                        <p className="text-slate-600 dark:text-slate-300 mb-6">Ghép các thẻ tương ứng với nhau trong thời gian ngắn nhất!</p>
                        <button 
                          onClick={startMatchGame}
                          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-bold rounded-xl shadow-xl hover:scale-105 transition-transform cursor-pointer active:scale-95 active:shadow-md"
                        >
                          Bắt đầu ngay
                        </button>
                    </div>
                 </div>
               ) : null}

               {/* Grid */}
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 select-none">
                 {matchItems.map((item) => {
                    const isSelected = selectedMatch?.id === item.id;
                    const isMatched = matchedPairs.has(item.id);
                    const isWrong = wrongPair.includes(item.id);
                    const isCorrect = correctPair.includes(item.id);

                    if (isMatched) return (
                        <div key={item.id} className="h-32 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 opacity-0 transition-opacity duration-500"></div>
                    );

                    let itemClass = "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-blue-400 dark:hover:border-blue-500 hover:scale-[1.05] cursor-pointer shadow-sm hover:shadow-md active:scale-95";
                    
                    if (isSelected) {
                        itemClass = "bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500 shadow-md scale-[1.05] z-10";
                    }
                    if (isWrong) {
                        itemClass = "bg-red-500 border-red-500 text-white shake-animation ring-2 ring-red-500 z-20";
                    }
                    if (isCorrect) {
                        itemClass = "bg-green-500 border-green-500 text-white scale-[1.05] ring-2 ring-green-500 z-20 shadow-lg shadow-green-500/40";
                    }

                    return (
                        <div
                            key={item.id}
                            onClick={() => handleMatchClick(item)}
                            className={`h-32 p-4 rounded-lg border-2 flex items-center justify-center text-center transition-all duration-200 overflow-hidden font-medium ${itemClass}`}
                        >
                            <span className="line-clamp-4 text-base md:text-lg font-medium">{item.content}</span>
                        </div>
                    );
                 })}
               </div>
               
               {!isMatchPlaying && isMatchStarted === false && matchedPairs.size > 0 && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-xl animate-in fade-in">
                      <h3 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-4 animate-bounce">Xuất sắc!</h3>
                      <p className="text-xl text-slate-600 dark:text-slate-300 font-medium mb-8">Thời gian: <span className="text-blue-600 dark:text-blue-400 font-bold text-2xl">{matchTime.toFixed(1)}s</span></p>
                      <button onClick={startMatchGame} className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-500 transition-colors inline-flex items-center gap-2 shadow-lg hover:shadow-blue-500/30 hover:-translate-y-1 transform cursor-pointer active:translate-y-0">
                        <RotateCcw size={20} /> Chơi lại
                      </button>
                      <button onClick={() => setStudyMode('flashcard')} className="mt-6 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 font-medium transition-colors cursor-pointer">
                        Quay lại học thẻ
                      </button>
                  </div>
               )}
            </div>
          ) : (
            <div key={`quiz-${studyMode}-${currentIndex}`} className={`flex flex-col gap-6 ${slideDirection === 'right' ? 'slide-in-from-right-mode' : 'slide-in-from-left-mode'} ${isShaking ? 'shake-animation' : ''}`}>
               {/* Question */}
               <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center shadow-sm min-h-[200px] flex flex-col items-center justify-center">
                  <span className="block text-blue-600 dark:text-blue-400 text-sm font-semibold mb-4 uppercase tracking-wide">Chọn định nghĩa đúng cho:</span>
                  
                  {currentCard?.image && (
                      <div className="mb-4 h-32 flex items-center justify-center">
                        <img 
                          src={currentCard.image} 
                          alt="Q" 
                          className="max-h-full max-w-full object-contain rounded-lg"
                        />
                      </div>
                  )}
                  
                  <h3 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                    {currentCard?.term}
                  </h3>
               </div>

               {/* Options */}
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {quizOptions.map((option, idx) => {
                    const isSelected = selectedAnswer === (option._id || option);
                    const isCorrectOption = option === currentCard;
                    const showCorrect = answerStatus !== null && isCorrectOption;
                    const showWrong = isSelected && answerStatus === 'wrong';

                    let btnClass = "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 text-slate-800 dark:text-slate-100 border-2 text-base";
                    
                    if (showCorrect) {
                      btnClass = "bg-green-500 border-green-500 text-white scale-[1.02] font-semibold border-2";
                    } else if (showWrong) {
                      btnClass = "bg-red-500 border-red-500 text-white font-semibold border-2";
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleQuizAnswer(option)}
                        disabled={selectedAnswer !== null}
                        className={`p-4 rounded-lg border-2 text-left transition-all font-medium ${btnClass} ${selectedAnswer === null ? 'hover:-translate-y-0.5 hover:shadow-md cursor-pointer active:scale-[0.99]' : 'cursor-default opacity-90'}`}
                      >
                         {option.definition}
                      </button>
                    );
                  })}
               </div>
            </div>
          )}
        </div>

        {/* Controls - Only show in Flashcard mode */}
        {studyMode === 'flashcard' && (
          <>
            <div className="mt-2 space-y-3">
              {/* Navigation Row */}
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="p-4 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                >
                  <ArrowLeft size={24} />
                </button>
                
                <span className="text-xl font-bold text-slate-700 dark:text-slate-300 min-w-[3rem] text-center">
                  {currentIndex + 1} / {activeCards.length}
                </span>

                <button
                  onClick={handleNext}
                  disabled={currentIndex === activeCards.length - 1}
                  className="p-4 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                >
                  <ArrowRight size={24} />
                </button>
              </div>

              {/* Action Row */}
              <div className="flex items-center justify-center gap-4">
                 <button
                  onClick={handleShuffle}
                  title="Trộn thẻ"
                  className="p-4 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-500/30 transition-all cursor-pointer shadow-sm hover:shadow-md hover:scale-110 active:scale-95"
                >
                  <Shuffle size={24} />
                </button>

                <button
                  onClick={handleDontKnow}
                  className="flex-1 max-w-[200px] py-4 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg font-semibold hover:bg-red-200 dark:hover:bg-red-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
                >
                  <X size={24} />
                  <span>Chưa biết</span>
                </button>

                <button
                  onClick={handleKnow}
                  className="flex-1 max-w-[200px] py-4 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-lg font-semibold hover:bg-green-200 dark:hover:bg-green-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
                >
                  <Check size={24} />
                  <span>Đã biết</span>
                </button>
              </div>
            </div>

            {/* Keyboard Hints */}
            <div className="mt-3 text-center text-slate-700 dark:text-slate-200 text-base flex items-center justify-center gap-2">
              <span className="hidden md:inline font-medium">
                Phím tắt: <kbd className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white rounded-lg mx-1 font-semibold text-sm shadow-sm">Space</kbd> lật,{' '}
                <kbd className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white rounded-lg mx-1 font-semibold text-sm shadow-sm">← →</kbd> chuyển,{' '}
                <kbd className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white rounded-lg mx-1 font-semibold text-sm shadow-sm">1</kbd> chưa biết,{' '}
                <kbd className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white rounded-lg mx-1 font-semibold text-sm shadow-sm">2</kbd> đã biết
              </span>
            </div>
          </>
        )}
      </div>

      {/* Edit Card Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 size={18} className="text-blue-500" />
                Chỉnh sửa thẻ
              </h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={18} className="text-slate-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Thuật ngữ
                </label>
                <input 
                  type="text"
                  value={editTerm}
                  onChange={(e) => setEditTerm(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
                  placeholder="Nhập thuật ngữ"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Định nghĩa
                </label>
                <textarea 
                  value={editDefinition}
                  onChange={(e) => setEditDefinition(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white resize-none"
                  placeholder="Nhập định nghĩa"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-5 border-t border-slate-100 dark:border-slate-700">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleSaveEdit}
                disabled={isSavingEdit || !editTerm.trim() || !editDefinition.trim()}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingEdit ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Study;
