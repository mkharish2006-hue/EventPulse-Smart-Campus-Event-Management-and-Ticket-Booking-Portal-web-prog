import React from 'react';
import { UserProfile } from '../types';
import { Ticket, Shield, Briefcase, GraduationCap, Code2, BookOpen, LogIn, LogOut } from 'lucide-react';

interface NavbarProps {
  activeTab: 'events' | 'my-bookings' | 'admin' | 'faculty' | 'api-lab' | 'viva-report';
  setActiveTab: (tab: 'events' | 'my-bookings' | 'admin' | 'faculty' | 'api-lab' | 'viva-report') => void;
  currentUser: UserProfile;
  onOpenAuthModal: () => void;
  onSignOut: () => void;
  bookingsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuthModal,
  onSignOut,
  bookingsCount,
}) => {
  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          bg: 'bg-amber-600',
          textColor: 'text-amber-400',
          label: 'Admin',
          icon: Shield,
        };
      case 'faculty':
        return {
          bg: 'bg-cyan-600',
          textColor: 'text-cyan-400',
          label: 'Faculty',
          icon: Briefcase,
        };
      default:
        return {
          bg: 'bg-indigo-600',
          textColor: 'text-indigo-400',
          label: 'Student',
          icon: GraduationCap,
        };
    }
  };

  const roleStyle = getRoleBadgeStyle(currentUser.role);
  const RoleIcon = roleStyle.icon;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 px-4 sm:px-6 lg:px-8 h-16">
        
        {/* Zone 1: Brand Wordmark (Single text element in display face) */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => setActiveTab('events')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 group-hover:bg-indigo-500 transition-colors">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white font-['Plus_Jakarta_Sans'] whitespace-nowrap">
                EventPulse
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-slate-400 font-mono">
                v2.6·REC IT
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Single-line, unboxed, clean typography) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('events')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
              activeTab === 'events'
                ? 'text-white border-b-2 border-indigo-500 font-semibold'
                : 'hover:text-white text-slate-300'
            }`}
          >
            Campus Events
          </button>

          <button
            onClick={() => setActiveTab('my-bookings')}
            className={`whitespace-nowrap transition-colors py-1 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'my-bookings'
                ? 'text-white border-b-2 border-indigo-500 font-semibold'
                : 'hover:text-white text-slate-300'
            }`}
          >
            My Bookings
            {bookingsCount > 0 && (
              <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-950/80 px-1.5 py-0.2 rounded border border-indigo-800/60 tabular-nums">
                {bookingsCount}
              </span>
            )}
          </button>

          {/* Admin Specific Console Tab */}
          {currentUser.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`whitespace-nowrap transition-colors py-1 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'admin'
                  ? 'text-white border-b-2 border-amber-500 font-semibold'
                  : 'hover:text-white text-slate-300'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Console</span>
            </button>
          )}

          {/* Faculty Specific Portal Tab */}
          {currentUser.role === 'faculty' && (
            <button
              onClick={() => setActiveTab('faculty')}
              className={`whitespace-nowrap transition-colors py-1 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'faculty'
                  ? 'text-white border-b-2 border-cyan-500 font-semibold'
                  : 'hover:text-white text-slate-300'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
              <span>Faculty Portal</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('api-lab')}
            className={`whitespace-nowrap transition-colors py-1 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'api-lab'
                ? 'text-white border-b-2 border-indigo-500 font-semibold'
                : 'hover:text-white text-slate-300'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            PHP & API Lab
          </button>

          <button
            onClick={() => setActiveTab('viva-report')}
            className={`whitespace-nowrap transition-colors py-1 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'viva-report'
                ? 'text-white border-b-2 border-indigo-500 font-semibold'
                : 'hover:text-white text-slate-300'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            Viva & Report
          </button>
        </nav>

        {/* Zone 3: Active User & Authentication Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          
          {/* Active User Card with Switch / Sign In button */}
          <div className="flex items-center gap-2 p-1 pl-2.5 rounded-lg border border-slate-800 bg-slate-900/90 text-xs">
            <div className={`w-6 h-6 rounded flex items-center justify-center text-white ${roleStyle.bg} shrink-0`}>
              <RoleIcon className="w-3.5 h-3.5" />
            </div>
            
            <div className="hidden sm:block leading-tight text-left mr-1">
              <div className="font-semibold text-slate-200 truncate max-w-[110px]">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {roleStyle.label} · @{currentUser.username}
              </div>
            </div>

            <button
              onClick={onOpenAuthModal}
              title="Switch user account or sign in"
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-750 text-indigo-400 hover:text-indigo-300 text-[11px] font-mono transition-colors cursor-pointer whitespace-nowrap"
            >
              Switch / Sign In
            </button>
          </div>

          <button
            onClick={onSignOut}
            title="Sign out of current account"
            className="p-2 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>

        </div>
      </div>

      {/* Mobile Secondary Navigation Row */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 bg-slate-950/95 px-2 py-2 text-xs">
        <button
          onClick={() => setActiveTab('events')}
          className={`px-2 py-1 rounded transition-colors ${
            activeTab === 'events' ? 'text-indigo-400 font-bold' : 'text-slate-400'
          }`}
        >
          Events
        </button>
        <button
          onClick={() => setActiveTab('my-bookings')}
          className={`px-2 py-1 rounded transition-colors ${
            activeTab === 'my-bookings' ? 'text-indigo-400 font-bold' : 'text-slate-400'
          }`}
        >
          Bookings ({bookingsCount})
        </button>
        {currentUser.role === 'admin' && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-2 py-1 rounded transition-colors ${
              activeTab === 'admin' ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            Admin
          </button>
        )}
        {currentUser.role === 'faculty' && (
          <button
            onClick={() => setActiveTab('faculty')}
            className={`px-2 py-1 rounded transition-colors ${
              activeTab === 'faculty' ? 'text-cyan-400 font-bold' : 'text-slate-400'
            }`}
          >
            Faculty
          </button>
        )}
        <button
          onClick={() => setActiveTab('api-lab')}
          className={`px-2 py-1 rounded transition-colors ${
            activeTab === 'api-lab' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          PHP Lab
        </button>
        <button
          onClick={() => setActiveTab('viva-report')}
          className={`px-2 py-1 rounded transition-colors ${
            activeTab === 'viva-report' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          Viva Prep
        </button>
      </div>
    </header>
  );
};
