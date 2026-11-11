import React from 'react';
import { ShieldCheck, UserPlus, Search, LogIn, LayoutDashboard, LogOut } from 'lucide-react';

export default function Navbar({ currentView, setCurrentView, admin, onLogout }) {
  return (
    <nav className="bg-emerald-900 text-white shadow-md sticky top-0 z-40 border-b border-emerald-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setCurrentView('register')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition-transform">
              🌿
            </div>
            <div>
              <div className="font-extrabold text-base sm:text-lg leading-tight tracking-tight text-white flex items-center gap-2">
                Mumbai Vidi Tambakhu Sangh
                <span className="hidden md:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-200 border border-emerald-700">
                  Govt Reg.
                </span>
              </div>
              <div className="text-xs text-emerald-200/80 font-medium font-devanagari">
                मुंबई विडी तंबाखू संघ
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setCurrentView('register')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                currentView === 'register'
                  ? 'bg-amber-500 text-slate-900 shadow-sm'
                  : 'text-emerald-100 hover:bg-emerald-800/70'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Join Union</span>
            </button>

            <button
              onClick={() => setCurrentView('track')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                currentView === 'track'
                  ? 'bg-amber-500 text-slate-900 shadow-sm'
                  : 'text-emerald-100 hover:bg-emerald-800/70'
              }`}
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Track Status</span>
            </button>

            {admin ? (
              <div className="flex items-center gap-2 pl-2 border-l border-emerald-700/60">
                <button
                  onClick={() => setCurrentView('admin')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-colors ${
                    currentView === 'admin'
                      ? 'bg-white text-emerald-950 shadow-sm'
                      : 'bg-emerald-800 text-white hover:bg-emerald-700'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Admin Panel</span>
                </button>

                <button
                  onClick={onLogout}
                  title="Logout"
                  className="p-1.5 rounded-lg text-emerald-300 hover:bg-emerald-800 hover:text-white transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCurrentView('login')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 border border-emerald-700/80 transition-colors ${
                  currentView === 'login'
                    ? 'bg-emerald-800 text-white'
                    : 'text-emerald-200 hover:bg-emerald-800/50 hover:text-white'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Admin Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
