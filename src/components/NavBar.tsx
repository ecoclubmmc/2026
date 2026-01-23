import { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Settings, LogOut, Menu, X, Home, Info, Calendar, MapPin, Trees } from 'lucide-react';
import { DataContext } from '../context/DataContext';

export default function NavBar() {
  const { user, logout } = useContext(DataContext);
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center bg-black/60 backdrop-blur-md border-b border-white/10 shadow-sm transition-all">
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-10 h-10 rounded-full overflow-hidden shadow-lg group-hover:shadow-emerald-500/30 transition-all duration-300 transform group-hover:scale-105 bg-white p-0.5">
          <img src={`${import.meta.env.BASE_URL}logo.jpg`} alt="Logo" className="w-full h-full object-contain" />
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-emerald-400 to-emerald-200">
          MMC Eco Club
        </span>
      </Link>

      <div className="flex items-center gap-6">
        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-6 text-slate-300 font-medium">
          <Link to="/" className={`hover:text-emerald-400 transition-colors ${location.pathname === '/' ? 'text-emerald-400' : ''}`}>Home</Link>
          <Link to="/about" className={`hover:text-emerald-400 transition-colors ${location.pathname === '/about' ? 'text-emerald-400' : ''}`}>About</Link>
          <Link to="/events" className={`hover:text-emerald-400 transition-colors ${location.pathname === '/events' ? 'text-emerald-400' : ''}`}>Events</Link>
          <Link to="/campus-activities" className={`hover:text-emerald-400 transition-colors ${location.pathname === '/campus-activities' ? 'text-emerald-400' : ''}`}>Campus Activities</Link>
          <Link to="/field-visits" className={`hover:text-emerald-400 transition-colors ${location.pathname === '/field-visits' ? 'text-emerald-400' : ''}`}>Field Visits</Link>
        </div>

        {/* User Controls (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link to="/profile">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10 hover:border-emerald-500/30">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-400 border border-emerald-500/30">
                    {user.name[0]}
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{user.name}</span>
                </div>
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="p-2 text-slate-400 hover:text-emerald-400 transition-colors" title="Admin Dashboard">
                  <Settings className="w-5 h-5" />
                </Link>
              )}
              <button onClick={logout} className="p-2 text-slate-400 hover:text-red-400 transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <Link to="/login" className="px-5 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/30 transition-all transform hover:-translate-y-0.5">
              Sign In
            </Link>
          )}
        </div>

      </div>

      {/* Mobile Menu Actions */}
      <div className="flex md:hidden items-center">
        <button
          className="md:hidden text-white p-2 rounded-lg active:bg-white/10"
          onClick={() => setIsMenuOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Mobile Menu Drawer */}
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-50 bg-gradient-to-br from-black/80 via-black/70 to-slate-900/80 backdrop-blur-md md:hidden animate-in fade-in duration-300"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Drawer */}
            <div className="fixed inset-y-0 right-0 z-50 h-screen w-[85%] max-w-sm bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-l border-emerald-500/20 shadow-2xl shadow-emerald-500/10 flex flex-col animate-in slide-in-from-right duration-300">

              {/* Drawer Header with Gradient */}
              <div className="relative px-6 py-5 border-b border-white/10">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent" />
                <div className="relative flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                      <Menu className="w-5 h-5 text-emerald-400" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-200 bg-clip-text text-transparent">Navigation</span>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2.5 text-slate-400 hover:text-white bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-200 hover:scale-105 active:scale-95 border border-white/10"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Links with Icons */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5">
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className={`group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${location.pathname === '/'
                    ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/5 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10'
                    }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${location.pathname === '/' ? 'bg-emerald-500/20' : 'bg-white/5 group-hover:bg-white/10'
                    }`}>
                    <Home className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-base">Home</span>
                </Link>

                <Link
                  to="/about"
                  onClick={() => setIsMenuOpen(false)}
                  className={`group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${location.pathname === '/about'
                    ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/5 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10'
                    }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${location.pathname === '/about' ? 'bg-emerald-500/20' : 'bg-white/5 group-hover:bg-white/10'
                    }`}>
                    <Info className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-base">About Us</span>
                </Link>

                <Link
                  to="/events"
                  onClick={() => setIsMenuOpen(false)}
                  className={`group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${location.pathname === '/events'
                    ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/5 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10'
                    }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${location.pathname === '/events' ? 'bg-emerald-500/20' : 'bg-white/5 group-hover:bg-white/10'
                    }`}>
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-base">Events</span>
                </Link>

                <Link
                  to="/campus-activities"
                  onClick={() => setIsMenuOpen(false)}
                  className={`group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${location.pathname === '/campus-activities'
                    ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/5 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10'
                    }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${location.pathname === '/campus-activities' ? 'bg-emerald-500/20' : 'bg-white/5 group-hover:bg-white/10'
                    }`}>
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-base">Campus Activities</span>
                </Link>

                <Link
                  to="/field-visits"
                  onClick={() => setIsMenuOpen(false)}
                  className={`group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${location.pathname === '/field-visits'
                    ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/5 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10'
                    }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${location.pathname === '/field-visits' ? 'bg-emerald-500/20' : 'bg-white/5 group-hover:bg-white/10'
                    }`}>
                    <Trees className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-base">Field Visits</span>
                </Link>
              </div>

              {/* Footer / User Controls with better styling */}
              <div className="p-4 pt-2 border-t border-white/10 bg-gradient-to-t from-black/20 to-transparent space-y-3">
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 hover:border-emerald-500/30 hover:bg-white/10 transition-all duration-200 group"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-500/10 flex items-center justify-center text-xl font-bold text-emerald-400 shrink-0 border-2 border-emerald-500/30 group-hover:scale-105 transition-transform">
                        {user.name[0]}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-bold text-white truncate group-hover:text-emerald-400 transition-colors">{user.name}</p>
                        <p className="text-xs text-slate-400">View Profile</p>
                      </div>
                      <div className="text-slate-500 group-hover:text-emerald-400 transition-colors">→</div>
                    </Link>

                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-purple-500/5 text-purple-400 font-bold border border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-500/20 transition-all duration-200 shadow-lg shadow-purple-900/10"
                      >
                        <Settings className="w-4 h-4" /> Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={() => { logout(); setIsMenuOpen(false); }}
                      className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-red-500/10 to-red-500/5 text-red-400 font-bold border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/20 transition-all duration-200 shadow-lg shadow-red-900/10"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-center shadow-lg shadow-emerald-900/30 hover:shadow-emerald-500/40 hover:from-emerald-500 hover:to-emerald-400 active:scale-95 transition-all duration-200 border border-emerald-400/30"
                  >
                    Sign In to Continue
                  </Link>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
