import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HiBolt, 
  HiAcademicCap, 
  HiUserGroup, 
  HiSparkles,
  HiArrowRight,
  HiCheckCircle,
  HiDocumentText,
  HiTrophy,
  HiFire,
  HiRocketLaunch,
  HiExclamationTriangle,
  HiClock,
  HiPencilSquare,
  HiBriefcase,
  HiGlobeAlt,
  HiFolder,

  HiPuzzlePiece,
  HiSwatch,
  HiXCircle,
  HiXMark,
  HiEnvelope,
  HiShieldCheck
} from 'react-icons/hi2';
import { PiGameControllerFill } from 'react-icons/pi';
import { BADGES } from '../../constants/badgeConstants';

const LandingPage: React.FC = () => {
  const [activeModal, setActiveModal] = React.useState<'privacy' | 'contact' | null>(null);
  const [contactForm, setContactForm] = React.useState({ name: '', email: '', message: '' });

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể!');
    setActiveModal(null);
    setContactForm({ name: '', email: '', message: '' });
  };
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30 font-sans">
      {/* 
        ========================================
        NAVBAR
        ======================================== 
      */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-950/70 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <HiBolt className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              FlipLab
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Đăng nhập
            </Link>
            <Link 
              to="/register" 
              className="px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95"
            >
              Đăng ký miễn phí
            </Link>
          </div>
        </div>
      </nav>

      {/* 
        ========================================
        HERO SECTION
        ======================================== 
      */}
      <header className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
          <div className="absolute top-40 right-10 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] mix-blend-screen delay-1000 animate-pulse-slow"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-6 text-center z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <HiSparkles className="w-4 h-4" />
            Học tập thế hệ mới với AI
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Biến kiến thức <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400">
              thành phản xạ.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 font-medium">
            Hệ thống Flashcard AI lặp lại ngắt quãng giúp bạn ghi nhớ mọi kiến thức (Ngoại ngữ, Y khoa, Sử địa, Luật...) vĩnh viễn chỉ với 15 phút mỗi ngày.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Link 
              to="/register" 
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-slate-950 font-bold text-lg hover:bg-slate-200 transition-all flex items-center justify-center gap-2 group shadow-xl shadow-white/10"
            >
              <HiRocketLaunch className="w-5 h-5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
              Bắt đầu ngay
            </Link>
            <Link 
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-slate-800/50 hover:bg-slate-800 border border-white/10 text-white font-bold text-lg transition-all backdrop-blur-sm"
            >
              Xem Demo
            </Link>
          </div>

          {/* Mock Dashboard Screenshot - RECREATED BASED ON REAL UI */}
          {/* Mock Dashboard Screenshot - RECREATED BASED ON REAL UI */}
          <div className="mt-20 relative animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500 mb-32 md:mb-48 group">
            <div className="absolute -inset-4 bg-gradient-to-b from-indigo-500/30 via-purple-500/10 to-transparent rounded-[2rem] blur-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="relative rounded-2xl border border-white/10 bg-[#0B1120] shadow-2xl overflow-hidden aspect-[16/10] md:aspect-video group select-none text-left transform md:scale-110 md:group-hover:scale-[1.15] transition-transform duration-700">
              
              {/* Dashboard Content */}
              <div className="p-6 flex flex-col h-full gap-6">
                
                {/* 1. Top Bar: Level Progress */}
                <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                     <HiAcademicCap className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                     <div className="flex justify-between mb-2">
                        <span className="font-bold text-white">Học giả <span className="text-xs bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded text-[10px] ml-2">Lv.5</span></span>
                        <span className="text-xs text-slate-400">1,240 / 1,500 XP</span>
                     </div>
                     <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full w-[80%] bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                     </div>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-3 gap-6 min-h-0">
                   {/* Left Col: Main Stats */}
                   <div className="col-span-2 flex flex-col gap-6">
                      {/* Charts Area */}
                      <div className="grid grid-cols-2 gap-4 flex-1">
                         <div className="bg-slate-800/30 rounded-xl border border-white/5 p-4 flex flex-col relative overflow-hidden">
                            <h4 className="text-xs text-slate-400 font-bold uppercase mb-4">Hoạt động tuần qua</h4>
                            <div className="flex-1 flex items-end gap-2 px-2">
                               <div className="w-full bg-slate-700/50 rounded-t-sm h-[30%]"></div>
                               <div className="w-full bg-slate-700/50 rounded-t-sm h-[50%]"></div>
                               <div className="w-full bg-slate-700/50 rounded-t-sm h-[40%]"></div>
                               <div className="w-full bg-slate-700/50 rounded-t-sm h-[70%]"></div>
                               <div className="w-full bg-blue-500 rounded-t-sm h-[90%] shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                            </div>
                         </div>
                         <div className="bg-slate-800/30 rounded-xl border border-white/5 p-4 flex flex-col items-center justify-center relative">
                            <div className="w-24 h-24 rounded-full border-[6px] border-slate-700 border-t-yellow-400 border-r-yellow-400 rotate-45 flex items-center justify-center">
                               <div className="-rotate-45 text-center">
                                  <div className="text-2xl font-black text-white">61%</div>
                                  <div className="text-[10px] text-slate-400">ĐANG HỌC</div>
                               </div>
                            </div>
                         </div>
                      </div>

                      {/* Badges Row */}
                      <div className="bg-slate-800/30 rounded-xl border border-white/5 p-4 flex items-center justify-between gap-2 overflow-hidden">
                         {[1,2,3,4,5].map(i => (
                            <div key={i} className="w-10 h-10 rounded-full bg-slate-700/50 border border-white/5 flex items-center justify-center">
                               <HiTrophy className={`w-5 h-5 ${i < 4 ? 'text-yellow-500' : 'text-slate-600'}`} />
                            </div>
                         ))}
                      </div>
                   </div>

                   {/* Right Col: Highlights */}
                   <div className="col-span-1 flex flex-col gap-4">
                      {/* Daily Goal */}
                      <div className="bg-blue-600 rounded-xl p-4 shadow-lg shadow-blue-900/40 relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                         <div className="absolute top-0 right-0 p-3 opacity-20"><HiCheckCircle className="w-12 h-12" /></div>
                         <div className="text-3xl font-black text-white mb-1">20</div>
                         <div className="text-xs text-blue-100 font-medium">Thẻ cần ôn hôm nay</div>
                         <div className="mt-3 py-1.5 bg-white/20 rounded-lg text-center text-xs font-bold text-white">Bắt đầu ngay</div>
                      </div>

                      {/* Streak Card - ORANGE */}
                      <div className="bg-orange-500 rounded-xl p-4 shadow-lg shadow-orange-900/40 relative overflow-hidden flex-1 group-hover:scale-105 transition-transform duration-500 delay-100">
                          <div className="absolute -bottom-2 -right-2 opacity-20 text-black"><HiFire className="w-16 h-16" /></div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-orange-100 uppercase mb-2">
                             <HiFire /> Streak
                          </div>
                          <div className="text-4xl font-black text-white leading-none">3</div>
                          <div className="text-sm text-white font-medium">ngày liên tiếp</div>
                      </div>

                      {/* Master Card - PURPLE */}
                      <div className="bg-purple-600 rounded-xl p-4 shadow-lg shadow-purple-900/40 relative overflow-hidden flex-1 group-hover:scale-105 transition-transform duration-500 delay-200">
                          <div className="text-xs font-bold text-purple-200 uppercase mb-1">Đã thuộc</div>
                          <div className="text-2xl font-black text-white">434</div>
                          <div className="text-[10px] text-purple-200">Thẻ vựng (Master)</div>
                      </div>
                   </div>
                </div>

              </div>
              
              {/* Overlay Text */}
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                 <p className="text-white font-bold text-xl flex items-center gap-2">
                   <HiCheckCircle className="text-green-500" /> Trải nghiệm Dashboard A.I chuyên nghiệp
                 </p>
              </div>
            </div>
          </div>

            
          </div>
      </header>

      {/* 
        ========================================
        SOCIAL PROOF (Stats & Partners)
        ======================================== 
      */}
      <section className="py-12 border-y border-white/5 bg-slate-900/30">
          <div className="max-w-7xl mx-auto px-6">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/5">
                <div className="p-4">
                   <div className="text-3xl md:text-4xl font-black text-white mb-1">10,000+</div>
                   <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Người học</div>
                </div>
                <div className="p-4">
                   <div className="text-3xl md:text-4xl font-black text-white mb-1">500k+</div>
                   <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Thẻ đã tạo</div>
                </div>
                <div className="p-4">
                   <div className="text-3xl md:text-4xl font-black text-white mb-1">4.8/5</div>
                   <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Đánh giá</div>
                </div>
                <div className="p-4">
                   <div className="text-3xl md:text-4xl font-black text-white mb-1">Top 1</div>
                   <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Giáo dục</div>
                </div>
             </div>
          </div>
      </section>

      {/* 
        ========================================
        PAIN POINTS
        ======================================== 
      */}
      <section className="py-24 bg-slate-950 relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Bạn có đang gặp khó khăn?</h2>
            <p className="text-slate-400">Phương pháp học tập truyền thống khiến bạn mệt mỏi và kém hiệu quả.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 hover:bg-slate-900 transition-colors group hover:-translate-y-1 duration-300">
                <div className="w-16 h-16 rounded-2xl bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.3)] flex items-center justify-center mb-6 text-red-400 group-hover:scale-110 transition-transform">
                  <HiExclamationTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Quá tải kiến thức</h3>
                <p className="text-slate-300 leading-relaxed font-medium">Học nhiều nhưng không nhớ. Cảm giác bị "ngợp" vì lượng thông tin khổng lồ cần nạp mỗi ngày.</p>
            </div>

            <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 hover:bg-slate-900 transition-colors group hover:-translate-y-1 duration-300">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.3)] flex items-center justify-center mb-6 text-orange-400 group-hover:scale-110 transition-transform">
                  <HiClock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Ôn mãi vẫn quên</h3>
                <p className="text-slate-300 leading-relaxed font-medium">Kiến thức trôi tuột ngay sau khi học. Tốn công sức mà hiệu quả không thấy đâu.</p>
            </div>

            <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 hover:bg-slate-900 transition-colors group hover:-translate-y-1 duration-300">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform">
                  <HiPencilSquare className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Tốn công vô ích</h3>
                <p className="text-slate-300 leading-relaxed font-medium">Mất hàng giờ hì hục chép Flashcard thủ công thay vì tập trung vào việc ghi nhớ.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 
        ========================================
        FEATURES
        ======================================== 
      */}
      <section className="py-32 relative overflow-hidden" id="features">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Công cụ <span className="text-indigo-400">toàn năng</span> cho việc học
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl">
              Không chỉ là Flashcard. FlipLab tích hợp mọi thứ bạn cần để master kiến thức.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* ROW 1: Study Modes (2 cols) + AI Tutor (1 col) */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3 pb-4">
               <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="w-8 h-1 bg-indigo-500 rounded-full"></span>
                  Học tập hiệu quả
               </h3>
            </div>
            
            {/* Feature 1: Diverse Study Modes */}
            <div className="col-span-1 lg:col-span-2 bg-[#0B1120] border border-white/10 rounded-3xl p-8 relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
               <div className="flex flex-col h-full z-10 relative">
                  <div className="flex items-start justify-between mb-8">
                     <div>
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6 text-purple-400">
                           <PiGameControllerFill className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Đa dạng chế độ học</h3>
                        <p className="text-slate-400 text-sm max-w-sm">
                           Chuyển đổi linh hoạt giữa 3 chế độ: Lật thẻ (Flashcard), Trắc nghiệm (Quiz) và Ghép thẻ (Matching Match). Học từ vựng chưa bao giờ thú vị đến thế.
                        </p>
                     </div>
                     {/* Floating Visual Decoration */}
                     <div className="hidden md:block">
                        <div className="flex gap-2 mb-2">
                           <div className="px-3 py-1 rounded-lg bg-indigo-600 text-[10px] font-bold text-white border border-indigo-500 shadow-lg shadow-indigo-500/50">Lật thẻ</div>
                           <div className="px-3 py-1 rounded-lg bg-slate-800 text-[10px] font-bold text-slate-400 border border-white/5">Trắc nghiệm</div>
                           <div className="px-3 py-1 rounded-lg bg-slate-800 text-[10px] font-bold text-slate-400 border border-white/5">Ghép thẻ</div>
                        </div>
                     </div>
                  </div>

                  {/* Main Mockup: Study Interface */}
                  <div className="flex-1 bg-slate-950 rounded-xl border border-white/10 p-4 shadow-2xl relative">
                     {/* Header Bar */}
                     <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                        <h4 className="text-base font-bold text-white">Collocation</h4>
                        <div className="flex gap-2">
                           <div className="flex bg-slate-900 rounded-lg p-1 border border-white/5">
                              <button className="px-3 py-1 rounded bg-indigo-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm"><HiSwatch /> Lật thẻ</button>
                              <button className="px-3 py-1 rounded text-slate-400 hover:text-white text-[10px] font-bold flex items-center gap-1"><HiCheckCircle /> Trắc nghiệm</button>
                              <button className="px-3 py-1 rounded text-slate-400 hover:text-white text-[10px] font-bold flex items-center gap-1"><HiPuzzlePiece /> Ghép thẻ</button>
                           </div>
                        </div>
                     </div>

                     {/* Flashcard Content */}
                     <div className="bg-[#1e293b] rounded-2xl h-64 flex flex-col items-center justify-center relative border border-white/10 group-hover:border-indigo-500/30 transition-colors mb-6 cursor-pointer">
                        <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-white/5 hover:bg-slate-700 transition-colors">
                           <HiPencilSquare className="w-4 h-4" />
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Sự kiện lịch sử</div>
                        <div className="text-3xl md:text-4xl font-black text-center px-4 text-white mb-2">Chiến thắng<br/>Điện Biên Phủ</div>
                        <div className="text-xs text-slate-500 italic mt-2 animate-pulse">Nhấn để xem diễn biến</div>
                     </div>

                     {/* Controls */}
                     <div className="flex items-center justify-between gap-4">
                        <div className="text-[10px] text-slate-500 font-mono hidden md:block">Phím tắt: [Space], [1], [2]</div>
                        <div className="flex items-center gap-3 flex-1 justify-center md:justify-end">
                           <button className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/50 font-bold text-xs hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2">
                              <HiXCircle className="w-4 h-4" /> Chưa biết
                           </button>
                           <button className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-green-500/10 text-green-500 border border-green-500/50 font-bold text-xs hover:bg-green-500 hover:text-white transition-all flex items-center justify-center gap-2">
                              <HiCheckCircle className="w-4 h-4" /> Đã biết
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Feature 2: AI Tutor & Magic Import */}
            <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-8 group hover:border-indigo-500/50 transition-colors relative overflow-hidden">
               {/* Background AI Glow */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
               
               <div className="relative z-10 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 text-white shadow-lg shadow-indigo-500/30">
                    <HiSparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">AI Tutor & Magic Import</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    Trợ lý ảo thông minh 24/7. Giải thích khái niệm, tóm tắt bài học, và tự động tạo bộ thẻ từ văn bản chỉ trong 1 click.
                  </p>
               </div>

               {/* MOCKUP: AI Tutor Chat UI */}
               <div className="bg-[#1e293b] rounded-xl border border-white/5 overflow-hidden shadow-2xl relative">
                  {/* Header */}
                  <div className="bg-indigo-600 p-3 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                           <HiSparkles className="text-white w-5 h-5" />
                        </div>
                        <div>
                           <div className="text-white text-xs font-bold">AI Tutor (Beta)</div>
                           <div className="flex items-center gap-1">
                              <span className="text-[10px] bg-yellow-400 text-black px-1 rounded font-bold">⚡ 20/20</span>
                           </div>
                        </div>
                     </div>
                  </div>
                  
                  {/* Chat Content */}
                  <div className="p-4 space-y-3">
                     <div className="bg-slate-700/50 rounded-2xl rounded-tl-sm p-3 text-xs text-slate-200 leading-relaxed border border-white/5">
                        Xin chào! Mình là trợ lý AI của FlipLab. <span className="inline-flex gap-1 items-center align-bottom ml-1"><span className="w-1 h-1 bg-white rounded-full animate-bounce"></span><span className="w-1 h-1 bg-white rounded-full animate-bounce delay-100"></span><span className="w-1 h-1 bg-white rounded-full animate-bounce delay-200"></span></span>
                     </div>
                     {/* Suggestion Chips */}
                     <div className="grid grid-cols-2 gap-2">
                        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-2 flex items-center gap-2 cursor-pointer hover:bg-indigo-500/20 transition-colors">
                           <HiSparkles className="text-purple-400 w-3 h-3" />
                           <span className="text-[10px] text-purple-200 font-bold">Tạo thẻ Magic AI</span>
                        </div>
                        <div className="bg-slate-700/30 border border-white/5 rounded-lg p-2 text-[10px] text-slate-400 text-center hover:bg-slate-700/50 cursor-pointer">
                           Giải thích
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* ROW 2: Customization Group - Folder + Deck + Profile */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3 pb-4 pt-8">
               <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="w-8 h-1 bg-blue-500 rounded-full"></span>
                  Cá nhân hóa
               </h3>
            </div>

            {/* Feature 3: Folder Customization */}
            <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 group hover:border-blue-500/50 transition-colors relative overflow-hidden flex flex-col">
               <div className="mb-6">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                     <HiFolder className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Tùy biến Thư mục</h3>
                  <p className="text-slate-400 text-sm">
                     Sắp xếp tài liệu khoa học với hệ thống thư mục màu sắc đa dạng.
                  </p>
               </div>
               <div className="flex-1 flex flex-col items-center justify-end relative">
                  <div className="w-full bg-blue-600 rounded-xl p-4 aspect-[4/3] flex flex-col items-center justify-center shadow-lg shadow-blue-900/20 transform group-hover:scale-105 transition-transform duration-500 relative overflow-hidden">
                      <div className="absolute top-0 w-24 h-3 bg-white/20 rounded-b-xl backdrop-blur-sm"></div>
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-3">
                         <HiFolder className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-sm font-bold text-white">Tài liệu</div>
                      <div className="mt-2 text-[10px] bg-black/20 px-2 py-1 rounded-full text-white/80">0 bộ thẻ</div>
                  </div>
                  <div className="flex gap-2 mt-6">
                     {['bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'].map(c => (
                        <div key={c} className={`w-3 h-3 rounded-full ${c} ring-1 ring-white/10 cursor-pointer hover:scale-125 transition-transform`}></div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Feature 4: Deck Customization */}
            <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 group hover:border-purple-500/50 transition-colors relative overflow-hidden flex flex-col">
               <div className="mb-6">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
                     <HiSwatch className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Thiết kế Bộ thẻ</h3>
                  <p className="text-slate-400 text-sm">
                     Thêm icon, tags và ảnh bìa để bộ thẻ của bạn trở nên độc đáo và dễ nhớ.
                  </p>
               </div>
               <div className="flex-1 flex flex-col justify-end">
                  <div className="bg-[#1e293b] rounded-xl border border-white/10 p-4 shadow-2xl relative transform transition-transform group-hover:-translate-y-2 duration-500 w-full">
                     <div className="flex justify-between items-start mb-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                           <HiSparkles className="w-5 h-5" />
                        </div>
                        <div className="flex gap-1">
                           <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                           <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                        </div>
                     </div>
                     <h4 className="text-sm font-bold text-white mb-1">Từ vựng IELTS</h4>
                     <div className="flex gap-1 mb-3">
                        <span className="text-[8px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">english</span>
                        <span className="text-[8px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">vocab</span>
                     </div>
                     <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold py-2 rounded-lg flex items-center justify-center gap-1 transition-colors">
                        <HiBolt /> Học ngay
                     </button>
                  </div>
                  <div className="flex justify-center gap-3 mt-6 text-slate-500">
                     <HiAcademicCap className="hover:text-white transition-colors cursor-pointer" />
                     <HiGlobeAlt className="hover:text-white transition-colors cursor-pointer" />
                     <HiBriefcase className="hover:text-white transition-colors cursor-pointer" />
                     <HiSparkles className="hover:text-white transition-colors cursor-pointer" />
                  </div>
               </div>
            </div>

            {/* Feature 5: Profile Customization */}
            <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 group hover:border-yellow-500/50 transition-colors relative overflow-hidden flex flex-col">
               <div className="mb-6">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center text-yellow-400 mb-4">
                     <HiSparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Trang cá nhân độc đáo</h3>
                  <p className="text-slate-400 text-sm">
                     Tùy chỉnh avatar, emoji và khung hình. Thể hiện cá tính riêng của bạn.
                  </p>
               </div>
               <div className="flex-1 flex flex-col justify-end">
                  <div className="bg-[#1e293b] rounded-xl border border-white/10 p-4 shadow-2xl relative transform transition-transform group-hover:scale-105 duration-500">
                     <div className="flex flex-col items-center mb-4">
                        <div className="relative">
                           <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 blur-md opacity-75 animate-pulse"></div>
                           <div className="relative w-20 h-20 rounded-full bg-slate-700 border-4 border-yellow-400 flex items-center justify-center text-4xl shadow-lg">
                              🙈
                           </div>
                        </div>
                        <div className="text-sm font-bold text-white mt-3">Nguyễn Minh Đức</div>
                        <div className="text-[10px] text-slate-400">Học giả • Lv.5</div>
                     </div>
                     <div className="grid grid-cols-3 gap-2">
                        <div className="bg-slate-800/50 rounded-lg p-2 text-center hover:bg-slate-700 cursor-pointer transition-colors">
                           <div className="text-xs mb-1">😀</div>
                           <div className="text-[8px] text-slate-400">Emoji</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-2 text-center hover:bg-slate-700 cursor-pointer transition-colors">
                           <div className="w-4 h-4 mx-auto mb-1 rounded-full border-2 border-yellow-400"></div>
                           <div className="text-[8px] text-slate-400">Khung</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-2 text-center hover:bg-slate-700 cursor-pointer transition-colors">
                           <div className="text-xs mb-1">🎨</div>
                           <div className="text-[8px] text-slate-400">Màu</div>
                        </div>
                     </div>
                  </div>
                  <div className="flex justify-center gap-2 mt-4">
                     {['border-yellow-400', 'border-cyan-400', 'border-purple-500', 'border-pink-500'].map((color, i) => (
                        <div key={i} className={`w-6 h-6 rounded-full ${color} border-2 cursor-pointer hover:scale-125 transition-transform ${i === 0 ? 'ring-2 ring-white/30' : 'opacity-50'}`}></div>
                     ))}
                  </div>
               </div>
            </div>

            {/* ROW 3: Tools Group - Translation + Quiz */}

            {/* ROW 3: Tools Group - Translation + Quiz */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3 pb-4 pt-8">
               <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="w-8 h-1 bg-cyan-500 rounded-full"></span>
                  Công cụ thông minh
               </h3>
            </div>

            {/* Feature 6: Smart Translation */}
            <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 group hover:border-cyan-500/50 transition-colors relative overflow-hidden flex flex-col">
               <div className="mb-6">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
                     <HiGlobeAlt className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Dịch thuật thông minh</h3>
                  <p className="text-slate-400 text-sm">
                     Tự động phát hiện ngôn ngữ và dịch nhanh chóng. Hỗ trợ hơn 100+ ngôn ngữ.
                  </p>
               </div>
               <div className="flex-1 flex flex-col justify-end">
                  <div className="bg-[#0F172A] border border-white/10 rounded-xl p-4 shadow-2xl relative transform transition-transform group-hover:-translate-y-2 duration-500">
                     <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/5">
                        <div className="flex items-center gap-2">
                           <div className="text-[10px] text-slate-400">Phát hiện</div>
                           <div className="px-2 py-1 bg-slate-800 rounded text-[10px] font-bold text-white">EN</div>
                        </div>
                        <HiArrowRight className="w-4 h-4 text-cyan-400" />
                        <div className="flex items-center gap-2">
                           <div className="px-2 py-1 bg-cyan-600 rounded text-[10px] font-bold text-white">VI</div>
                           <div className="text-[10px] text-slate-400">Tiếng Việt</div>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <div className="bg-slate-800/50 rounded-lg p-2 text-[10px] text-slate-400 italic">HTML is gì?</div>
                        <div className="bg-cyan-600/10 border border-cyan-500/30 rounded-lg p-2 text-[10px] text-white font-medium">HTML là gì?</div>
                     </div>
                     <button className="w-full mt-3 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold py-2 rounded-lg transition-colors">
                        Dịch ngay
                     </button>
                  </div>
                  <div className="flex justify-center gap-2 mt-4 text-[10px] text-slate-500">
                     <span className="hover:text-white cursor-pointer transition-colors">🇬🇧</span>
                     <span className="hover:text-white cursor-pointer transition-colors">🇻🇳</span>
                     <span className="hover:text-white cursor-pointer transition-colors">🇯🇵</span>
                     <span className="hover:text-white cursor-pointer transition-colors">🇰🇷</span>
                     <span className="hover:text-white cursor-pointer transition-colors">🇨🇳</span>
                  </div>
               </div>
            </div>

            {/* Feature 7: Advanced Quiz System */}
            <div className="col-span-1 lg:col-span-2 bg-slate-900 border border-white/10 rounded-3xl p-8 group hover:border-green-500/50 transition-colors relative overflow-hidden flex flex-col justify-between">
              <div className="mb-6 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-6 text-green-400 group-hover:scale-110 transition-transform">
                  <HiCheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Hệ thống thi cử chuyên nghiệp</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Tổ chức kỳ thi trực tuyến với mã bảo mật. Tùy chỉnh thời gian, trộn câu hỏi và chấm điểm tự động.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                 <div className="space-y-3">
                    <div className="bg-[#0B1120] border border-white/10 p-3 rounded-xl shadow-lg">
                       <div className="text-[10px] text-slate-400 mb-1 uppercase font-bold text-center">Nhập mã truy cập</div>
                       <div className="bg-[#151e32] border border-white/10 rounded-lg p-2 text-center text tracking-[0.2em] font-mono text-slate-500 mb-2">DETAILS</div>
                       <div className="w-full py-1.5 bg-indigo-600 rounded text-[10px] text-center font-bold text-white">Tham gia Quiz →</div>
                    </div>
                    <div className="bg-[#0B1120] border border-white/10 p-3 rounded-xl shadow-lg">
                       <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] text-slate-400 font-bold">Câu 1/30</span>
                          <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 rounded font-mono">29:55</span>
                       </div>
                       <div className="w-full bg-slate-800 h-1 rounded-full mb-2"><div className="w-2/3 bg-blue-500 h-full rounded-full"></div></div>
                       <div className="text-xs font-bold text-white mb-2">HTML là gì?</div>
                       <div className="space-y-1">
                          <div className="bg-[#151e32] border border-green-500/50 p-1.5 rounded text-[10px] text-white flex justify-between items-center">
                             <span>A. HyperText Markup Language</span>
                             <HiCheckCircle className="text-green-500" />
                          </div>
                          <div className="bg-[#151e32] border border-white/5 p-1.5 rounded text-[10px] text-slate-400">B. HighText Machine Language</div>
                       </div>
                    </div>
                 </div>
                 <div className="space-y-3">
                    <div className="bg-[#0B1120] border border-white/10 p-4 rounded-xl shadow-lg flex flex-col items-center">
                       <div className="text-[10px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full font-bold mb-2">KHÔNG ĐẠT</div>
                       <div className="w-20 h-20 rounded-full border-4 border-slate-800 border-t-red-500 flex flex-col items-center justify-center mb-2">
                          <span className="text-2xl font-black text-white">0%</span>
                          <span className="text-[8px] text-red-500 font-bold">ĐIỂM F</span>
                       </div>
                       <div className="grid grid-cols-2 gap-2 w-full text-center">
                          <div className="bg-[#151e32] rounded p-1"><div className="text-[10px] text-green-500 font-bold">0 Đúng</div></div>
                          <div className="bg-[#151e32] rounded p-1"><div className="text-[10px] text-red-500 font-bold">1 Sai</div></div>
                       </div>
                    </div>
                    <div className="bg-[#0B1120] border border-white/10 p-3 rounded-xl shadow-lg">
                       <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/5">
                          <span className="text-[10px] text-yellow-500 font-bold"><HiTrophy className="inline" /> Điểm đạt</span>
                          <span className="text-[10px] font-mono bg-slate-800 px-1 rounded">60%</span>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">Trộn câu hỏi</span>
                          <div className="w-6 h-3 bg-blue-600 rounded-full relative"><div className="w-2 h-2 bg-white rounded-full absolute right-0.5 top-0.5"></div></div>
                       </div>
                    </div>
                 </div>
              </div>
            </div>

            {/* ROW 4: Community (Full width) */}

            {/* ROW 4: Community (Full width) */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3 pb-4 pt-8">
               <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="w-8 h-1 bg-green-500 rounded-full"></span>
                  Cộng đồng & Kết nối
               </h3>
            </div>

            {/* Feature 8: Study Groups & Community */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-slate-900 border border-white/10 rounded-3xl p-8 flex flex-col items-center relative overflow-hidden group">
               <div className="w-full relative z-10 flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex-1 text-left">
                     <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center mb-6 text-blue-400">
                       <HiUserGroup className="w-6 h-6" />
                     </div>
                     <h3 className="text-2xl font-bold mb-4">Cộng đồng học tập</h3>
                     <p className="text-slate-400 mb-6">
                        Tham gia các nhóm học tập, chia sẻ bộ thẻ và thi đua cùng bạn bè. Không còn cô đơn trên con đường chinh phục tri thức.
                     </p>
                     
                     {/* Mockup: Group List */}
                     <div className="space-y-3 w-full max-w-sm">
                        {[
                           { name: 'IELTS Band 7.0+', type: 'Công khai', mem: '1.2k', img: 'bg-red-500' },
                           { name: 'Học lập trình Web', type: 'Riêng tư', mem: '450', img: 'bg-blue-500' }
                        ].map((g, i) => (
                           <div key={i} className="bg-[#0F172A] border border-white/5 p-3 rounded-xl flex items-center gap-3 hover:border-blue-500/30 transition-colors">
                              <div className={`w-10 h-10 rounded-lg ${g.img} flex items-center justify-center text-white font-bold opacity-80`}>
                                 {g.name[0]}
                              </div>
                              <div className="flex-1">
                                 <div className="font-bold text-sm text-white truncate">{g.name}</div>
                                 <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                    <span className="flex items-center gap-0.5"><HiUserGroup className="w-3 h-3" /> {g.mem}</span>
                                    <span>•</span>
                                    <span className={g.type === 'Riêng tư' ? 'text-yellow-500' : 'text-green-500'}>{g.type}</span>
                                 </div>
                              </div>
                              <div className="px-3 py-1.5 bg-blue-600 rounded-lg text-[10px] font-bold text-white hover:bg-blue-500 cursor-pointer">Vào</div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Mockup: Group Post (Stacked Card effect) */}
                  <div className="w-full md:w-2/5 relative mt-8 md:mt-0 perspective-1000">
                     <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
                     <div className="relative bg-[#1e293b] border border-white/10 rounded-xl p-4 shadow-2xl skew-y-3 md:group-hover:skew-y-0 transition-transform duration-500">
                        {/* Post Header */}
                        <div className="flex items-center gap-3 mb-3">
                           <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 p-0.5">
                              <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">🙈</div>
                           </div>
                           <div>
                              <div className="text-xs font-bold text-white">Nguyễn Minh Đức</div>
                              <div className="text-[10px] text-slate-500">Vừa xong</div>
                           </div>
                        </div>
                        {/* Post Content */}
                        <p className="text-xs text-slate-300 mb-3">vào học ae ôi 👇</p>
                        {/* Attachment Card */}
                        <div className="bg-[#2e3b52] rounded-lg p-3 flex items-center gap-3 border border-indigo-500/30">
                           <div className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center">
                              <HiDocumentText className="text-white w-5 h-5" />
                           </div>
                           <div>
                              <div className="text-xs font-bold text-white">VLP1- CƠ HỌC</div>
                              <div className="text-[10px] text-slate-400">80 thẻ</div>
                           </div>
                        </div>
                        {/* Reactions */}
                        <div className="flex gap-3 mt-3 pt-3 border-t border-white/5 text-[10px] text-slate-400">
                           <span className="flex items-center gap-1 text-red-400 font-bold">❤️ 24</span>
                           <span className="flex items-center gap-1">💬 5 bình luận</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>


      {/* 
        ========================================
        GAMIFICATION
        ======================================== 
      */}
      <section className="py-24 bg-gradient-to-b from-slate-950 to-indigo-950/20 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-500 font-bold text-sm mb-6 border border-yellow-500/20">
            <HiTrophy /> Gamification
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-8 text-white">
            Học mà chơi, <br className="md:hidden" /> chơi mà điểm cao
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-16 text-lg">
            Mỗi hành động học đều được ghi nhận. Level & huy hiệu giúp bạn nhìn thấy sự tiến bộ mỗi ngày. <span className="text-yellow-400 font-bold">Phần thưởng:</span> Mở khóa Theme độc quyền, Khung Avatar VIP và hơn thế nữa.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {/* Render some real badges for effect */}
             {BADGES.slice(0, 4).map((badge, idx) => {
                const Icon = badge.icon;
                return (
                  <div key={idx} className="bg-slate-900/40 backdrop-blur-sm border border-white/5 p-6 rounded-2xl flex flex-col items-center gap-4 hover:-translate-y-2 transition-transform duration-300 group">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border-4 border-slate-700 flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/20 group-hover:border-indigo-500/50 transition-all">
                       <Icon className="w-10 h-10 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <div>
                       <div className="text-white font-bold">{badge.name}</div>
                       <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{badge.tier} Tier</div>
                    </div>
                  </div>
                );
             })}
          </div>

          <div className="mt-16 p-8 bg-slate-900/50 rounded-3xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 max-w-4xl mx-auto">
             <div className="flex items-center gap-4">
                <div className="text-left">
                   <h3 className="text-xl font-bold text-white mb-2">Daily Streak History</h3>
                   <div className="flex items-center gap-2">
                      {['T2','T3','T4','T5','T6','T7','CN'].map((day, i) => (
                        <div key={day} className="flex flex-col items-center gap-1">
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${i === 6 ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/30' : i === 5 ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                              {i >= 5 && <HiCheckCircle />}
                           </div>
                           <span className="text-[10px] text-slate-500">{day}</span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
             <div className="h-10 w-px bg-white/10 hidden md:block"></div>
             <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                   <PiGameControllerFill className="w-8 h-8 text-purple-500" />
                </div>
                <div className="text-left">
                   <h3 className="text-xl font-bold text-white">Leaderboards</h3>
                   <p className="text-slate-400 text-sm">Cạnh tranh xếp hạng với bạn bè</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 
        ========================================
        WHO IS FLIPLAB FOR?
        ======================================== 
      */}
      <section className="py-24 max-w-7xl mx-auto px-6" id="about">
        <h2 className="text-3xl font-bold mb-12 text-center">Dành cho mọi người học</h2>
        <div className="grid md:grid-cols-3 gap-8">
           <div className="p-8 rounded-3xl bg-slate-900/50 border border-white/10 text-center hover:bg-slate-800 transition-all hover:-translate-y-2 duration-300 group">
              <div className="w-16 h-16 mx-auto bg-blue-600/20 rounded-full flex items-center justify-center mb-6 text-blue-500 group-hover:scale-110 transition-transform ring-4 ring-blue-500/10">
                <HiAcademicCap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Học sinh & Sinh viên</h3>
              <p className="text-slate-300 text-sm font-medium leading-relaxed">"Ôn thi cấp tốc, nhớ công thức Toán/Lý và hàng nghìn từ vựng tiếng Anh nhanh chóng."</p>
           </div>
           
           <div className="p-8 rounded-3xl bg-slate-900/50 border border-white/10 text-center hover:bg-slate-800 transition-all hover:-translate-y-2 duration-300 group">
              <div className="w-16 h-16 mx-auto bg-pink-600/20 rounded-full flex items-center justify-center mb-6 text-pink-500 group-hover:scale-110 transition-transform ring-4 ring-pink-500/10">
                <HiBriefcase className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Người đi làm</h3>
              <p className="text-slate-300 text-sm font-medium leading-relaxed">"Học từ vựng chuyên ngành chỉ với 5 phút rảnh rỗi. Nâng cao nghiệp vụ mà không tốn thời gian."</p>
           </div>
           
           <div className="p-8 rounded-3xl bg-slate-900/50 border border-white/10 text-center hover:bg-slate-800 transition-all hover:-translate-y-2 duration-300 group">
              <div className="w-16 h-16 mx-auto bg-teal-600/20 rounded-full flex items-center justify-center mb-6 text-teal-500 group-hover:scale-110 transition-transform ring-4 ring-teal-500/10">
                 <HiGlobeAlt className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Người tự học</h3>
              <p className="text-slate-300 text-sm font-medium leading-relaxed">"Lộ trình cá nhân hóa, tự chủ thời gian. Master kỹ năng mới mà không cần giáo viên kèm cặp."</p>
           </div>
        </div>
      </section>

      {/* 
        ========================================
        TESTIMONIALS
        ======================================== 
      */}
       <section className="py-24 bg-slate-900 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6">
             <h2 className="text-3xl font-bold text-center mb-16">Người học nói gì về FlipLab?</h2>
             <div className="grid md:grid-cols-3 gap-8">
                {/* 1 */}
                <div className="bg-slate-950 p-8 rounded-2xl border border-white/5 relative hover:-translate-y-1 transition-transform duration-300">
                   <div className="absolute -top-4 left-8 text-6xl text-indigo-500 opacity-20 font-serif">"</div>
                   <p className="text-slate-300 mb-6 italic text-sm leading-relaxed">"Mình đã tăng từ 5.0 lên 7.0 IELTS Reading chỉ sau 2 tháng dùng FlipLab để học từ vựng chuyên ngành. AI giải thích cực dễ hiểu."</p>
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-600 font-bold flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">H</div>
                      <div>
                         <div className="font-bold text-white text-sm">Hoàng Nam</div>
                         <div className="text-xs text-slate-500">Sinh viên ĐH Bách Khoa</div>
                      </div>
                   </div>
                </div>
                {/* 2 */}
                <div className="bg-slate-950 p-8 rounded-2xl border border-white/5 relative hover:-translate-y-1 transition-transform duration-300">
                   <div className="absolute -top-4 left-8 text-6xl text-indigo-500 opacity-20 font-serif">"</div>
                   <p className="text-slate-300 mb-6 italic text-sm leading-relaxed">"Mình học Y nên lượng kiến thức Giải phẫu cực khủng khiếp. FlipLab giúp mình nhớ vị trí 206 xương và các dây thần kinh chỉ trong 1 tuần. Cứu tinh thực sự!"</p>
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-pink-600 font-bold flex items-center justify-center text-white shadow-lg shadow-pink-500/30">M</div>
                      <div>
                         <div className="font-bold text-white text-sm">Minh Thư</div>
                         <div className="text-xs text-slate-500">Sinh viên Y Đa Khoa</div>
                      </div>
                   </div>
                </div>
                {/* 3 */}
                <div className="bg-slate-950 p-8 rounded-2xl border border-white/5 relative hover:-translate-y-1 transition-transform duration-300">
                   <div className="absolute -top-4 left-8 text-6xl text-indigo-500 opacity-20 font-serif">"</div>
                   <p className="text-slate-300 mb-6 italic text-sm leading-relaxed">"Ôn thi THPT Quốc gia môn Sử, Địa nhẹ nhàng hẳn. Mình copy văn bản sách giáo khoa vào, AI tự tạo câu hỏi trắc nghiệm để ôn tập. Quá tiện."</p>
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-600 font-bold flex items-center justify-center text-white shadow-lg shadow-green-500/30">G</div>
                      <div>
                         <div className="font-bold text-white text-sm">Gia Hưng</div>
                         <div className="text-xs text-slate-500">Học sinh lớp 12</div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
       </section>

      {/* 
        ========================================
        FINAL CTA
        ======================================== 
      */}
      <section className="py-32 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-900/20 pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Bắt đầu học đúng cách từ hôm nay
          </h2>
          <p className="text-xl text-slate-300 mb-10">
            Tham gia cùng hàng nghìn người học khác trên FlipLab. Hoàn toàn miễn phí.
          </p>
          <Link 
            to="/register" 
            className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-white text-indigo-900 font-black text-xl hover:scale-105 transition-transform shadow-2xl shadow-indigo-500/30"
          >
            Tạo tài khoản miễn phí <HiArrowRight />
          </Link>
          <p className="mt-6 text-sm text-slate-500 flex items-center justify-center gap-2">
            <HiCheckCircle className="text-green-500" /> Không cần thẻ tín dụng. Không rủi ro.
          </p>
        </div>
      </section>

      {/* 
        ========================================
        FOOTER
        ======================================== 
      */}
      <footer className="bg-slate-950 border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <HiBolt className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">FlipLab</span>
           </div>

           <div className="flex gap-8 text-sm text-slate-400">
              <Link to="/about" className="hover:text-white transition-colors">Về chúng tôi</Link>
              <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Tính năng</button>
              <button onClick={() => setActiveModal('privacy')} className="hover:text-white transition-colors">Bảo mật</button>
              <button onClick={() => setActiveModal('contact')} className="hover:text-white transition-colors">Liên hệ</button>
           </div>

           <div className="text-xs text-slate-500">
              &copy; 2026 FlipLab. All rights reserved.
           </div>
        </div>
      </footer>
      {/* 
        ========================================
        MODALS
        ======================================== 
      */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setActiveModal(null)}></div>
          <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-2xl w-full text-left shadow-2xl animate-in fade-in zoom-in duration-200 lg:p-10">
             {/* Close Button */}
             <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full p-2 transition-colors z-10 cursor-pointer">
               <HiXMark className="w-6 h-6" />
             </button>

             {activeModal === 'privacy' ? (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                      <HiShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Chính sách bảo mật</h3>
                  </div>
                  <div className="prose prose-invert prose-sm max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    <p className="text-slate-300">Cập nhật lần cuối: 01/02/2026</p>
                    <h4 className="text-white font-bold mt-4 mb-2">1. Thu thập thông tin</h4>
                    <p className="text-slate-400">Chúng tôi chỉ thu thập các thông tin cần thiết để cung cấp dịch vụ tốt nhất cho bạn, bao gồm: tên hiển thị, địa chỉ email, và dữ liệu học tập (bộ thẻ, tiến độ).</p>
                    
                    <h4 className="text-white font-bold mt-4 mb-2">2. Sử dụng thông tin</h4>
                    <p className="text-slate-400">Thông tin của bạn được sử dụng để cá nhân hóa trải nghiệm học tập, đồng bộ dữ liệu giữa các thiết bị và cải thiện chất lượng của FlipLab.</p>

                    <h4 className="text-white font-bold mt-4 mb-2">3. Bảo mật dữ liệu</h4>
                    <p className="text-slate-400">Mọi dữ liệu cá nhân đều được mã hóa và lưu trữ an toàn. Chúng tôi cam kết không chia sẻ thông tin của bạn với bất kỳ bên thứ ba nào mà không có sự đồng ý.</p>

                    <h4 className="text-white font-bold mt-4 mb-2">4. Quyền của bạn</h4>
                    <p className="text-slate-400">Bạn có quyền yêu cầu truy cập, chỉnh sửa hoặc xóa dữ liệu cá nhân của mình bất cứ lúc nào thông qua phần cài đặt tài khoản.</p>
                  </div>
                  <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
                    <button onClick={() => setActiveModal(null)} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-colors">Đã hiểu</button>
                  </div>
                </>
             ) : (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <HiEnvelope className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Liên hệ hỗ trợ</h3>
                  </div>
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-1">Họ tên</label>
                      <input 
                        type="text" 
                        required
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        placeholder="Nhập tên của bạn"
                        value={contactForm.name}
                        onChange={e => setContactForm({...contactForm, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-1">Email</label>
                      <input 
                        type="email" 
                        required
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        placeholder="email@example.com"
                        value={contactForm.email}
                        onChange={e => setContactForm({...contactForm, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-1">Nội dung</label>
                      <textarea 
                        required
                        rows={4}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                        placeholder="Bạn cần hỗ trợ gì?"
                        value={contactForm.message}
                        onChange={e => setContactForm({...contactForm, message: e.target.value})}
                      ></textarea>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                      <button type="button" onClick={() => setActiveModal(null)} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors">Hủy</button>
                      <button type="submit" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-indigo-500/20">Gửi tin nhắn</button>
                    </div>
                  </form>
                </>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
