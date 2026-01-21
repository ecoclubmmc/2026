import { useState, useMemo } from 'react';
import {
  Search, Filter, ArrowUpDown, Download,
  Users, UserCheck, GraduationCap, Shield, Eye, X, Edit2, Save, Trash2
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { UserProfile } from '../../types';

export default function UserManager() {
  const { allUsers, updateUserProfile } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'admin' | 'secretary'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: keyof UserProfile; direction: 'asc' | 'desc' } | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});

  const handleEditClick = (user: UserProfile) => {
    setEditForm(user);
    setIsEditing(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    try {
      await updateUserProfile(selectedUser.uid, editForm);
      setIsEditing(false);
      setSelectedUser(prev => prev ? { ...prev, ...editForm } : null);
      alert('User updated successfully!');
    } catch (error) {
      alert('Failed to update user.');
    }
  };

  // --- Statistics Calculation ---
  const stats = useMemo(() => {
    const total = allUsers.length;
    const byBatch: Record<string, number> = {};
    const admins = allUsers.filter(u => u.role === 'admin').length;

    allUsers.forEach(user => {
      if (user.batch) {
        byBatch[user.batch] = (byBatch[user.batch] || 0) + 1;
      }
    });

    return { total, byBatch, admins };
  }, [allUsers]);

  // --- Filtering & Sorting ---
  const filteredUsers = useMemo(() => {
    let result = [...allUsers];

    // Filter by Search
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(user =>
        user.name.toLowerCase().includes(lowerTerm) ||
        user.email.toLowerCase().includes(lowerTerm) ||
        user.mobile?.includes(searchTerm) ||
        user.batch?.includes(searchTerm)
      );
    }

    // Filter by Role
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }

    // Sort
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [allUsers, searchTerm, roleFilter, sortConfig]);

  const handleSort = (key: keyof UserProfile) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Mobile', 'Batch', 'Role', 'Department', 'Badges Count'];
    const csvContent = [
      headers.join(','),
      ...filteredUsers.map(u => [
        `"${u.name}"`,
        u.email,
        u.mobile || '-',
        u.batch,
        u.role,
        u.department || '-',
        u.badges?.length || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ecoclub_users_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-black/40 backdrop-blur-sm border border-white/10 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Total Members</p>
            <p className="text-2xl font-black text-white">{stats.total}</p>
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-sm border border-white/10 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Admins</p>
            <p className="text-2xl font-black text-white">{stats.admins}</p>
          </div>
        </div>

        {/* Batch Quick Stats (Top 2 Batches) */}
        <div className="md:col-span-2 bg-black/40 backdrop-blur-sm border border-white/10 p-5 rounded-2xl flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="w-5 h-5 text-purple-400" />
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Batch Breakdown</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.byBatch)
              .sort(([, a], [, b]) => b - a)
              .map(([batch, count]) => (
                <div key={batch} className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
                  <span className="text-xs font-mono text-slate-400">{batch}</span>
                  <div className="h-3 w-px bg-white/10" />
                  <span className="text-sm font-bold text-white">{count}</span>
                </div>
              ))}
            {Object.keys(stats.byBatch).length === 0 && (
              <span className="text-xs text-slate-600 italic">No batch data available</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-[2rem] overflow-hidden shadow-xl">

        {/* Toolbar */}
        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              placeholder="Search by name, email, mobile or batch..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-slate-300 outline-none focus:border-emerald-500"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="admin">Admins</option>
              <option value="secretary">Secretaries</option>
            </select>

            <button
              onClick={exportToCSV}
              className="px-4 py-2.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-sm font-bold hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-xs uppercase tracking-wider text-slate-400 font-bold border-b border-white/10">
                <th className="p-4 cursor-pointer hover:text-white group" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-2">User <ArrowUpDown className="w-3 h-3 opacity-50 group-hover:opacity-100" /></div>
                </th>
                <th className="p-4 cursor-pointer hover:text-white group" onClick={() => handleSort('batch')}>
                  <div className="flex items-center gap-2">Batch <ArrowUpDown className="w-3 h-3 opacity-50 group-hover:opacity-100" /></div>
                </th>
                <th className="p-4">Mobile No.</th>
                <th className="p-4 cursor-pointer hover:text-white group" onClick={() => handleSort('role')}>
                  <div className="flex items-center gap-2">Role <ArrowUpDown className="w-3 h-3 opacity-50 group-hover:opacity-100" /></div>
                </th>
                <th className="p-4 text-center">Badges</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-slate-300">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.uid} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-900/50 flex items-center justify-center border border-emerald-500/20 text-emerald-400 font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono">
                        {user.batch || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4">
                      {user.mobile ? (
                        <span className="text-xs font-mono">{user.mobile}</span>
                      ) : (
                        <span className="text-xs text-slate-600 italic">Not set</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${user.role === 'admin'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : user.role === 'secretary'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {user.badges?.length > 0 ? (
                        <div className="flex items-center justify-center -space-x-2">
                          {user.badges.slice(0, 3).map((b, i) => (
                            <div key={i} className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs" title={b.name}>
                              {b.emoji}
                            </div>
                          ))}
                          {user.badges.length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-400">
                              +{user.badges.length - 3}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-2 bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 rounded-lg transition-colors group/btn"
                        title="View Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No users found matching your search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-950/30 border-t border-white/5 text-center text-xs text-slate-600">
          Showing {filteredUsers.length} of {stats.total} users
        </div>

      </div>

      {/* User Details Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setSelectedUser(null); setIsEditing(false); }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
            >
              <button
                onClick={() => { setSelectedUser(null); setIsEditing(false); }}
                className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-rose-500/20 hover:text-rose-400 rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8">
                <div className="flex items-start gap-6 mb-8 border-b border-white/5 pb-8">
                  <div className="w-24 h-24 rounded-2xl bg-emerald-900/30 border border-emerald-500/20 flex items-center justify-center text-3xl font-bold text-emerald-400">
                    {selectedUser.avatar ? (
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.avatar}`}
                        alt={selectedUser.name}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : selectedUser.name.charAt(0)}
                  </div>
                  <div className="space-y-2 flex-1">
                    {isEditing ? (
                      <input
                        value={editForm.name || ''}
                        onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        className="text-3xl font-bold text-white bg-black/40 border border-white/20 rounded-lg px-2 w-full outline-none focus:border-emerald-500"
                      />
                    ) : (
                      <h3 className="text-3xl font-bold text-white mb-1">{selectedUser.name}</h3>
                    )}

                    <div className="flex flex-wrap gap-2 items-center">
                      {isEditing ? (
                        <>
                          <select
                            value={editForm.role}
                            onChange={e => setEditForm(prev => ({ ...prev, role: e.target.value as any }))}
                            className="px-3 py-1 bg-black/40 rounded-lg text-xs font-mono text-slate-400 border border-white/20 outline-none"
                          >
                            <option value="student">STUDENT</option>
                            <option value="admin">ADMIN</option>
                            <option value="secretary">SECRETARY</option>
                          </select>
                          <input
                            value={editForm.batch || ''}
                            onChange={e => setEditForm(prev => ({ ...prev, batch: e.target.value }))}
                            placeholder="Batch"
                            className="px-3 py-1 bg-black/40 rounded-lg text-xs font-mono text-slate-400 border border-white/20 w-20 outline-none"
                          />
                          <input
                            value={editForm.department || ''}
                            onChange={e => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                            placeholder="Department"
                            className="px-3 py-1 bg-black/40 rounded-lg text-xs font-mono text-slate-400 border border-white/20 w-32 outline-none"
                          />
                        </>
                      ) : (
                        <>
                          <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-mono text-slate-400 border border-white/10">
                            {selectedUser.role.toUpperCase()}
                          </span>
                          <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-mono text-slate-400 border border-white/10">
                            {selectedUser.batch || 'Batch N/A'}
                          </span>
                          {selectedUser.department && (
                            <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-mono text-slate-400 border border-white/10">
                              {selectedUser.department}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="absolute top-28 right-8 flex gap-2">
                  {!isEditing ? (
                    <button
                      onClick={() => handleEditClick(selectedUser)}
                      className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors border border-emerald-500/20 text-xs font-bold flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" /> Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1.5 bg-slate-800 text-slate-400 hover:bg-slate-700 rounded-lg text-xs font-bold transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveUser}
                        className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-500 rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
                      >
                        <Save className="w-3 h-3" /> Save Changes
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Contact Info</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-slate-500 block mb-1">Email Address</label>
                        <p className="text-slate-200 font-mono text-sm">{selectedUser.email}</p>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 block mb-1">Mobile Number</label>
                        {isEditing ? (
                          <input
                            value={editForm.mobile || ''}
                            onChange={e => setEditForm(prev => ({ ...prev, mobile: e.target.value }))}
                            className="w-full bg-black/40 border border-white/20 rounded-lg px-3 py-1 text-sm text-white outline-none focus:border-emerald-500 font-mono"
                          />
                        ) : (
                          <p className="text-slate-200 font-mono text-sm">{selectedUser.mobile || 'Not set'}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Achievements</h4>
                    <div>
                      <label className="text-xs text-slate-500 block mb-3">Earned Badges ({selectedUser.badges?.length || 0})</label>
                      <div className="grid grid-cols-4 gap-2">
                        {selectedUser.badges?.length > 0 ? (
                          selectedUser.badges.map((badge, idx) => (
                            <div key={idx} className="aspect-square bg-slate-800 rounded-xl flex items-center justify-center text-2xl border border-white/5" title={badge.name}>
                              {badge.emoji}
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-600 col-span-4 italic">No badges earned yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5">
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Event Participation</h4>
                  {selectedUser.registeredEvents?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.registeredEvents.map((evtId, i) => (
                        <span key={i} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-medium">
                          {evtId}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-600 italic">Has not registered for any events.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
