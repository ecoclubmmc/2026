import { useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { DataContext } from '../context/DataContext';
import HolographicBadge from '../components/HolographicBadge';
import { DefaultAvatars } from '../types';
import { Mail, Phone, Pencil, X, Check, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUserProfile } = useContext(DataContext);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [editBatch, setEditBatch] = useState('');
  const [editAvatar, setEditAvatar] = useState('eco1');
  const [isSaving, setIsSaving] = useState(false);

  if (!user) return <Navigate to="/login" />;

  // Find the user's avatar
  const userAvatar = DefaultAvatars.find(a => a.id === user.avatar) || DefaultAvatars[0];

  const handleEditClick = () => {
    setEditName(user.name);
    setEditMobile(user.mobile || '');
    setEditBatch(user.batch);
    setEditAvatar(user.avatar || 'eco1');
    setIsEditing(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUserProfile(user.uid, {
        name: editName,
        mobile: editMobile,
        batch: editBatch,
        avatar: editAvatar
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile", err);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="pt-24 pb-12 min-h-screen bg-transparent text-white">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1">
             <div className="bg-black/40 backdrop-blur-md rounded-[2.5rem] shadow-lg border border-white/10 p-8 text-center sticky top-24">
                {/* Large Avatar Display */}
                <div 
                  className="w-32 h-32 mx-auto rounded-full flex items-center justify-center text-6xl mb-4 shadow-lg ring-4 ring-white/10 bg-white/5"
                  style={{ backgroundColor: userAvatar.color }}
                >
                  {userAvatar.emoji}
                </div>
                
                <button 
                  onClick={handleEditClick}
                  className="absolute top-8 right-8 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors group"
                  title="Edit Profile"
                >
                  <Pencil className="w-4 h-4 text-slate-400 group-hover:text-white" />
                </button>
                
                <h2 className="text-2xl font-bold text-white tracking-tight mb-1">{user.name}</h2>
                <div className="flex items-center justify-center gap-2 mb-6">
                   <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                     <p className="text-emerald-400 font-bold text-[10px] uppercase tracking-widest">{user.role}</p>
                   </div>
                   <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                     <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">BATCH {user.batch}</p>
                   </div>
                </div>

                {/* Contact Info Section */}
                <div className="space-y-3 mb-8 text-left bg-black/20 p-4 rounded-2xl border border-white/5">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Email Address</p>
                        <p className="text-sm font-medium text-white truncate" title={user.email}>{user.email}</p>
                      </div>
                   </div>
                   <div className="h-[1px] bg-white/5" />
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Mobile Number</p>
                        <p className="text-sm font-medium text-white">{user.mobile || 'Not set'}</p>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                     <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Badges</p>
                     <p className="text-3xl font-bold text-white">{user.badges.filter(b => b.status === 'active').length}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                     <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Pending</p>
                     <p className="text-3xl font-bold text-slate-300">{user.badges.filter(b => b.status === 'pending').length}</p>
                  </div>
                </div>
             </div>
          </div>

          <div className="lg:col-span-2 space-y-12">
            <div>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-emerald-400" /> Achievements
              </h3>
              <div className="flex flex-wrap gap-3">
                 {user.badges.map((badge, idx) => (
                   <HolographicBadge key={idx} badge={badge} />
                 ))}
                 
                 {user.badges.length === 0 && (
                   <div className="col-span-full py-12 text-center text-slate-400 bg-black/30 rounded-[2rem] border border-dashed border-white/10 font-bold text-sm uppercase tracking-wide">
                     NO BADGES EARNED
                   </div>
                 )}
              </div>
            </div>
            
            <div>
               <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-400" /> Recent Activity
               </h3>
               <div className="bg-black/40 backdrop-blur-md rounded-[2.5rem] shadow-sm border border-white/10 p-8">
                  <div className="space-y-6">
                    {/* Activity Timeline Placeholder */}
                    <div className="flex gap-4">
                       <div className="flex flex-col items-center">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full ring-4 ring-emerald-500/20" />
                          <div className="w-0.5 h-full bg-white/10 my-1" />
                       </div>
                       <div className="pb-6">
                          <p className="text-sm font-bold text-white">Joined Eco Club</p>
                          <p className="text-xs text-slate-400 mt-1">BATCH {user.batch}</p>
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-black/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-bold text-white mb-6">Edit Profile</h3>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Avatar Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Choose Avatar</label>
                <div className="grid grid-cols-5 gap-2">
                  {DefaultAvatars.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setEditAvatar(av.id)}
                      className={`aspect-square rounded-xl flex items-center justify-center text-2xl transition-all ${
                        editAvatar === av.id 
                          ? 'bg-emerald-500/20 ring-2 ring-emerald-500 scale-110' 
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                      style={{ backgroundColor: editAvatar === av.id ? undefined : av.color + '20' }}
                    >
                      {av.emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/30 text-white focus:border-emerald-500 focus:bg-black/50 transition-all outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Batch Year</label>
                  <input
                    type="text"
                    required
                    pattern="[0-9]{4}"
                    value={editBatch}
                    onChange={(e) => setEditBatch(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/30 text-white focus:border-emerald-500 focus:bg-black/50 transition-all outline-none"
                    maxLength={4}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Mobile Number</label>
                  <input
                    type="tel"
                    pattern="[0-9]{10}"
                    value={editMobile}
                    onChange={(e) => setEditMobile(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/30 text-white focus:border-emerald-500 focus:bg-black/50 transition-all outline-none"
                    placeholder="10 digits"
                    maxLength={10}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-4 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20 flex justify-center items-center gap-2"
              >
                {isSaving ? <Loader2 className="animate-spin w-5 h-5" /> : <><Check className="w-5 h-5" /> Save Changes</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
