import { 
  PiFireFill, PiFireSimpleFill, PiTrendUpFill, PiCrownFill, PiInfinityFill, // Streak
  PiBrainFill, PiLightningFill, PiStrategyFill, PiShootingStarFill, PiEyeFill, PiGraduationCapFill, // Mastery
  PiCardsFill, PiFolderStarFill, PiStackFill, PiDownloadSimpleFill, PiHammerFill, PiSealFill, // Creation
  PiBookOpenTextFill, PiClockAfternoonFill, PiSunDimFill, PiNotebookFill, PiFeatherFill, PiMountainsFill, // Study
  PiUsersThreeFill, PiMegaphoneFill, PiHeartFill, PiCrownSimpleFill, PiHandshakeFill, PiMicrophoneStageFill, // Social
  PiMagicWandFill, PiRobotFill, PiSparkleFill, PiCircuitryFill, // AI
  PiTargetFill, PiTrophyFill, PiGameControllerFill, PiMedalFill, PiMedalMilitaryFill, // Quiz
  PiTranslateFill, PiUserCircleFill, PiMagnifyingGlassFill, PiFloppyDiskFill, PiPaintBucketFill, PiToolboxFill, PiStarFill // Utility
} from 'react-icons/pi';

export type BadgeCategory = 'STREAK' | 'MASTERY' | 'STUDY' | 'CREATION' | 'SOCIAL' | 'QUIZ' | 'AI' | 'UTILITY';
export type BadgeTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND';

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  tier: BadgeTier; // New Tier System
  icon: any; 
  threshold: number;
}

