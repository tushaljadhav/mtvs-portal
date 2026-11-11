import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Share2, 
  Megaphone, 
  MapPin, 
  KeyRound, 
  LogOut,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { clearToken } from '../api';

export default function AdminNavbar({ admin, onLogout, pendingCount = 0 }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    clearToken();
    if (onLogout) onLogout();
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/members', label: 'Members Directory', icon: Users },
    { to: '/admin/requests', label: 'Joining Requests', icon: FileText, badge: pendingCount },
    { to: '/admin/invite', label: 'Generate Link', icon: Share2, highlight: true },
    { to: '/admin/ads', label: 'Advertisement Master', icon: Megaphone },
    { to: '/admin/areas', label: 'Area Masters', icon: MapPin },
    { to: '/admin/settings', label: 'Security', icon: KeyRound },
  ];

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-40 border-b border-slate-800">
      {/* Top Admin Status Bar */}
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Admin Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/admin/dashboard" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-lg sm:text-xl shadow-md flex-shrink-0">
                🌿
              </div>
              <div className="min-w-0">
                <div className="font-extrabold text-sm sm:text-base leading-tight tracking-tight text-white flex items-center gap-2 truncate">
                  <span className="truncate">MTVS Admin Portal</span>
                  <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 flex-shrink-0">
                    Control Panel
                  </span>
                </div>
                <div className="text-[11px] sm:text-xs text-slate-400 font-medium truncate">
                  मुंबई विडी तंबाखू संघ – प्रशासन कक्ष
                </div>
              </div>
            </Link>
          </div>

          {/* Admin User Info & Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <div className="text-xs font-bold text-slate-200">{admin?.name || 'Admin'}</div>
              <div className="text-[11px] text-emerald-400 font-medium">
                {admin?.region ? `Region: ${admin.region}` : 'Super Admin (All Mumbai)'}
              </div>
            </div>

            <Link
              to="/admin/invite"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp Invite Link</span>
            </Link>

            <button
              onClick={handleLogoutClick}
              title="Sign Out"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="bg-slate-950/80 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none">
        <div className="max-w-[1700px] mx-auto flex gap-1 sm:gap-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-emerald-400 text-emerald-300 bg-slate-900/60'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                } ${item.highlight ? 'text-amber-300' : ''}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : item.highlight ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
