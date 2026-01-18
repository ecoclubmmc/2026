import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { DataContext } from '../context/DataContext';
import { DefaultAvatars } from '../types';

export default function LoginPage() {
  const { googleLogin, completeGoogleLogin } = useContext(DataContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  
  // Profile Completion States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCompleteProfile, setShowCompleteProfile] = useState(false);
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [batch, setBatch] = useState('');
  const [mobile, setMobile] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('eco1');
  const [email, setEmail] = useState('');

  const handleGoogleLogin = async () => {
    setError('');
    try {
      const result = await googleLogin();
      if (result.needsCompletion) {
        setGoogleUser(result.user);
        setName(result.user.displayName || '');
        setEmail(result.user.email || ''); 
        
        // Show completion modal if profile incomplete
        setShowCompleteProfile(true);
      } else {
        navigate('/');
      }
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google Sign In Failed');
      }
    }
  };

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!/^\d{4}$/.test(batch)) {
      setError("Batch must be a 4-digit year (e.g., 2022)");
      return;
    }
    if (!/^\d{10}$/.test(mobile)) {
      setError("Mobile Number must be 10 digits");
      return;
    }

    setIsSubmitting(true);
    try {
      await completeGoogleLogin(googleUser.uid, {
        name: name,
        email: email,
        mobile: mobile,
        batch: batch,
        avatar: selectedAvatar
      });
      navigate('/');
    } catch (err: any) {
      setError(err.message || "Failed to create profile");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent p-6 relative overflow-hidden">
      <div className="w-full max-w-sm bg-black/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/10 p-8 md:p-10 relative z-10 transition-all text-center">
        
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 text-emerald-400 text-xs font-bold mb-6 border border-white/10">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             MEMBER ACCESS
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Welcome to Eco Club</h2>
          <p className="text-slate-400 text-sm">Sign in to access your dashboard, track events, and manage your badges.</p>
        </div>
        
        {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs flex items-center gap-2 text-left">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" /> {error}
            </div>
        )}

        <button 
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-4 rounded-xl bg-white text-black font-bold hover:bg-slate-200 transition-all flex justify-center items-center gap-3 shadow-lg shadow-white/5"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
          Sign in with Google
        </button>

        <p className="mt-8 text-xs text-slate-500">
          By signing in, you agree to our club guidelines and privacy policy.
        </p>
      </div>

      {/* Complete Profile Modal */}
      {showCompleteProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-black/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8 relative max-h-[90vh] overflow-y-auto">
             <h3 className="text-2xl font-bold text-white mb-2">Complete Your Profile</h3>
             <p className="text-slate-400 text-sm mb-6">Just a few more details to get you started.</p>

             <form onSubmit={handleCompleteProfile} className="space-y-6">
                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                   <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/30 text-white focus:border-emerald-500 focus:bg-black/50 transition-all outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Batch Year</label>
                    <input type="text" required pattern="[0-9]{4}" value={batch} onChange={(e) => setBatch(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/30 text-white focus:border-emerald-500 focus:bg-black/50 transition-all outline-none" maxLength={4} placeholder="202X" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Mobile Number</label>
                    <input type="tel" required pattern="[0-9]{10}" value={mobile} onChange={(e) => setMobile(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/30 text-white focus:border-emerald-500 focus:bg-black/50 transition-all outline-none" placeholder="10 Digits" maxLength={10} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Choose Avatar</label>
                  <div className="grid grid-cols-5 gap-2">
                    {DefaultAvatars.map((av) => (
                      <button key={av.id} type="button" onClick={() => setSelectedAvatar(av.id)} className={`aspect-square rounded-xl flex items-center justify-center text-2xl transition-all ${selectedAvatar === av.id ? 'bg-emerald-500/20 ring-2 ring-emerald-500 scale-110' : 'bg-white/5 hover:bg-white/10'}`} style={{ backgroundColor: selectedAvatar === av.id ? undefined : av.color + '20' }}>{av.emoji}</button>
                    ))}
                  </div>
                </div>

                {error && <div className="text-red-400 text-sm">{error}</div>}

                <button type="submit" disabled={isSubmitting} className="w-full py-4 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-all flex justify-center items-center gap-2">
                   {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : "Complete Setup"}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
