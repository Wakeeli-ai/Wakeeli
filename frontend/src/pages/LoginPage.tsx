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
      setError('Please enter your username and password');
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-3">
      <div className="w-full max-w-5xl flex rounded-2xl overflow-hidden shadow-xl" style={{ minHeight: '600px' }}>

        {/* Left: Hero Photo Panel */}
        <div className="hidden md:flex md:w-1/2 flex-col relative overflow-hidden rounded-l-2xl">
          {/* Login label top-left */}
          <div className="absolute top-4 left-4 z-10">
            <span className="text-white text-xs font-medium bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
              Login
            </span>
          </div>

          {/* Hero image */}
          <img
            src="/login-hero.jpg"
            alt="Luxury property"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right: Login Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-white px-10 py-12 rounded-r-2xl md:rounded-l-none rounded-l-2xl">
          <div className="w-full max-w-sm">

            {/* Header: "Welcome to" + wordmark logo inline */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-brand-600 text-xl font-semibold">Welcome to</span>
                <img
                  src="/logo-wordmark.png"
                  alt="Wakeeli"
                  className="h-8 object-contain"
                />
              </div>
              <p className="text-slate-500 text-sm">
                Sign in to access your real estate dashboard
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Address */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  autoComplete="username"
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
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
