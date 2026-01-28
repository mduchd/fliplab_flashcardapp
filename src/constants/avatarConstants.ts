// Preset Animal Avatars - Emoji list for avatar selection
export const ANIMAL_AVATARS = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮',
  '🐷', '🐸', '🐵', '🦄', '🐝', '🦋', '🐞', '🐌', '🐙', '🐬', '🐳', '🦖',
  '👾', '👽', '🤖', '👻', '💀', '💩', '🤡', '👹', '👺', '🎃', '🦦', '🦥',
  '🦔', '🐿️', '🐇', '🦝', '🦨', '🦡', '🦜', '🦩', '🦢', '🦉', '🐣', '🐔',
  '🐧', '🐦', '🦅', '🦆', '🦇', '🐺', '🐗', '🐴', '🦓', '🦒', '🐘', '🦏',
  '🦛', '🐪', '🐫', '🦙', '🦘', '🐊', '🐢', '🦎', '🐍', '🐲', '🦈',
  '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '🙈', '🙉', '🙊',
  '😎', '🥳', '🤩', '🥰', '🤪', '😇', '🤠', '🤓', '🥶', '🥵', '🤯', '😱'
];

// Avatar Frame configurations
export const AVATAR_FRAMES = [
  { id: 'none', name: 'Mặc định', class: 'ring-2 ring-white dark:ring-slate-800 shadow-sm' },
  { id: 'gold', name: 'Vàng kim', class: 'ring-4 ring-yellow-400 shadow-lg shadow-yellow-400/40' },
  { id: 'silver', name: 'Bạc', class: 'ring-4 ring-slate-300 shadow-lg shadow-slate-300/40' },
  { id: 'bronze', name: 'Đồng', class: 'ring-4 ring-orange-600 shadow-lg shadow-orange-600/40' },
  { id: 'diamond', name: 'Kim cương', class: 'ring-4 ring-cyan-400 shadow-lg shadow-cyan-400/50' },
  { id: 'rainbow', name: 'Cầu vồng', class: 'bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500', isComplex: true },
  { id: 'cosmic', name: 'Vũ trụ', class: 'bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700', isComplex: true },
  { id: 'fire', name: 'Lửa', class: 'ring-orange-600 shadow-lg shadow-orange-500/50' },
  { id: 'ice', name: 'Băng', class: 'ring-cyan-400 shadow-lg shadow-cyan-400/50' },
  // New Frames - Premium Styles
  { id: 'neon', name: 'Neon', class: 'ring-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.8)]', isComplex: false },
  { id: 'ocean', name: 'Đại dương', class: 'bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-900', isComplex: true },
  { id: 'nature', name: 'Thiên nhiên', class: 'bg-gradient-to-br from-emerald-400 via-green-600 to-teal-800', isComplex: true },
  { id: 'sunset', name: 'Hoàng hôn', class: 'bg-gradient-to-r from-amber-500 via-orange-600 to-rose-700', isComplex: true },
  { id: 'aurora', name: 'Cực quang', class: 'bg-gradient-to-bl from-teal-300 via-blue-500 to-purple-600', isComplex: true },
  { id: 'cyber', name: 'Cyberpunk', class: 'bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-500', isComplex: true },
  // Spinning & Special Frames (Smoother Gradients)
  { id: 'party', name: 'Tiệc tùng', class: 'bg-[conic-gradient(from_0deg,#ef4444,#f97316,#eab308,#22c55e,#06b6d4,#3b82f6,#a855f7,#ef4444)]', isSpinning: true },
  { id: 'portal', name: 'Cổng không gian', class: 'bg-[conic-gradient(from_0deg,#6366f1,#a855f7,#ec4899,#a855f7,#6366f1)]', isSpinning: true },
  { id: 'golden_spin', name: 'Vòng xoay vàng', class: 'bg-[conic-gradient(from_0deg,#d4af37,#fcf6ba,#d4af37,#aa6c39,#d4af37)]', isSpinning: true },
  { id: 'plasma', name: 'Plasma', class: 'bg-[conic-gradient(from_180deg,#3b82f6,#8b5cf6,#d946ef,#3b82f6)]', isSpinning: true },
  { id: 'thunder', name: 'Sấm sét', class: 'bg-[conic-gradient(from_45deg,#0ea5e9,#facc15,#0ea5e9)]', isSpinning: true },
  { id: 'dragon', name: 'Rồng thiêng', class: 'bg-[conic-gradient(from_0deg,#b91c1c,#fbbf24,#000000,#b91c1c)]', isSpinning: true },
  
  { id: 'ruby', name: 'Hồng ngọc', class: 'ring-rose-600 shadow-[0_0_20px_rgba(225,29,72,0.9)]' },
  { id: 'emerald', name: 'Lục bảo', class: 'ring-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)]' },
  { id: 'ghost', name: 'Bóng ma', class: 'ring-slate-400/60 shadow-[0_0_25px_rgba(255,255,255,0.5)] animate-pulse' }
];
