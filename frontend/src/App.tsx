import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Listings from './pages/Listings';
import Agents from './pages/Agents';
import Conversations from './pages/Conversations';
import { LayoutDashboard, Users, MessageSquare, Building2, Menu } from 'lucide-react';
import { useState } from 'react';

function NavItem({ to, icon: Icon, label }: { to: string, icon: any, label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
        isActive 
          ? 'bg-brand-50 text-brand-700 font-medium' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <Icon size={20} className={isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'} />
      <span>{label}</span>
    </Link>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center gap-2 px-6 h-16 border-b border-slate-100">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">W</div>
          <span className="text-xl font-bold text-slate-900">Wakeeli</span>
        </div>
        
        <nav className="p-4 space-y-1">
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/listings" icon={Building2} label="Listings" />
          <NavItem to="/agents" icon={Users} label="Agents" />
          <NavItem to="/conversations" icon={MessageSquare} label="Conversations" />
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-sm font-medium">A</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700">Admin User</p>
              <p className="text-xs text-slate-500">admin@wakeeli.ai</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between px-4 h-16 bg-white border-b border-slate-200">
          <span className="font-bold text-slate-900">Wakeeli</span>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
            <Menu size={24} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      {/* Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}

function DashboardHome() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium">Total Listings</h3>
            <Building2 className="text-brand-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-slate-900">124</p>
          <span className="text-green-600 text-sm font-medium">+12% from last month</span>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium">Active Conversations</h3>
            <MessageSquare className="text-purple-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-slate-900">8</p>
          <span className="text-slate-400 text-sm">Real-time status</span>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium">Active Agents</h3>
            <Users className="text-gold-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-slate-900">12</p>
          <span className="text-slate-400 text-sm">Across 4 territories</span>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/conversations" element={<Conversations />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
