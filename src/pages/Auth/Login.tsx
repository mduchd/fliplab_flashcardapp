import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Zap, Loader2 } from 'lucide-react';
import { useToastContext } from '../../contexts/ToastContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToastContext();

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
      // Optional: toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2 tracking-tight flex items-center justify-center gap-3">
            <Zap size={48} className="text-purple-400" fill="currentColor" />
            FlipLab
          </h1>
          <p className="text-xl text-purple-200 font-light">Lật thẻ. Nhớ sâu.</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            Đăng nhập
          </h2>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-purple-200 text-sm mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="email@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-purple-200 text-sm mb-2">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={20} />
                  Đang đăng nhập...
                </span>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-purple-200">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-2">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-purple-300/60 text-sm mt-6">
          © 2026 FlipLab. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
