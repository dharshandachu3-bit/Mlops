import React, { useState } from 'react';
import {
  Search,
  Bell,
  HelpCircle,
  User as UserIcon,
  LogOut,
  LogIn,
  Database,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface NavbarProps {
  onOpenHelp: () => void;
  dateRange: string;
  setDateRange: (range: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenHelp, dateRange, setDateRange }) => {
  const { userProfile, currentUser, role, setRole, signIn, signOut, firestoreOnline } = useAuth();
  const { appMode, isSampleMode, setIsSampleMode, searchFilter, setSearchFilter, auditLogs } = useData();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const unreadAlerts = auditLogs.slice(0, 3);

  return (
    <header className="h-16 border-b border-cyan-500/20 bg-[#0B1020]/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6">
      {/* Search Bar matching screenshot */}
      <div className="flex-1 max-w-xl relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search datasets, pipelines, models, or anything..."
            className="w-full bg-[#11182B]/90 border border-slate-700/60 focus:border-cyan-400 text-sm text-slate-200 pl-10 pr-16 py-2 rounded-lg outline-none transition-all placeholder:text-slate-500 focus:shadow-[0_0_15px_rgba(0,245,255,0.15)]"
          />
          <kbd className="absolute right-3 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800/80 border border-slate-700 rounded shadow-sm">
            Ctrl + K
          </kbd>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Sample Data Mode Toggle */}
        <button
          onClick={() => setIsSampleMode(!isSampleMode)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-all ${
            isSampleMode
              ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400 shadow-[0_0_12px_rgba(0,245,255,0.2)]'
              : 'bg-purple-500/10 border-purple-500/40 text-purple-300'
          }`}
          title="Toggle between Sample Dataset and Custom Uploads"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>{isSampleMode ? 'Sample Data Mode' : 'Live Dataset Mode'}</span>
        </button>

        {/* Date Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#11182B] border border-slate-700/80 hover:border-slate-600 text-xs text-slate-300 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{dateRange}</span>
          </button>

          {showDatePicker && (
            <div className="absolute right-0 mt-2 w-40 bg-[#11182B] border border-slate-700 rounded-lg shadow-2xl py-1 z-50 text-xs">
              {['Last 7 days', 'Last 30 days', 'Last 90 days', 'All Time'].map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setDateRange(option);
                    setShowDatePicker(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-cyan-500/10 hover:text-cyan-300 transition-colors ${
                    dateRange === option ? 'text-cyan-400 font-semibold' : 'text-slate-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Icon */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg bg-[#11182B] border border-slate-700/70 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-400 transition-all"
            title="System Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-magenta-500 bg-[#FF36C7] text-[10px] font-bold text-white flex items-center justify-center shadow-[0_0_8px_#FF36C7]">
              {unreadAlerts.length}
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#11182B] border border-cyan-500/30 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                <span className="text-xs font-semibold text-slate-200">System Notifications</span>
                <span className="text-[10px] text-cyan-400">Live Audit Sync</span>
              </div>
              <div className="space-y-2">
                {unreadAlerts.map((log) => (
                  <div key={log.id} className="p-2 rounded bg-slate-900/60 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                      <span className="font-semibold text-cyan-400">{log.action}</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-tight">{log.details}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Help & Documentation */}
        <button
          onClick={onOpenHelp}
          className="p-2 rounded-lg bg-[#11182B] border border-slate-700/70 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-400 transition-all"
          title="Help & Academic Documentation"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* User Profile matching screenshot */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-lg bg-[#11182B] border border-slate-700/80 hover:border-cyan-500/50 transition-all group"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-cyan-500/30">
              {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'D'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
                {userProfile?.displayName || 'Dharshan'}
              </p>
              <p className="text-[10px] text-slate-400">
                {userProfile?.role || 'Student'}
              </p>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-[#11182B] border border-cyan-500/30 rounded-xl shadow-2xl p-3 z-50">
              <div className="pb-3 border-b border-slate-800 mb-3">
                <p className="text-xs font-bold text-white">{userProfile?.displayName || 'Dharshan'}</p>
                <p className="text-[11px] text-slate-400">{userProfile?.email || 'dharshandachu3@gmail.com'}</p>
                <div className="mt-2 flex items-center gap-1.5 text-[10px]">
                  <span className={`w-2 h-2 rounded-full ${firestoreOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <span className="text-slate-300">
                    {currentUser ? 'Firebase Auth (Google)' : 'Local Demo Session'}
                  </span>
                </div>
              </div>

              {/* Role Switcher for RBAC exploration */}
              <div className="mb-3">
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                  Active Persona / Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded px-2 py-1 outline-none focus:border-cyan-400"
                >
                  <option value="Administrator">Administrator (Superuser)</option>
                  <option value="Data Engineer">Data Engineer (ETL/Pipelines)</option>
                  <option value="Researcher">Researcher (Analytics/ML)</option>
                  <option value="Viewer">Viewer (Read-only)</option>
                </select>
              </div>

              {/* Sign in with Google / Sign out */}
              {currentUser ? (
                <button
                  onClick={() => {
                    signOut();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    signIn();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition-colors shadow-[0_0_10px_rgba(0,245,255,0.2)]"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In with Google</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
