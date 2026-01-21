import { useContext, useState } from 'react';
import { Plus, Edit3, Trash2, User } from 'lucide-react';
import { DataContext } from '../../context/DataContext';
import { Secretary } from '../../types';

export default function SecretaryManager() {
  const { secretaries, addSecretary, deleteSecretary, updateSecretary } = useContext(DataContext);
  const [isCreating, setIsCreating] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [newSec, setNewSec] = useState<Partial<Secretary>>({
    name: '', role: '', image: '', description: ''
  });

  const handleCreate = async () => {
    try {
      if (editId) {
        await updateSecretary(editId, newSec);
        console.log("Secretary updated");
      } else {
        const sec: Secretary = {
          id: Math.random().toString(36).substr(2, 9),
          name: newSec.name || 'New Secretary',
          role: newSec.role || 'Role',
          image: newSec.image || '',
          description: newSec.description || 'Description',
          order: secretaries.length + 1,
        } as Secretary;
        await addSecretary(sec);
      }

      setIsCreating(false);
      setEditId(null);
      setNewSec({ name: '', role: '', image: '', description: '' });
    } catch (error) {
      console.error("Failed to save secretary:", error);
      alert("Failed to save. See console.");
    }
  };

  const handleEdit = (sec: Secretary) => {
    setNewSec(sec);
    setEditId(sec.id);
    setIsCreating(true);
  };

  return (
    <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-white text-xl">Secretary Management</h3>
        <button
          onClick={() => { setIsCreating(true); setEditId(null); setNewSec({ name: '', role: '', image: '', description: '' }); }}
          className="flex items-center gap-2 px-4 py-2 bg-lime-600 text-white text-sm font-bold rounded-lg hover:bg-lime-500 transition-colors shadow-md"
        >
          <Plus className="w-4 h-4" /> Add Secretary
        </button>
      </div>

      {isCreating && (
        <div className="mb-6 p-6 bg-slate-800 rounded-xl border border-slate-700 space-y-4 shadow-inner">
          <h4 className="font-bold text-sm text-lime-400 mb-3 uppercase tracking-wider">{editId ? 'Edit Secretary' : 'Add New Secretary'}</h4>

          <input
            value={newSec.name || ''}
            placeholder="Name"
            className="w-full p-3 bg-slate-900 rounded-lg border border-slate-700 focus:border-lime-500 text-white outline-none placeholder-slate-500"
            onChange={e => setNewSec({ ...newSec, name: e.target.value })}
          />

          <input
            value={newSec.role || ''}
            placeholder="Role (e.g., General Secretary)"
            className="w-full p-3 bg-slate-900 rounded-lg border border-slate-700 focus:border-lime-500 text-white outline-none placeholder-slate-500"
            onChange={e => setNewSec({ ...newSec, role: e.target.value })}
          />

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              <User className="w-3 h-3 inline mr-1" />
              Image URL (optional)
            </label>
            <input
              value={newSec.image || ''}
              placeholder="https://example.com/photo.jpg or emoji 👤"
              className="w-full p-3 bg-slate-900 rounded-lg border border-slate-700 focus:border-lime-500 text-white outline-none text-sm placeholder-slate-500"
              onChange={e => setNewSec({ ...newSec, image: e.target.value })}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={handleCreate} className="px-6 py-2 bg-lime-600 text-white rounded-lg text-sm font-bold hover:bg-lime-500 transition-colors shadow-md">Save</button>
            <button onClick={() => setIsCreating(false)} className="px-6 py-2 bg-slate-700 text-white rounded-lg text-sm font-bold hover:bg-slate-600 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {secretaries.length === 0 && (
          <p className="text-center text-slate-500 py-4 italic border border-dashed border-slate-800 rounded-lg">No secretaries added yet.</p>
        )}

        {secretaries.map(sec => (
          <div key={sec.id} className="flex items-center justify-between p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-lime-500/30 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-700 rounded-full overflow-hidden flex items-center justify-center border border-slate-600">
                {sec.image && (sec.image.startsWith('http') || sec.image.startsWith('/')) ? (
                  <img src={sec.image} className="w-full h-full object-cover" alt={sec.name} />
                ) : (
                  <span className="text-xl">{sec.image || '👤'}</span>
                )}
              </div>
              <div>
                <h4 className="font-bold text-white text-lg">{sec.name}</h4>
                <p className="text-xs text-lime-400 uppercase tracking-wide">{sec.role}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(sec)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteSecretary(sec.id)}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
