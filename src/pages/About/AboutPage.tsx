import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HiBolt, 
  HiRocketLaunch, 
  HiHeart,
  HiGlobeAlt,
  HiSparkles,
  HiBriefcase,
  HiLightBulb,
  HiFire,
  HiCodeBracket,
  HiMapPin,
  HiHome,
  HiAcademicCap,
  HiShieldCheck
} from 'react-icons/hi2';
import { FaGithub, FaLinkedin, FaFacebook } from 'react-icons/fa';
import founderImg from '../../assets/founder.png';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      {/* 
        ========================================
        NAVBAR (Consistent top)
        ======================================== 
      */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#020617]/70 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/intro" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
              <HiBolt className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              FlipLab
            </span>
          </Link>
          <div className="flex items-center gap-4">
             <a href="https://github.com/mduchd" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors"><FaGithub className="w-5 h-5"/></a>
             <Link to="/login" className="px-4 py-2 text-sm font-bold text-white bg-white/10 hover:bg-white/20 rounded-full transition-all">Đăng nhập</Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
         {/* Background Ambience */}
         <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
         </div>

         {/* 
            BENTO GRID LAYOUT - BRAND STORY VERSION
         */}
         <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 relative z-10">
            
            {/* 1. HERO CARD (2x2) - MISSION FOCUSED */}
            <div className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 bg-[#0F172A]/60 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/10 flex flex-col justify-between relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
               
               <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 mb-6">
                     <HiSparkles className="w-3 h-3 animate-pulse" />
                     Tầm nhìn
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
                     Người đồng hành cùng <br/>
                     <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">trí nhớ của bạn.</span>
                  </h1>
                  <div className="text-slate-300 text-lg leading-relaxed max-w-lg space-y-4">
                     <p>
                        "FlipLab được xây dựng bởi Minh Đức với niềm tin rằng AI có thể giúp việc học trở nên cá nhân hóa và thú vị hơn bao giờ hết."
                     </p>
                     <p>
                        "Tôi khao khát xây dựng một hệ sinh thái nơi mọi rào cản về ngôn ngữ và trí nhớ bị xóa bỏ. Học tập không nên là gánh nặng, mà là hành trình khám phá đầy cảm hứng của mỗi người."
                     </p>
                  </div>
                  
                  {/* Focus Tags */}
                  <div className="flex flex-wrap gap-2 mt-8">
                     <span className="px-4 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider">Lifelong Learner</span>
                     <span className="px-4 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider">AI Enthusiast</span>
                     <span className="px-4 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider">Problem Solver</span>
                  </div>
               </div>

               <div className="mt-8 flex gap-3">
                  <a href="#story" className="px-6 py-3 rounded-full bg-white text-slate-950 font-bold hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-white/10">
                     <HiHeart className="text-red-500" /> Câu chuyện của tôi
                  </a>
               </div>
            </div>

            {/* 2. AVATAR CARD (1x1) - FRIENDLY FOUNDER */}
            <div className="col-span-1 md:col-span-1 lg:col-span-1 row-span-1 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-1 border border-white/10 relative group overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
               <div className="w-full h-full bg-[#0F172A] rounded-[22px] relative overflow-hidden">
                  <img 
                    src={founderImg} 
                    alt="Minh Duc Founder" 
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 pt-12 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent">
                     <div className="text-center translate-y-1 group-hover:translate-y-0 transition-transform duration-500">
                        <div className="text-base font-bold text-white">Minh Đức</div>
                        <div className="text-[10px] text-indigo-300 uppercase tracking-widest font-bold">Founder</div>
                     </div>
                  </div>
               </div>
            </div>

            {/* 3. MAP / LOCATION / INFO (1x1) */}
            <div className="col-span-1 md:col-span-1 lg:col-span-1 row-span-1 bg-[#0F172A]/60 backdrop-blur-md rounded-3xl p-5 border border-white/10 flex flex-col justify-between group hover:border-indigo-500/30 transition-colors relative overflow-hidden">
               {/* Decorative Map BG */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
                  <svg width="200" height="100" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <path d="M20 50 Q 50 20 80 50 T 140 50 T 190 30" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
                     <circle cx="20" cy="50" r="3" fill="white" />
                     <circle cx="80" cy="50" r="3" fill="white" />
                     <circle cx="140" cy="50" r="3" fill="white" />
                  </svg>
               </div>

               <div className="flex justify-between items-center mb-4 relative z-10">
                  <div className="p-2.5 rounded-full bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20">
                     <HiGlobeAlt className="w-5 h-5" />
                  </div>
                  <div className="px-3 py-1 rounded-full bg-slate-800 border border-white/5 text-[10px] text-slate-300 font-bold flex items-center gap-1.5">
                     <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                     Việt Nam (UTC+7)
                  </div>
               </div>


               {/* Middle: Current Focus Box */}
               <div className="flex-1 flex flex-col justify-center py-6">
                  <div className="bg-slate-800/50 rounded-2xl p-4 border border-white/5 backdrop-blur-sm relative overflow-hidden group/focus">
                     <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover/focus:opacity-100 transition-opacity"></div>
                     <div className="relative z-10">
                        <div className="text-[10px] text-slate-400 uppercase font-bold mb-1.5 flex items-center gap-1.5">
                           <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                           </span>
                           Đang thực hiện
                        </div>
                        <div className="text-sm font-medium text-white leading-tight">
                           Thiết kế giao diện <br/>
                           <span className="text-indigo-400">Voice AI Tutor</span>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="space-y-4 relative z-10">
                  <div className="flex items-center gap-3 text-sm text-slate-300 group/item">
                     <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 group-hover/item:text-indigo-400 group-hover/item:bg-indigo-500/10 transition-colors">
                        <HiMapPin className="w-5 h-5" />
                     </div>
                     <div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Based in</div>
                        <div className="font-bold text-white leading-none text-base">Hanoi, Vietnam</div>
                     </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-300 group/item">
                     <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 group-hover/item:text-indigo-400 group-hover/item:bg-indigo-500/10 transition-colors">
                        <HiCodeBracket className="w-5 h-5" /> 
                     </div>
                     <div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Role</div>
                        <div className="font-bold text-white leading-none text-base">Software Engineer</div>
                     </div>
                  </div>
               </div>
            </div>

            {/* 4. CORE VALUES (2x1) - REPLACING TECH STACK */}
            <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-[#0F172A]/60 backdrop-blur-md rounded-3xl p-6 border border-white/10 flex flex-col justify-center gap-4 group hover:border-indigo-500/30 transition-colors">
               <div className="flex items-center gap-2 mb-2">
                  <HiLightBulb className="text-yellow-400 w-5 h-5" />
                  <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">Giá trị cốt lõi</span>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5 hover:bg-slate-800 transition-colors">
                     <HiRocketLaunch className="w-6 h-6 text-blue-400 mb-2" />
                     <div className="font-bold text-white mb-1">Tốc độ</div>
                     <p className="text-xs text-slate-400">Học nhanh, nhớ lâu nhờ thuật toán tối ưu.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5 hover:bg-slate-800 transition-colors">
                     <HiLightBulb className="w-6 h-6 text-yellow-500 mb-2" />
                     <div className="font-bold text-white mb-1">Sáng tạo</div>
                     <p className="text-xs text-slate-400">Học không gò bó, tự do tùy biến.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5 hover:bg-slate-800 transition-colors">
                     <HiHeart className="w-6 h-6 text-red-500 mb-2" />
                     <div className="font-bold text-white mb-1">Tận tâm</div>
                     <p className="text-xs text-slate-400">Đồng hành và lắng nghe trên mọi chặng đường.</p>
                  </div>
               </div>
            </div>

             {/* 5. STATS - BEHIND THE SCENES (1x1) */}
             <div className="col-span-1 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white flex flex-col justify-between shadow-lg shadow-indigo-500/20 group hover:scale-[1.02] transition-transform">
               <HiCodeBracket className="w-8 h-8 opacity-50 mb-4" />
               <div>
                  <div className="text-4xl font-black mb-1">1000+</div>
                  <div className="text-sm opacity-90 font-medium">Giờ code & Cà phê</div>
                  <p className="text-xs mt-2 text-indigo-100 font-medium">Được cung cấp năng lượng bởi đam mê (và rất nhiều caffeine).</p>
               </div>
            </div>

            {/* 6. INDIE HACKER SPIRIT (Wide) */}
            <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-[#0F172A]/60 backdrop-blur-md rounded-3xl p-8 border border-white/10 flex flex-col justify-center relative overflow-hidden" id="story">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                  <HiFire className="w-32 h-32" />
               </div>
               <p className="text-lg font-medium text-slate-300 italic relative z-10">
                  "Tôi là một người học suốt đời. FlipLab ra đời để giải quyết vấn đề của chính tôi, và giờ đây là của bạn."
               </p>
               <div className="mt-4 flex items-center gap-2">
                  <div className="h-px bg-white/20 w-10"></div>
                  <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest">The Spirit</div>
               </div>
            </div>

            {/* 7. SOCIALS / CONNECT (1x1) */}
            <div className="col-span-1 bg-[#0F172A]/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex flex-col justify-center items-center gap-6 group hover:border-indigo-500/30 transition-colors">
               <div className="font-black text-lg text-center leading-tight text-white">Kết nối với Founder</div>
               <div className="flex gap-4">
                  <a href="#" className="p-3 bg-slate-800 rounded-full hover:bg-white hover:text-slate-900 text-white hover:scale-110 transition-all text-xl border border-white/10"><FaGithub /></a>
                  <a href="#" className="p-3 bg-slate-800 rounded-full hover:bg-blue-600 hover:text-white text-white hover:scale-110 transition-all text-xl border border-white/10"><FaLinkedin /></a>
                  <a href="#" className="p-3 bg-slate-800 rounded-full hover:bg-blue-500 hover:text-white text-white hover:scale-110 transition-all text-xl border border-white/10"><FaFacebook /></a>
               </div>
            </div>

            {/* 8. ROADMAP & FUTURE (Full Width) */}
            <div className="col-span-1 md:col-span-3 lg:col-span-4 bg-[#0F172A]/80 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/10 mt-4 relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
               
               <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
                  <div className="max-w-xl">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider mb-4">
                        Sắp ra mắt
                     </div>
                     <h2 className="text-3xl font-black mb-4">Tương lai của FlipLab?</h2>
                     <p className="text-slate-400 text-lg">
                        Chúng tôi không dừng lại ở Flashcard. App Mobile, Chế độ luyện thi Voice Chat AI và Cộng đồng chia sẻ tri thức mở đang được phát triển. Dưới đây là lộ trình:
                     </p>
                  </div>
                  <div className="flex gap-4 opacity-80 overflow-x-auto pb-4 md:pb-0 w-full md:w-auto">
                      <div className="min-w-[140px] p-4 rounded-xl bg-slate-900 border border-white/10 text-center">
                          <div className="text-xs text-slate-500 mb-2 font-mono">Q2/2026</div>
                          <div className="font-bold text-white">Mobile App</div>
                      </div>
                      <div className="min-w-[140px] p-4 rounded-xl bg-slate-900 border border-white/10 text-center">
                          <div className="text-xs text-slate-500 mb-2 font-mono">Q3/2026</div>
                          <div className="font-bold text-white">Voice AI Tutor</div>
                      </div>
                      <div className="min-w-[140px] p-4 rounded-xl bg-slate-900 border border-white/10 text-center">
                          <div className="text-xs text-slate-500 mb-2 font-mono">Q4/2026</div>
                          <div className="font-bold text-white">Marketplace</div>
                      </div>
                  </div>
               </div>
            </div>

         </div>

         {/* TIMELINE SECTION - PRODUCT JOURNEY */}
         <div className="mt-24 max-w-3xl mx-auto">
            <h2 className="text-2xl font-black mb-12 flex items-center gap-3">
               <HiBriefcase className="text-indigo-500" /> Hành trình FlipLab
            </h2>
            <div className="space-y-12 relative border-l-2 border-slate-800 ml-3 pl-8 md:pl-12">
               <div className="relative">
                  <div className="absolute -left-[43px] md:-left-[59px] w-6 h-6 rounded-full bg-indigo-500 border-4 border-[#020617]"></div>
                  <div className="text-indigo-400 font-bold font-mono text-base mb-1">Hiện tại & Tương lai</div>
                  <h3 className="text-xl font-bold text-white">Chính thức ra mắt & Mở rộng</h3>
                  <p className="text-slate-400 mt-2">FlipLab v1.0 ra đời với tính năng AI nhập liệu tự động. Chúng tôi đang nỗ lực mỗi ngày để hoàn thiện sản phẩm dựa trên feedback của bạn.</p>
               </div>
               <div className="relative">
                  <div className="absolute -left-[43px] md:-left-[59px] w-6 h-6 rounded-full bg-slate-700 border-4 border-[#020617]"></div>
                  <div className="text-indigo-400 font-bold font-mono text-base mb-1">2024 - 2025</div>
                  <h3 className="text-xl font-bold text-white">Những dòng code đầu tiên (MVP)</h3>
                  <p className="text-slate-400 mt-2">Phiên bản thử nghiệm được xây dựng. Hàng trăm giờ debug và tối ưu hóa trải nghiệm người dùng để đạt được tốc độ lật thẻ mượt mà nhất.</p>
               </div>
               <div className="relative">
                  <div className="absolute -left-[43px] md:-left-[59px] w-6 h-6 rounded-full bg-slate-700 border-4 border-[#020617]"></div>
                  <div className="text-indigo-400 font-bold font-mono text-base mb-1">2022</div>
                  <h3 className="text-xl font-bold text-white">Ý tưởng nảy sinh</h3>
                  <p className="text-slate-400 mt-2">Là một sinh viên, tôi chật vật với áp lực ghi nhớ hàng ngàn trang tài liệu trước mỗi kỳ thi. Tôi nhận ra mình cần một công cụ thông minh hơn là cách học vẹt truyền thống.</p>
               </div>
            </div>
         </div>

         {/* FINAL CTA */}
         <div className="mt-24 mb-12 text-center">
            <div className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-br from-indigo-900/50 to-blue-900/50 border border-indigo-500/20 overflow-hidden">
               <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
               <div className="relative z-10">
                  <h2 className="text-3xl md:text-4xl font-black mb-6">Bạn đã sẵn sàng chinh phục kiến thức cùng tôi chưa?</h2>
                  <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-indigo-900 font-bold text-lg hover:bg-slate-200 hover:scale-105 transition-all shadow-xl shadow-white/10 group">
                     Bắt đầu học miễn phí ngay
                     <HiRocketLaunch className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                  </Link>
                  <p className="mt-6 text-slate-300 text-sm font-medium flex items-center justify-center gap-2">
                     <HiShieldCheck className="w-5 h-5 text-green-500" />
                     Không cần thẻ tín dụng. Miễn phí trọn đời cho tính năng cơ bản.
                  </p>
               </div>
            </div>
         </div>
         
         <div className="mt-24 text-center border-t border-white/5 pt-12">
            <p className="text-slate-500">
               © 2026 FlipLab • Made with ❤️ for Students.
            </p>
         </div>
      </main>
    </div>
  );
};

export default AboutPage;