export const BADGES: Badge[] = [
  // --- STREAK (Ngọn Lửa) ---
  {
    id: 'STREAK_3',
    name: 'Tàn Lửa',
    description: 'Chuỗi 3 ngày',
    category: 'STREAK',
    tier: 'BRONZE',
    icon: PiFireSimpleFill,
    threshold: 3
  },
  {
    id: 'STREAK_7',
    name: 'Ngọn Đuốc',
    description: 'Chuỗi 7 ngày',
    category: 'STREAK',
    tier: 'SILVER',
    icon: PiFireFill,
    threshold: 7
  },
  {
    id: 'STREAK_14',
    name: 'Nhiệt Huyết', // Changed from "Hỏa Tiễn"
    description: 'Chuỗi 14 ngày',
    category: 'STREAK',
    tier: 'GOLD',
    icon: PiTrendUpFill, // Changed from Rocket
    threshold: 14
  },
  {
    id: 'STREAK_30',
    name: 'Phượng Hoàng',
    description: 'Chuỗi 30 ngày bất diệt',
    category: 'STREAK',
    tier: 'DIAMOND',
    icon: PiCrownFill,
    threshold: 30
  },
  {
    id: 'STREAK_100',
    name: 'Bất Tử',
    description: 'Chuỗi 100 ngày huyền thoại',
    category: 'STREAK',
    tier: 'DIAMOND',
    icon: PiInfinityFill,
    threshold: 100
  },

  // --- MASTERY (Trí Tuệ) ---
  {
    id: 'MASTER_10',
    name: 'Học Giả',
    description: 'Thuộc 10 thẻ',
    category: 'MASTERY',
    tier: 'BRONZE',
    icon: PiBrainFill,
    threshold: 10
  },
  {
    id: 'MASTER_50',
    name: 'Thông Thái',
    description: 'Thuộc 50 thẻ',
    category: 'MASTERY',
    tier: 'SILVER',
    icon: PiLightningFill,
    threshold: 50
  },
  {
    id: 'MASTER_100',
    name: 'Triết Gia',
    description: 'Thuộc 100 thẻ',
    category: 'MASTERY',
    tier: 'GOLD',
    icon: PiStrategyFill,
    threshold: 100
  },
  {
    id: 'MASTER_250',
    name: 'Đại Hiền',
    description: 'Thuộc 250 thẻ',
    category: 'MASTERY',
    tier: 'GOLD',
    icon: PiEyeFill,
    threshold: 250
  },
  {
    id: 'MASTER_500',
    name: 'Thần Đồng',
    description: 'Thuộc 500 thẻ',
    category: 'MASTERY',
    tier: 'DIAMOND',
    icon: PiShootingStarFill,
    threshold: 500
  },
  {
    id: 'MASTER_1000',
    name: 'Toàn Tri',
    description: 'Thuộc 1000 thẻ - Bậc thầy tối thượng',
    category: 'MASTERY',
    tier: 'DIAMOND',
    icon: PiGraduationCapFill,
    threshold: 1000
  },

  // --- CREATION (Kiến Tạo) ---
  {
    id: 'CREATOR_1',
    name: 'Khởi Bút',
    description: 'Tạo 1 bộ thẻ',
    category: 'CREATION',
    tier: 'BRONZE',
    icon: PiCardsFill,
    threshold: 1
  },
  {
    id: 'CREATOR_5',
    name: 'Kiến Trúc',
    description: 'Tạo 5 bộ thẻ',
    category: 'CREATION',
    tier: 'SILVER',
    icon: PiStackFill,
    threshold: 5
  },
  {
    id: 'CREATOR_15',
    name: 'Nghệ Nhân',
    description: 'Tạo 15 bộ thẻ',
    category: 'CREATION',
    tier: 'GOLD',
    icon: PiHammerFill,
    threshold: 15
  },
  {
    id: 'CREATOR_50',
    name: 'Tổng Sư',
    description: 'Tạo 50 bộ thẻ - Bậc thầy sáng tạo',
    category: 'CREATION',
    tier: 'DIAMOND',
    icon: PiSealFill,
    threshold: 50
  },
  {
    id: 'FOLDER_KEEPER',
    name: 'Thủ Thư',
    description: 'Tạo folder đầu tiên',
    category: 'CREATION',
    tier: 'BRONZE',
    icon: PiFolderStarFill,
    threshold: 1
  },
  {
    id: 'IMPORTER',
    name: 'Nhà Sưu Tầm',
    description: 'Import bộ thẻ',
    category: 'CREATION',
    tier: 'SILVER',
    icon: PiDownloadSimpleFill,
    threshold: 1
  },

  // --- STUDY (Rèn Luyện) ---
  {
    id: 'REVIEW_10',
    name: 'Tập Sự',
    description: '10 lượt ôn đầu tiên',
    category: 'STUDY',
    tier: 'BRONZE',
    icon: PiNotebookFill,
    threshold: 10
  },
  {
    id: 'REVIEW_50',
    name: 'Siêng Năng',
    description: '50 lượt ôn',
    category: 'STUDY',
    tier: 'BRONZE',
    icon: PiFeatherFill,
    threshold: 50
  },
  {
    id: 'REVIEW_100',
    name: 'Cần Cù',
    description: '100 lượt ôn',
    category: 'STUDY',
    tier: 'SILVER',
    icon: PiBookOpenTextFill,
    threshold: 100
  },
  {
    id: 'REVIEW_500',
    name: 'Bền Bỉ',
    description: '500 lượt ôn',
    category: 'STUDY',
    tier: 'GOLD',
    icon: PiBookOpenTextFill,
    threshold: 500
  },
  {
    id: 'REVIEW_2000',
    name: 'Bất Khuất',
    description: '2000 lượt ôn - Ý chí thép',
    category: 'STUDY',
    tier: 'DIAMOND',
    icon: PiMountainsFill,
    threshold: 2000
  },
  {
    id: 'NIGHT_OWL',
    name: 'Canh Thâu', // More poetic than "Cú Đêm"
    description: 'Học khuya (22h-2h)',
    category: 'STUDY',
    tier: 'SILVER',
    icon: PiClockAfternoonFill,
    threshold: 1
  },
  {
    id: 'EARLY_BIRD',
    name: 'Bình Minh', // More poetic than "Gà Trống"
    description: 'Học sớm (<6h)',
    category: 'STUDY',
    tier: 'SILVER',
    icon: PiSunDimFill,
    threshold: 1
  },

  // --- SOCIAL (Kết Nối) ---
  {
    id: 'NETWORKER',
    name: 'Kết Bạn',
    description: 'Theo dõi 1 người',
    category: 'SOCIAL',
    tier: 'BRONZE',
    icon: PiUsersThreeFill,
    threshold: 1
  },
  {
    id: 'FRIEND',
    name: 'Bạn Bè',
    description: 'Theo dõi 5 người',
    category: 'SOCIAL',
    tier: 'SILVER',
    icon: PiHandshakeFill,
    threshold: 5
  },
  {
    id: 'INFLUENCER',
    name: 'Ngôi Sao',
    description: 'Có 10 followers',
    category: 'SOCIAL',
    tier: 'GOLD',
    icon: PiHeartFill,
    threshold: 10
  },
  {
    id: 'SHARER',
    name: 'Hào Phóng',
    description: 'Chia sẻ bộ thẻ',
    category: 'SOCIAL',
    tier: 'SILVER',
    icon: PiMegaphoneFill, // Changed icon for more activity
    threshold: 1
  },
  {
    id: 'COMMUNITY_LEADER',
    name: 'Lãnh Đạo',
    description: 'Tạo nhóm học',
    category: 'SOCIAL',
    tier: 'GOLD',
    icon: PiCrownSimpleFill, // Changed icon to Crown
    threshold: 1
  },
  {
    id: 'INSPIRATION',
    name: 'Truyền Cảm Hứng',
    description: 'Có 50 followers - Người ảnh hưởng',
    category: 'SOCIAL',
    tier: 'DIAMOND',
    icon: PiMicrophoneStageFill,
    threshold: 50
  },

  // --- AI (Công Nghệ) ---
  {
    id: 'AI_EXPLORER',
    name: 'Khám Phá AI',
    description: 'Dùng AI lần đầu',
    category: 'AI',
    tier: 'BRONZE',
    icon: PiCircuitryFill,
    threshold: 1
  },
  {
    id: 'AI_SUMMONER',
    name: 'Phù Thủy',
    description: 'Dùng AI tạo thẻ',
    category: 'AI',
    tier: 'SILVER',
    icon: PiMagicWandFill,
    threshold: 1
  },
  {
    id: 'AI_SORCERER',
    name: 'Thuật Sư',
    description: 'Tạo 5 bộ thẻ bằng AI',
    category: 'AI',
    tier: 'GOLD',
    icon: PiSparkleFill,
    threshold: 5
  },
  {
    id: 'AI_MASTER',
    name: 'Đại Pháp Sư',
    description: 'Tạo 10 bộ AI',
    category: 'AI',
    tier: 'DIAMOND',
    icon: PiRobotFill,
    threshold: 10
  },
  {
    id: 'AI_FRIEND',
    name: 'Bạn Máy',
    description: 'Chat với AI 5 lần',
    category: 'AI',
    tier: 'SILVER',
    icon: PiSparkleFill,
    threshold: 5
  },

  // --- QUIZ (Thử Thách) ---
  {
    id: 'QUIZ_TAKER',
    name: 'Thí Sinh',
    description: 'Làm 1 bài Quiz',
    category: 'QUIZ',
    tier: 'BRONZE',
    icon: PiTargetFill,
    threshold: 1
  },
  {
    id: 'QUIZ_COMPETITOR',
    name: 'Thi Đấu',
    description: 'Làm 5 bài Quiz',
    category: 'QUIZ',
    tier: 'SILVER',
    icon: PiGameControllerFill,
    threshold: 5
  },
  {
    id: 'QUIZ_EXPERT',
    name: 'Cao Thủ',
    description: 'Làm 20 bài Quiz',
    category: 'QUIZ',
    tier: 'GOLD',
    icon: PiMedalFill,
    threshold: 20
  },
  {
    id: 'QUIZ_SNIPER',
    name: 'Xạ Thủ',
    description: 'Quiz đạt 100%',
    category: 'QUIZ',
    tier: 'GOLD',
    icon: PiTrophyFill,
    threshold: 1
  },
  {
    id: 'QUIZ_CHAMPION',
    name: 'Vô Địch',
    description: '10 Quiz hoàn hảo (100%)',
    category: 'QUIZ',
    tier: 'DIAMOND',
    icon: PiMedalMilitaryFill,
    threshold: 10
  },

  // --- UTILITY (Tiện Ích) ---
  {
    id: 'POLYGLOT',
    name: 'Đa Ngôn Ngữ', // Changed from "Thông Dịch"
    description: 'Dùng Google Dịch',
    category: 'UTILITY',
    tier: 'SILVER',
    icon: PiTranslateFill,
    threshold: 10
  },
  {
    id: 'AVATAR_UPDATER',
    name: 'Gương Mặt',
    description: 'Đổi Avatar',
    category: 'UTILITY',
    tier: 'BRONZE',
    icon: PiUserCircleFill,
    threshold: 1
  },
  {
    id: 'SEARCH_ENGINE',
    name: 'Thám Tử',
    description: 'Tìm kiếm 20 lần',
    category: 'UTILITY',
    tier: 'BRONZE',
    icon: PiMagnifyingGlassFill,
    threshold: 20
  },
  {
    id: 'DATA_HOARDER',
    name: 'Thủ Kho',
    description: 'Backup dữ liệu',
    category: 'UTILITY',
    tier: 'SILVER',
    icon: PiFloppyDiskFill,
    threshold: 1
  },
  {
    id: 'CUSTOMIZER',
    name: 'Nghệ Sĩ',
    description: 'Đổi Theme/App',
    category: 'UTILITY',
    tier: 'SILVER',
    icon: PiPaintBucketFill,
    threshold: 1
  },
  {
    id: 'POWER_USER',
    name: 'Chuyên Gia',
    description: 'Sử dụng 10+ tính năng',
    category: 'UTILITY',
    tier: 'GOLD',
    icon: PiToolboxFill,
    threshold: 10
  },
  {
    id: 'FEATURE_MASTER',
    name: 'Bậc Thầy',
    description: 'Khám phá mọi tính năng',
    category: 'UTILITY',
    tier: 'DIAMOND',
    icon: PiStarFill,
    threshold: 15
  }
];

