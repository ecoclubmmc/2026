import { useState, useMemo } from 'react';
import { 
  Search, Filter, ArrowUpDown, Download, 
  Users, UserCheck, GraduationCap, Shield
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { UserProfile } from '../../types';

export default function UserManager() {
  const { allUsers } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'admin' | 'secretary'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: keyof UserProfile; direction: 'asc' | 'desc' } | null>(null);

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
        {Object.entries(stats.byBatch)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 2)
          .map(([batch, count]) => (
            <div key={batch} className="bg-black/40 backdrop-blur-sm border border-white/10 p-5 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Batch {batch}</p>
                <p className="text-2xl font-black text-white">{count}</p>
              </div>
            </div>
          ))}
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
                <th className="p-4 text-right">Join Date</th>
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
                      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                        user.role === 'admin' 
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
                    <td className="p-4 text-right opacity-60 text-xs">
                       Not Recorded
                       {/* Join date not in UserProfile type yet, adding placeholder */}
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
    </div>
  );
}
