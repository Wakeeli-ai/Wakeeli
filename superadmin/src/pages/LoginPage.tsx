import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    setTimeout(() => {
      if (username === 'Fox' && password === 'WakeeliAdmin2026') {
        localStorage.setItem('superadmin_authenticated', 'true')
        navigate('/companies')
      } else {
        setError('Invalid credentials.')
        setLoading(false)
      }
    }, 600)
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0f1729' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12" style={{ background: 'linear-gradient(135deg, #0f1729 0%, #1e3a8a 100%)' }}>
        <div className="flex items-center gap-3">
          <img src="/logo-icon.png" alt="Wakeeli" className="w-12 h-12" />
          <div>
            <p className="text-white font-bold text-lg tracking-widest uppercase">Wakeeli</p>
            <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>Platform Administration</p>
          </div>
        </div>

        <div>
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { label: 'Active Companies', value: '9' },
              { label: 'Total Leads', value: '1,534' },
              { label: 'Monthly Revenue', value: '$8,995' },
              { label: 'Conversations', value: '6,760' },
            ].map(stat => (
              <div key={stat.label} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Wakeeli Owner Portal. Restricted access.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(37,99,235,0.25)', border: '1px solid rgba(37,99,235,0.4)' }}>
              <Shield size={28} style={{ color: '#60a5fa' }} />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-1">Owner Access</h1>
          <p className="text-center text-sm mb-8" style={{ color: 'rgba(255,255,255,0.45)' }}>Wakeeli Super Admin Portal</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', caretColor: '#60a5fa' }}
                onFocus={e => (e.target.style.borderColor = 'rgba(96,165,250,0.6)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
                placeholder="Fox"
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-11 rounded-xl text-white text-sm outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', caretColor: '#60a5fa' }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(96,165,250,0.6)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg px-4 py-2.5 text-sm" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all mt-2"
              style={{ background: loading ? 'rgba(37,99,235,0.5)' : '#2563eb', opacity: (!username || !password) ? 0.5 : 1 }}
            >
              {loading ? 'Verifying...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