// Helper to check if a user has unlocked a badge
export const checkBadgeUnlocked = (badge: Badge, userStats: any) => {
  switch (badge.category) {
    case 'STREAK':
      return (userStats.streak || 0) >= badge.threshold;
    case 'MASTERY':
      return (userStats.masteredCards || 0) >= badge.threshold;
    case 'CREATION':
      if (badge.id === 'FOLDER_KEEPER') return (userStats.totalFolders || 0) >= badge.threshold;
      if (badge.id === 'IMPORTER') return (userStats.hasImported || false);
      return (userStats.createdDecks || 0) >= badge.threshold;
    case 'STUDY':
      if (badge.id === 'NIGHT_OWL') return (userStats.hasStudiedLate || false);
      if (badge.id === 'EARLY_BIRD') return (userStats.hasStudiedEarly || false);
      return (userStats.totalReviews || 0) >= badge.threshold;
    case 'SOCIAL':
      if (badge.id === 'INFLUENCER' || badge.id === 'INSPIRATION') return (userStats.followersCount || 0) >= badge.threshold;
      if (badge.id === 'SHARER') return (userStats.hasShared || false);
      if (badge.id === 'COMMUNITY_LEADER') return (userStats.createdGroups || 0) >= badge.threshold;
      return (userStats.followingCount || 0) >= badge.threshold; // NETWORKER, FRIEND
    case 'AI':
      if (badge.id === 'AI_FRIEND') return (userStats.aiChatCount || 0) >= badge.threshold;
      return (userStats.aiGeneratedDecks || 0) >= badge.threshold; // AI_EXPLORER, AI_SUMMONER, AI_SORCERER, AI_MASTER
    case 'QUIZ':
      if (badge.id === 'QUIZ_SNIPER' || badge.id === 'QUIZ_CHAMPION') return (userStats.perfectQuizzes || 0) >= badge.threshold;
      return (userStats.quizzesTaken || 0) >= badge.threshold; // QUIZ_TAKER, QUIZ_COMPETITOR, QUIZ_EXPERT
    case 'UTILITY':
       if (badge.id === 'AVATAR_UPDATER') return !!userStats.hasAvatar;
       if (badge.id === 'POLYGLOT') return (userStats.translationCount || 0) >= badge.threshold;
       if (badge.id === 'SEARCH_ENGINE') return (userStats.searchCount || 0) >= badge.threshold;
       if (badge.id === 'DATA_HOARDER') return !!userStats.hasExportedData;
       if (badge.id === 'CUSTOMIZER') return !!userStats.hasCustomizedSettings;
       if (badge.id === 'POWER_USER' || badge.id === 'FEATURE_MASTER') return (userStats.featuresUsed || 0) >= badge.threshold;
       return false;
    default:
      return false;
  }
};
