import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';
import { useRole, AuthUser } from '../context/RoleContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useRole();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password');
      setLoading(false);
      return;
    }

    try {
      const response = await login(email, password);
      const { access_token, user } = response.data;

      localStorage.setItem('token', access_token);
      localStorage.setItem('wakeeli_authenticated', '1');
      if (remember) localStorage.setItem('wakeeli_remember', '1');

      const authUser: AuthUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        name: user.username,
        label: user.role === 'admin' ? 'Admin' : 'Agent',
      };
      setUser(authUser);

      navigate('/', { replace: true });
    } catch (err: any) {
      const message =
        err.response?.data?.detail || 'Sign in failed. Please check your credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Hero Panel */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden flex-col items-center justify-center bg-slate-900">
        {/* Subtle property grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Gradient orbs for depth */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-600 rounded-full opacity-10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-brand-400 rounded-full opacity-10 blur-3xl" />

        {/* Content */}
        <div className="relative z-10 text-center px-12">
          {/* Logo mark */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 22V12h6v10"
                />
              </svg>
            </div>
            <span className="text-white text-4xl font-bold tracking-tight">Wakeeli</span>
          </div>

          <p className="text-slate-300 text-lg font-light leading-relaxed max-w-xs mx-auto">
            AI-Powered Real Estate Lead Conversion
          </p>

          {/* Decorative divider */}
          <div className="mt-10 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-slate-600" />
            <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
            <div className="h-px w-12 bg-slate-600" />
          </div>

          {/* Feature hints */}
          <div className="mt-10 space-y-4 text-left">
            {[
              'Smart lead scoring & prioritization',
              'Automated follow-up sequences',
              'Real-time pipeline analytics',
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-brand-600/30 border border-brand-500/40 flex items-center justify-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                </div>
                <span className="text-slate-400 text-sm">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="mb-8">
            <p className="text-slate-500 text-base mb-1">Welcome to</p>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Wakeeli</h1>
            <p className="text-slate-500 text-sm">
              Sign in to access your real estate dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              />
            </div>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
                <span className="text-sm text-slate-600">Remember me</span>
              </label>
              <a
                href="#"
                className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
              >
                Forgot Password?
              </a>
            </div>

            {/* Error */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-semibold text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <span className="text-slate-500 font-medium">Contact your admin</span>
          </p>
        </div>
      </div>
    </div>
  );
}
