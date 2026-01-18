import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit3, Trash2, ExternalLink } from 'lucide-react';
import { DataContext } from '../../context/DataContext';
import { Event } from '../../types';
import ImageUploader from '../ImageUploader';

export default function EventManager() {
  const { events, addEvent, updateEvent, deleteEvent } = useContext(DataContext);
  const [isCreating, setIsCreating] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '', date: '', description: '', formFields: [], venue: '', coverImage: '', competitions: [], galleries: [],
    badgeName: '', badgeEmoji: '', rules: []
  });

  const handleSave = async () => {
    const commonData = {
      title: newEvent.title || 'New Event',
      date: newEvent.date || new Date().toISOString().split('T')[0],
      venue: newEvent.venue || '',
      description: newEvent.description || 'Description',
      image: newEvent.coverImage || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09',
      coverImage: newEvent.coverImage,
      badgeEmoji: newEvent.badgeEmoji || '🌟',
      badgeName: newEvent.badgeName || 'Star Participant',
      category: newEvent.category || 'general',
      formFields: newEvent.formFields?.length ? newEvent.formFields : [
        { id: 'batch', label: 'Batch', type: 'text' as const, required: true }
      ],
      competitions: newEvent.competitions || [],
      galleries: newEvent.galleries || [],
      rules: newEvent.rules || []
    };

    if (editId) {
      await updateEvent(editId, commonData);
    } else {
      const evt: Event = {
        id: Math.random().toString(36).substr(2, 9),
        ...commonData
      } as Event;
      await addEvent(evt);
    }

    setIsCreating(false);
    setEditId(null);
    setNewEvent({ title: '', date: '', description: '', formFields: [], venue: '', coverImage: '', competitions: [], galleries: [], badgeName: '', badgeEmoji: '', rules: [] });
  };

  const startEdit = (evt: Event) => {
    setNewEvent(evt);
    setEditId(evt.id);
    setIsCreating(true);
  };

  const cancelEdit = () => {
    setIsCreating(false);
    setEditId(null);
    setNewEvent({ title: '', date: '', description: '', formFields: [], venue: '', coverImage: '', competitions: [], galleries: [], badgeName: '', badgeEmoji: '', rules: [] });
  };

  return (
    <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-white text-xl">Event Management</h3>
        <button 
          onClick={() => { setIsCreating(true); setEditId(null); }}
          className="flex items-center gap-2 px-4 py-2 bg-lime-600 text-white text-sm font-bold rounded-lg hover:bg-lime-500 transition-colors shadow-lg hover:shadow-lime-500/20"
        >
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      {isCreating && (
        <div className="mb-6 p-6 bg-slate-800 rounded-xl border border-slate-700 space-y-4 shadow-inner">
          <h4 className="font-bold text-sm text-lime-400 mb-3 uppercase tracking-wider">
            {editId ? 'Edit Event' : 'Create New Event'}
          </h4>
          
          <input 
            placeholder="Event Title"
            value={newEvent.title}
            className="w-full p-3 bg-slate-900 rounded-lg border border-slate-700 focus:border-lime-500 text-white outline-none placeholder-slate-500" 
            onChange={e => setNewEvent({...newEvent, title: e.target.value})}
          />

          <div className="grid md:grid-cols-2 gap-4">
            <select
               value={newEvent.category || 'general'}
               onChange={e => setNewEvent({...newEvent, category: e.target.value as any})}
               className="w-full p-3 bg-slate-900 rounded-lg border border-slate-700 focus:border-lime-500 text-white outline-none"
            >
               <option value="general">Generic Event</option>
               <option value="campus">Campus Activity</option>
               <option value="visit">Field Visit</option>
            </select>
            <input 
              type="date"
              value={newEvent.date}
              className="w-full p-3 bg-slate-900 rounded-lg border border-slate-700 focus:border-lime-500 text-white outline-none"
              onChange={e => setNewEvent({...newEvent, date: e.target.value})}
            />
          </div>
          
          <input 
              placeholder="Venue"
              value={newEvent.venue}
              className="w-full p-3 bg-slate-900 rounded-lg border border-slate-700 focus:border-lime-500 text-white outline-none placeholder-slate-500"
              onChange={e => setNewEvent({...newEvent, venue: e.target.value})}
          />
          
          <textarea 
            placeholder="Description"
            value={newEvent.description}
            rows={3}
            className="w-full p-3 bg-slate-900 rounded-lg border border-slate-700 focus:border-lime-500 text-white outline-none placeholder-slate-500"
            onChange={e => setNewEvent({...newEvent, description: e.target.value})}
          />
          
          <div className="grid md:grid-cols-2 gap-4">
             <div>
                <ImageUploader 
                  label="Cover Image"
                  folder="events/covers"
                  currentImage={newEvent.coverImage}
                  onImageUploaded={(url) => setNewEvent({...newEvent, coverImage: url})}
                />
             </div>
             <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Badge Emoji
                </label>
                <div className="flex items-center gap-4">
                   <input 
                      value={newEvent.badgeEmoji || ''}
                      placeholder="🏆"
                      className="w-full p-3 bg-slate-900 rounded-lg border border-slate-700 focus:border-lime-500 text-white outline-none text-2xl text-center"
                      onChange={e => setNewEvent({...newEvent, badgeEmoji: e.target.value})}
                      maxLength={2}
                   />
                   <div className="text-4xl bg-slate-800 p-2 rounded-xl">{newEvent.badgeEmoji || '❓'}</div>
                </div>
             </div>
          </div>

          <div>
             <label className="block text-xs font-medium text-slate-400 mb-1">
                Badge Name
             </label>
             <input 
                placeholder="e.g. Tree Hugger 2024"
                value={newEvent.badgeName}
                className="w-full p-3 bg-slate-900 rounded-lg border border-slate-700 focus:border-lime-500 text-white outline-none text-sm placeholder-slate-500"
                onChange={e => setNewEvent({...newEvent, badgeName: e.target.value})}
             />
          </div>
          
          {/* Competition Manager */}
          <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
            <label className="block text-xs font-bold text-lime-400 mb-3 uppercase tracking-wider">
              Competitions & WhatsApp Links
            </label>
            <div className="space-y-3 mb-3">
               {newEvent.competitions?.map((comp, idx) => (
                 <div key={idx} className="flex gap-2 items-center">
                    <input 
                      value={comp.name}
                      placeholder="Competition Name"
                      onChange={(e) => {
                         const updated = [...(newEvent.competitions || [])];
                         updated[idx].name = e.target.value;
                         setNewEvent({...newEvent, competitions: updated});
                      }}
                      className="flex-1 p-2 bg-slate-800 rounded border border-slate-600 text-xs text-white"
                    />
                    <input 
                      value={comp.whatsappLink}
                      placeholder="WhatsApp Group Link"
                      onChange={(e) => {
                         const updated = [...(newEvent.competitions || [])];
                         updated[idx].whatsappLink = e.target.value;
                         setNewEvent({...newEvent, competitions: updated});
                      }}
                      className="flex-1 p-2 bg-slate-800 rounded border border-slate-600 text-xs text-white"
                    />
                    <button 
                       onClick={() => {
                          const updated = [...(newEvent.competitions || [])];
                          updated.splice(idx, 1);
                          setNewEvent({...newEvent, competitions: updated});
                       }}
                       className="p-2 text-slate-400 hover:text-red-400"
                    >
                       <Trash2 className="w-4 h-4" />
                    </button>
                 </div>
               ))}
            </div>
            <button 
               onClick={() => setNewEvent({
                 ...newEvent, 
                 competitions: [...(newEvent.competitions || []), { name: '', whatsappLink: '' }]
               })}
               className="text-xs font-bold text-lime-500 hover:text-lime-400 flex items-center gap-1"
            >
               <Plus className="w-3 h-3" /> Add Competition
            </button>
          </div>

          <div>
             <label className="block text-xs font-medium text-slate-400 mb-1">
                Event Rules (one per line)
             </label>
             <textarea 
                placeholder="- No plastic usage&#10;- Bring your own water bottle"
                value={newEvent.rules?.join('\n') || ''}
                rows={4}
                className="w-full p-3 bg-slate-900 rounded-lg border border-slate-700 focus:border-lime-500 text-white outline-none text-sm placeholder-slate-500"
                onChange={e => setNewEvent({
                   ...newEvent, 
                   rules: e.target.value.split('\n').filter(line => line.trim() !== '')
                })}
             />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Gallery Images (comma-separated URLs)
            </label>
            <textarea 
              placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
              value={newEvent.galleries?.join(', ') || ''}
              rows={2}
              className="w-full p-3 bg-slate-900 rounded-lg border border-slate-700 focus:border-lime-500 text-white outline-none text-sm placeholder-slate-500"
              onChange={e => setNewEvent({
                ...newEvent, 
                galleries: e.target.value.split(',').map(c => c.trim()).filter(c => c)
              })}
            />
          </div>
          
          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} className="px-6 py-2 bg-lime-600 text-white rounded-lg text-sm font-bold hover:bg-lime-500 transition-colors shadow-md">
               {editId ? 'Update Event' : 'Create Event'}
            </button>
            <button onClick={cancelEdit} className="px-6 py-2 bg-slate-700 text-white rounded-lg text-sm font-bold hover:bg-slate-600 transition-colors">
               Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {events.map(event => (
          <div key={event.id} className="flex items-center justify-between p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-lime-500/30 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-slate-700 rounded-lg overflow-hidden shrink-0">
                <img src={event.coverImage || event.image} className="w-full h-full object-cover" alt={event.title} />
              </div>
              <div>
                <h4 className="font-bold text-white text-lg">{event.title}</h4>
                <p className="text-xs text-slate-400 mt-1">
                  {event.date} • {event.venue || 'No venue'} • {event.competitions?.length || 0} competitions
                </p>
                <div className="flex items-center gap-2 mt-1">
                   <span className="text-lg">{event.badgeEmoji}</span>
                   <span className="text-[10px] text-lime-400 uppercase tracking-widest">{event.badgeName}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link 
                to={`/events/${event.id}`}
                target="_blank"
                className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                title="View Event Page"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
              <button 
                onClick={() => startEdit(event)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                title="Edit Event"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => deleteEvent(event.id)}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Delete Event"
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
