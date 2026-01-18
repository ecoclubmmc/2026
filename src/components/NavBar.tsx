import { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Settings, LogOut, Menu, X } from 'lucide-react';
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
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-200">
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

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 p-6 flex flex-col gap-4 md:hidden animate-in slide-in-from-top-4 duration-200 shadow-2xl">
          <Link to="/" onClick={() => setIsMenuOpen(false)} className={`text-lg font-medium ${location.pathname === '/' ? 'text-emerald-400' : 'text-slate-300'}`}>Home</Link>
          <Link to="/about" onClick={() => setIsMenuOpen(false)} className={`text-lg font-medium ${location.pathname === '/about' ? 'text-emerald-400' : 'text-slate-300'}`}>About</Link>
          <Link to="/events" onClick={() => setIsMenuOpen(false)} className={`text-lg font-medium ${location.pathname === '/events' ? 'text-emerald-400' : 'text-slate-300'}`}>Events</Link>
          <Link to="/campus-activities" onClick={() => setIsMenuOpen(false)} className={`text-lg font-medium ${location.pathname === '/campus-activities' ? 'text-emerald-400' : 'text-slate-300'}`}>Campus Activities</Link>
          <Link to="/field-visits" onClick={() => setIsMenuOpen(false)} className={`text-lg font-medium ${location.pathname === '/field-visits' ? 'text-emerald-400' : 'text-slate-300'}`}>Field Visits</Link>
          
          <div className="h-px bg-white/10 my-2" />
          
          {user ? (
            <div className="flex flex-col gap-4">
               <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 text-white">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-sm font-bold text-emerald-400">
                    {user.name[0]}
                  </div>
                  <span>{user.name}</span>
               </Link>
               {user.role === 'admin' && (
                 <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 text-slate-300">
                   <Settings className="w-5 h-5" /> Admin Dashboard
                 </Link>
               )}
               <button onClick={() => { logout(); setIsMenuOpen(false); }} className="flex items-center gap-2 text-red-400">
                 <LogOut className="w-5 h-5" /> Logout
               </button>
            </div>
          ) : (
            <Link to="/login" onClick={() => setIsMenuOpen(false)} className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-bold text-center">
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
