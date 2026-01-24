import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { HiBolt, HiArrowPath, HiEye, HiEyeSlash, HiFire, HiTrophy, HiPuzzlePiece, HiUserCircle, HiSquares2X2, HiAcademicCap } from 'react-icons/hi2';
import { useToastContext } from '../../contexts/ToastContext';
import { FaGoogle, FaFacebook, FaApple } from 'react-icons/fa';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [leftPanelVisible, setLeftPanelVisible] = useState(false);
  const { register } = useAuth();
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName || formData.username,
      });
      toast.success('Đăng ký thành công! Chào mừng bạn.');
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    toast.info(`Đăng ký với ${provider} đang được phát triển`);
  };

  return (
    <div className="min-h-screen h-screen flex overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900">
      {/* Left Side - Marketing/Promo - STICKY */}
      <div className={`hidden lg:flex lg:w-1/2 sticky top-0 h-screen relative overflow-hidden opacity-90 transition-all duration-700 ${leftPanelVisible ? 'translate-x-0' : '-translate-x-8'}`}>
        {/* Background decoration - More vibrant */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Content with stagger animation */}
        <div className="relative z-10 flex flex-col px-16 pt-20 pb-12">
          {/* Logo */}
          <div className={`mb-3 transition-all duration-700 delay-100 ${leftPanelVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.12),0_0_0_1px_rgba(255,255,255,0.1)_inset]">
                <HiBolt className="w-8 h-8 text-white drop-shadow-lg" />
              </div>
              <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">FlipLab</h1>
            </div>
            <p className="text-lg text-blue-200/70 font-light">Bắt đầu hành trình học tập</p>
          </div>

          {/* Features Container - Grouped for visual weight */}
          <div className={`mb-6 bg-white/8 backdrop-blur-md border border-white/12 rounded-2xl p-6 transition-all duration-700 delay-200 ${leftPanelVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
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
                    <div className={`w-10 h-10 ${feature.color} backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
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
            <div className="text-center bg-white/12 backdrop-blur-sm border border-white/15 rounded-xl p-4 shadow-lg">
              <div className="text-4xl font-extrabold text-white mb-1 drop-shadow-xl bg-gradient-to-br from-blue-400 to-white bg-clip-text text-transparent">10K+</div>
              <div className="text-xs text-blue-200/80 font-medium">Người dùng</div>
            </div>
            <div className="text-center bg-white/12 backdrop-blur-sm border border-white/15 rounded-xl p-4 shadow-lg">
              <div className="text-4xl font-extrabold text-white mb-1 drop-shadow-xl bg-gradient-to-br from-purple-400 to-white bg-clip-text text-transparent">50K+</div>
              <div className="text-xs text-blue-200/80 font-medium">Bộ thẻ</div>
            </div>
            <div className="text-center bg-white/12 backdrop-blur-sm border border-white/15 rounded-xl p-4 shadow-lg">
              <div className="text-4xl font-extrabold text-white mb-1 drop-shadow-xl bg-gradient-to-br from-pink-400 to-white bg-clip-text text-transparent">1M+</div>
              <div className="text-xs text-blue-200/80 font-medium">Lượt học</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form - SCROLLABLE */}
      <div className="w-full lg:w-1/2 h-screen overflow-y-auto relative">
        {/* Bridge element - Subtle glow from left */}
        <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-32 h-96 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/8 to-transparent blur-3xl"></div>
        </div>
        {/* Mobile background decoration */}
        <div className="absolute inset-0 lg:hidden overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/30 rounded-full blur-3xl"></div>
        </div>

        {/* Centered Container - Match left panel padding */}
        <div className="flex items-center justify-center min-h-full px-16 py-8">
          <div className={`relative w-full max-w-2xl transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-6">
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
              <HiBolt className="w-10 h-10 text-blue-400" />
              FlipLab
            </h1>
            <p className="text-lg text-blue-100 font-light">Lật thẻ. Nhớ sâu.</p>
          </div>

          {/* Register Card - Premium Design */}
          <div className="relative bg-gradient-to-b from-slate-50/97 via-white/90 to-slate-100/92 backdrop-blur-2xl rounded-2xl p-6 sm:p-7 border-2 border-slate-300/60 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4),0_20px_50px_-10px_rgba(0,0,0,0.2),0_10px_20px_-5px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.8)_inset,0_0_40px_0_rgba(59,130,246,0.08)] mt-12">
            <div className="mb-5">
              <h2 className="text-4xl font-extrabold text-slate-900">
                Đăng ký
              </h2>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-4">
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-slate-700 text-sm font-semibold mb-1.5">
                  Tên hiển thị
                </label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 lg:py-2 bg-white border-2 border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 hover:border-slate-300 transition-all"
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div>
                <label className="block text-slate-700 text-sm font-semibold mb-1.5">
                  Tên đăng nhập <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 lg:py-2 bg-white border-2 border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 hover:border-slate-300 transition-all"
                  placeholder="username"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 text-sm font-semibold mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 lg:py-2 bg-white border-2 border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 hover:border-slate-300 transition-all"
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 text-sm font-semibold mb-1.5">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 lg:py-2 pr-12 bg-white border-2 border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 hover:border-slate-300 transition-all"
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

              <div>
                <label className="block text-slate-700 text-sm font-semibold mb-1.5">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 lg:py-2 pr-12 bg-white border-2 border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 hover:border-slate-300 transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <HiEyeSlash className="w-5 h-5" />
                    ) : (
                      <HiEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 lg:py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <HiArrowPath className="animate-spin w-5 h-5" />
                    Đang đăng ký...
                  </span>
                ) : (
                  'Đăng ký'
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
                className="w-full flex items-center justify-center gap-3 py-2.5 bg-white border-2 border-slate-200 hover:border-blue-500/30 rounded-lg transition-all cursor-pointer"
              >
                <FaGoogle className="w-4 h-4 text-red-500" />
                <span className="text-slate-700 font-semibold text-sm">Tiếp tục với Google</span>
              </button>
              
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('Facebook')}
                  className="flex items-center justify-center gap-2 py-2.5 bg-white border-2 border-slate-200 hover:border-slate-300 rounded-lg transition-all cursor-pointer"
                >
                  <FaFacebook className="w-4 h-4 text-blue-600" />
                  <span className="text-slate-700 font-medium text-sm">Facebook</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('Apple')}
                  className="flex items-center justify-center gap-2 py-2.5 bg-white border-2 border-slate-200 hover:border-slate-300 rounded-lg transition-all cursor-pointer"
                >
                  <FaApple className="w-5 h-5 text-slate-800" />
                  <span className="text-slate-700 font-medium text-sm">Apple</span>
                </button>
              </div>
            </div>

            <div className="mt-5 text-center">
              <p className="text-slate-600 text-sm">
                Đã có tài khoản?{' '}
                <Link 
                  to="/login" 
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline underline-offset-2 cursor-pointer transition-colors"
                >
                  Đăng nhập
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
    </div>
  );
};

export default Register;
