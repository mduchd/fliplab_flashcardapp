import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { HiBolt, HiArrowPath, HiEye, HiEyeSlash, HiFire, HiTrophy, HiPuzzlePiece, HiUserCircle, HiSquares2X2, HiAcademicCap } from 'react-icons/hi2';
import { useToastContext } from '../../contexts/ToastContext';
import { FaFacebook, FaApple } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [leftPanelVisible, setLeftPanelVisible] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToastContext();

  // Stagger animations
  useEffect(() => {
    const timer1 = setTimeout(() => setLeftPanelVisible(true), 100);
    const timer2 = setTimeout(() => setIsVisible(true), 300);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      toast.success('Đăng nhập thành công!');
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    toast.info(`Đăng nhập với ${provider} đang được phát triển`);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900">
      {/* Left Side - Marketing/Promo - More Vibrant */}
      <div className={`hidden lg:flex lg:w-1/2 relative overflow-hidden opacity-90 transition-all duration-700 ${leftPanelVisible ? 'translate-x-0' : '-translate-x-8'}`}>
        {/* Background decoration - More vibrant with patterns */}
        <div className="absolute inset-0">
          {/* Animated gradient orbs */}
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          
          {/* Floating geometric shapes - at edges */}
          <div className="absolute top-10 right-10 w-32 h-32 border-2 border-white/10 rounded-2xl rotate-12 animate-float"></div>
          <div className="absolute bottom-20 left-8 w-24 h-24 border-2 border-blue-300/10 rounded-full animate-float-delayed"></div>
          <div className="absolute top-16 left-16 w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg rotate-45 animate-float-slow"></div>
          <div className="absolute bottom-16 right-16 w-20 h-20 border-2 border-purple-300/10 rounded-lg rotate-12 animate-float"></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)]"></div>
          
          {/* Animated floating cards - at far edges */}
          <div className="absolute top-20 left-8 w-20 h-28 bg-white/5 backdrop-blur-sm rounded-xl shadow-xl animate-float-card border border-white/10">
            <div className="absolute inset-2 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-lg"></div>
          </div>
          <div className="absolute bottom-20 right-8 w-16 h-24 bg-white/5 backdrop-blur-sm rounded-xl shadow-xl animate-float-card-delayed border border-white/10">
            <div className="absolute inset-2 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-lg"></div>
          </div>
          
          {/* Sparkle effects - scattered at edges */}
          <div className="absolute top-24 left-24 w-2 h-2 bg-white rounded-full animate-sparkle"></div>
          <div className="absolute top-1/3 right-20 w-1.5 h-1.5 bg-blue-200 rounded-full animate-sparkle" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-24 left-32 w-1 h-1 bg-purple-200 rounded-full animate-sparkle" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute bottom-1/3 right-24 w-1.5 h-1.5 bg-pink-200 rounded-full animate-sparkle" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-40 left-40 w-1 h-1 bg-blue-300 rounded-full animate-sparkle" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/4 right-16 w-1.5 h-1.5 bg-white rounded-full animate-sparkle" style={{ animationDelay: '2.5s' }}></div>
          <div className="absolute bottom-40 right-32 w-1 h-1 bg-purple-300 rounded-full animate-sparkle" style={{ animationDelay: '0.8s' }}></div>
          
          {/* Light beams from corners */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/5 to-transparent rotate-12 blur-2xl opacity-40"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-400/10 to-transparent -rotate-12 blur-2xl opacity-30"></div>
          
          {/* Rotating subtle rings */}
          <div className="absolute top-1/4 right-1/4 w-40 h-40 border border-white/5 rounded-full animate-spin" style={{ animationDuration: '20s' }}></div>
          <div className="absolute bottom-1/3 left-1/4 w-32 h-32 border border-blue-300/5 rounded-full animate-spin" style={{ animationDuration: '25s', animationDirection: 'reverse' }}></div>
          
          {/* Floating glassmorphic cards with icons - hidden on smaller screens */}
          <div className="hidden xl:block absolute top-16 left-8 w-16 h-20 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg animate-float-card rotate-12" style={{ animationDelay: '0.5s' }}>
            <div className="w-full h-full flex items-center justify-center">
              <HiAcademicCap className="w-8 h-8 text-blue-300/40" />
            </div>
          </div>
          <div className="hidden xl:block absolute top-12 right-8 w-14 h-18 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg animate-float-card-delayed -rotate-6" style={{ animationDelay: '1s' }}>
            <div className="w-full h-full flex items-center justify-center">
              <HiFire className="w-7 h-7 text-orange-300/40" />
            </div>
          </div>
          <div className="hidden xl:block absolute bottom-24 left-6 w-15 h-19 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg animate-float-card rotate-6" style={{ animationDelay: '1.5s' }}>
            <div className="w-full h-full flex items-center justify-center">
              <HiTrophy className="w-7 h-7 text-yellow-300/40" />
            </div>
          </div>
          <div className="hidden xl:block absolute bottom-16 right-6 w-13 h-17 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg animate-float-card-delayed -rotate-12" style={{ animationDelay: '2s' }}>
            <div className="w-full h-full flex items-center justify-center">
              <HiBolt className="w-6 h-6 text-purple-300/40" />
            </div>
          </div>
        </div>

        {/* Content with stagger animation */}
        <div className="relative z-10 flex flex-col px-16 pt-20 pb-12">
          {/* Logo */}
          <div className={`mb-3 transition-all duration-700 delay-100 ${leftPanelVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.12),0_0_0_1px_rgba(255,255,255,0.1)_inset]">
                <HiBolt className="w-8 h-8 text-white drop-shadow-lg" />
              </div>
              <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">FlipLab</h1>
            </div>
            <p className="text-lg text-blue-200/70 font-light">Lật thẻ. Nhớ sâu. Học thông minh.</p>
          </div>

          {/* Features Container - Grouped for visual weight */}
          <div className={`mb-6 bg-white/8 backdrop-blur-md border border-white/12 rounded-lg p-6 transition-all duration-700 delay-200 ${leftPanelVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {[
                { 
                  icon: HiSquares2X2, 
                  color: 'bg-blue-500/25', 
                  iconColor: 'text-blue-200', 
                  title: 'Custom thẻ', 
                  desc: 'Tự do thiết kế màu sắc, hình ảnh cho thẻ của bạn', 
                  delay: 'delay-100' 
                },
                { 
                  icon: HiFire, 
                  color: 'bg-orange-500/25', 
                  iconColor: 'text-orange-200', 
                  title: 'Streak học tập', 
                  desc: 'Theo dõi chuỗi ngày học liên tục của bạn', 
                  delay: 'delay-150' 
                },
                { 
                  icon: HiTrophy, 
                  color: 'bg-yellow-500/25', 
                  iconColor: 'text-yellow-200', 
                  title: 'Cày badges', 
                  desc: 'Mở khóa huy hiệu khi đạt thành tựu', 
                  delay: 'delay-200' 
                },
                { 
                  icon: HiAcademicCap, 
                  color: 'bg-purple-500/25', 
                  iconColor: 'text-purple-200', 
                  title: 'Làm trắc nghiệm', 
                  desc: 'Kiểm tra kiến thức với bài thi thử', 
                  delay: 'delay-250' 
                },
                { 
                  icon: HiPuzzlePiece, 
                  color: 'bg-green-500/25', 
                  iconColor: 'text-green-200', 
                  title: 'Ghép thẻ', 
                  desc: 'Trò chơi ghép đôi giúp ghi nhớ tốt hơn', 
                  delay: 'delay-300' 
                },
                { 
                  icon: HiUserCircle, 
                  color: 'bg-pink-500/25', 
                  iconColor: 'text-pink-200', 
                  title: 'Trang cá nhân', 
                  desc: 'Tùy chỉnh profile và theo dõi tiến độ', 
                  delay: 'delay-350' 
                }
              ].map((feature, idx) => (
                <div 
                  key={idx}
                  className={`transition-all duration-700 ${leftPanelVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'} ${feature.delay}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 ${feature.color} backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <feature.icon className={`w-5 h-5 ${feature.iconColor} drop-shadow-lg`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold text-base mb-0.5 leading-tight">{feature.title}</h3>
                      <p className="text-blue-100/80 text-xs leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats with counter animation effect - More prominent */}
          <div className={`grid grid-cols-3 gap-6 transition-all duration-700 delay-500 ${leftPanelVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="text-center bg-white/12 backdrop-blur-sm border border-white/15 rounded-lg p-4 shadow-lg">
              <div className="text-4xl font-extrabold text-white mb-1 drop-shadow-xl bg-gradient-to-br from-blue-400 to-white bg-clip-text text-transparent">10K+</div>
              <div className="text-xs text-blue-200/80 font-medium">Người dùng</div>
            </div>
            <div className="text-center bg-white/12 backdrop-blur-sm border border-white/15 rounded-lg p-4 shadow-lg">
              <div className="text-4xl font-extrabold text-white mb-1 drop-shadow-xl bg-gradient-to-br from-purple-400 to-white bg-clip-text text-transparent">50K+</div>
              <div className="text-xs text-blue-200/80 font-medium">Bộ thẻ</div>
            </div>
            <div className="text-center bg-white/12 backdrop-blur-sm border border-white/15 rounded-lg p-4 shadow-lg">
              <div className="text-4xl font-extrabold text-white mb-1 drop-shadow-xl bg-gradient-to-br from-pink-400 to-white bg-clip-text text-transparent">1M+</div>
              <div className="text-xs text-blue-200/80 font-medium">Lượt học</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form with Bridge Glow */}
      <div className="w-full lg:w-1/2 flex items-start justify-center p-4 sm:p-8 pt-20 relative">
        {/* Bridge element - Subtle glow from left */}
        <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-32 h-96 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/8 to-transparent blur-3xl"></div>
        </div>
        {/* Mobile background decoration */}
        <div className="absolute inset-0 lg:hidden overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/30 rounded-full blur-3xl"></div>
        </div>

        <div className={`relative w-full max-w-md transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
              <HiBolt className="w-10 h-10 text-blue-400" />
              FlipLab
            </h1>
            <p className="text-lg text-blue-100 font-light">Lật thẻ. Nhớ sâu.</p>
          </div>

          {/* Login Card - Tinted Off-White with Backdrop Blur */}
          <div className="relative bg-gradient-to-b from-slate-50/97 via-white/90 to-slate-100/92 backdrop-blur-2xl rounded-lg p-7 sm:p-8 border-2 border-slate-300/60 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4),0_20px_50px_-10px_rgba(0,0,0,0.2),0_10px_20px_-5px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.8)_inset,0_0_40px_0_rgba(59,130,246,0.08)] mt-12">
            <div className="mb-6">
              <h2 className="text-4xl font-extrabold text-slate-900">
                Đăng nhập
              </h2>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-md mb-4 animate-shake">
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-slate-700 text-sm font-semibold mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  className="w-full px-4 py-2.5 lg:py-2 bg-white border-2 border-slate-200 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 hover:border-slate-300 transition-all"
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-slate-700 text-sm font-semibold">
                    Mật khẩu
                  </label>
                  <Link 
                    to="/forgot-password" 
                    className="text-blue-600 hover:text-blue-700 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="w-full px-4 py-2.5 lg:py-2 pr-12 bg-white border-2 border-slate-200 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 hover:border-slate-300 transition-all [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <HiEyeSlash className="w-5 h-5" />
                    ) : (
                      <HiEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me - Hidden Option */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-slate-600 cursor-pointer">
                  Ghi nhớ đăng nhập
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 lg:py-2.5 bg-blue-600 text-white rounded-md font-semibold hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <HiArrowPath className="animate-spin w-5 h-5" />
                    Đang đăng nhập...
                  </span>
                ) : (
                  'Đăng nhập'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 text-slate-500 text-xs">Hoặc tiếp tục với</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleSocialLogin('Google')}
                className="w-full flex items-center justify-center gap-3 py-2.5 bg-white border-2 border-slate-200 hover:border-blue-500/30 rounded-md transition-all cursor-pointer"
              >
                <FcGoogle className="w-5 h-5" />
                <span className="text-slate-700 font-semibold text-sm">Tiếp tục với Google</span>
              </button>
              
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('Facebook')}
                  className="flex items-center justify-center gap-2 py-2.5 bg-white border-2 border-slate-200 hover:border-slate-300 rounded-md transition-all cursor-pointer"
                >
                  <FaFacebook className="w-4 h-4 text-blue-600" />
                  <span className="text-slate-700 font-medium text-sm">Facebook</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('Apple')}
                  className="flex items-center justify-center gap-2 py-2.5 bg-white border-2 border-slate-200 hover:border-slate-300 rounded-md transition-all cursor-pointer"
                >
                  <FaApple className="w-5 h-5 text-slate-800" />
                  <span className="text-slate-700 font-medium text-sm">Apple</span>
                </button>
              </div>
            </div>


            <div className="mt-5 text-center">
              <p className="text-slate-600 text-sm">
                Chưa có tài khoản?{' '}
                <Link 
                  to="/register" 
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline underline-offset-2 cursor-pointer transition-colors"
                >
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-slate-400 text-xs mt-5">
            © 2026 FlipLab. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
