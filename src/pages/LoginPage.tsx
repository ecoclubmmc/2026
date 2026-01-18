import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowRight } from 'lucide-react';
import { DataContext } from '../context/DataContext';
import { DefaultAvatars } from '../types';
import DatabaseSetup from '../components/DatabaseSetup';

export default function LoginPage() {
  const { login, signup } = useContext(DataContext);
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [batch, setBatch] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('eco1');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validate batch for signup
    if (!isLogin && !/^\d{4}$/.test(batch)) {
      setError("Batch must be a 4-digit year (e.g., 2022)");
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, name, batch, selectedAvatar);
      }
      navigate('/profile');
    } catch (err: any) {
      setError(err.message || "Authentication failed");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent p-6 relative overflow-hidden">
      <div className="w-full max-w-md bg-black/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/10 p-8 md:p-10 relative z-10 transition-all">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 text-emerald-400 text-xs font-bold mb-6 border border-white/10">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             MEMBER LOGIN
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">{isLogin ? "Welcome Back" : "Join the Club"}</h2>
          <p className="text-slate-400">{isLogin ? "Sign in to access your dashboard" : "Start your eco journey today"}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/30 text-white focus:border-emerald-500 focus:bg-black/50 transition-all outline-none" 
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Batch Year</label>
                <input 
                  type="text" 
                  required
                  pattern="[0-9]{4}"
                  placeholder="202X"
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  maxLength={4}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/30 text-white focus:border-emerald-500 focus:bg-black/50 transition-all outline-none" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Select Avatar</label>
                <div className="grid grid-cols-3 gap-3">
                  {DefaultAvatars.map((avatar) => (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setSelectedAvatar(avatar.id)}
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                        selectedAvatar === avatar.id
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-white/5 bg-black/20 hover:border-white/20'
                      }`}
                    >
                      <div className="text-2xl">{avatar.emoji}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{avatar.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/30 text-white focus:border-emerald-500 focus:bg-black/50 transition-all outline-none" 
              placeholder="name@example.com"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/30 text-white focus:border-emerald-500 focus:bg-black/50 transition-all outline-none" 
              placeholder="••••••••"
            />
          </div>
          
          {error && (
             <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> {error}
             </div>
          )}

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20 flex justify-center items-center gap-2 group border border-emerald-500/50"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
               <>
                 {isLogin ? "Sign In" : "Create Account"} 
                 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </>
            )}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-white/10 text-center">
           <p className="text-slate-400 text-sm mb-3">{isLogin ? "New user?" : "Already a member?"}</p>
           <button onClick={() => setIsLogin(!isLogin)} className="text-emerald-400 font-bold hover:text-white transition-colors uppercase text-sm tracking-wide">
             {isLogin ? "Join Now" : "Login"}
           </button>
        </div>
      </div>
      <DatabaseSetup />
    </div>
  );
}
