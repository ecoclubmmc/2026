import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, X, CheckCircle, Sparkles, ArrowRight, Filter } from 'lucide-react';
import { DataContext } from '../context/DataContext';
import { Event, EventCategory } from '../types';

type FormState = Record<string, string | number | boolean>;

type EventsPageProps = {
  category?: EventCategory;
  title?: string;
};

export default function EventsPage({ category, title = "Eco Events" }: EventsPageProps) {
  const { events, user, registerForEvent, registrations } = useContext(DataContext);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [formState, setFormState] = useState<FormState>({});
  const [mobileNumber, setMobileNumber] = useState('');
  const [selectedCompetition, setSelectedCompetition] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successLink, setSuccessLink] = useState('');

  // Helper: Check if event date is in the past
  const isPastEvent = (eventDate: string) => {
    const eventDateTime = new Date(eventDate).getTime();
    const now = new Date().getTime();
    return eventDateTime < now;
  };

  // Filter events based on category prop
  const filteredEvents = category
    ? events.filter(e => e.category === category)
    : events;

  // Filter events into upcoming and past
  const upcomingEvents = filteredEvents
    .filter(e => !isPastEvent(e.date))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastEvents = filteredEvents
    .filter(e => isPastEvent(e.date))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Find the next upcoming event
  const nextEvent = upcomingEvents[0];

  const handleRegisterClick = (evt: Event) => {
    setSelectedEvent(evt);
    setFormState({});
    setMobileNumber('');
    setSelectedCompetition('');
    setShowSuccess(false);
    setSuccessLink('');
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setFormState({ ...formState, [fieldId]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEvent) {
      if (!mobileNumber) {
        alert('Mobile number is required');
        return;
      }

      // If competitions exist, ensure one is selected
      if (selectedEvent.competitions && selectedEvent.competitions.length > 0 && !selectedCompetition) {
        alert('Please select a competition');
        return;
      }

      const finalData = {
        ...formState,
        mobile: mobileNumber,
        competition: selectedCompetition
      };

      registerForEvent(selectedEvent.id, finalData);

      // Determine WhatsApp link
      let link = '';
      if (selectedCompetition && selectedEvent.competitions) {
        const comp = selectedEvent.competitions.find(c => c.name === selectedCompetition);
        if (comp) link = comp.whatsappLink;
      }
      setSuccessLink(link);

      setShowSuccess(true);
      // Don't auto-close if there's a link to click
      if (!link) {
        setTimeout(() => {
          setShowSuccess(false);
          setSelectedEvent(null);
        }, 2000);
      }
    }
  };

  const isRegistered = (eventId: string) => {
    return user && registrations.some(r => r.userId === user.uid && r.eventId === eventId);
  };

  const renderEventCard = (event: Event, isUpcoming: boolean) => {
    const registered = isRegistered(event.id);
    const isNext = isUpcoming && event.id === nextEvent?.id;

    return (
      <motion.div
        key={event.id}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -5 }}
        className="bg-black/40 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-xl overflow-hidden flex flex-col relative group hover:border-emerald-500/30 transition-all"
      >
        {/* "Upcoming" Badge */}
        {isNext && (
          <div className="absolute top-4 left-4 z-20 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-1 animate-pulse border border-emerald-400">
            <Sparkles className="w-3 h-3" />
            NEXT EVENT
          </div>
        )}

        <Link to={`/events/${event.id}`} className="block h-56 relative overflow-hidden">
          <img
            src={event.coverImage || event.image}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />

          <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-10">
            <span className="bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-mono text-white border border-slate-700 flex items-center gap-2">
              <Calendar className="w-3 h-3 text-lime-400" />
              {event.date}
            </span>
            {event.venue && (
              <span className="bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-mono text-white border border-slate-700 flex items-center gap-2">
                <MapPin className="w-3 h-3 text-cyan-400" />
                {event.venue}
              </span>
            )}
          </div>
        </Link>

        <div className="p-6 md:p-8 flex-1 flex flex-col">
          <Link to={`/events/${event.id}`} className="group-hover:text-lime-400 transition-colors">
            <h3 className="text-2xl font-black text-white mb-3 tracking-tight">{event.title}</h3>
          </Link>
          <p className="text-slate-400 mb-8 flex-1 line-clamp-3 leading-relaxed">{event.description}</p>

          <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/10">
            <div className="flex items-center gap-3">
              {/* Badge Icon */}
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-white/10">
                {event.badgeImage?.startsWith('http') ? (
                  <img src={event.badgeImage} className="w-5 h-5 object-contain" alt="Badge" />
                ) : (
                  <span className="text-lg">{event.badgeImage || '🌟'}</span>
                )}
              </div>
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{event.badgeName}</span>
            </div>

            {isUpcoming ? (
              registered ? (
                <button disabled className="px-4 py-2 bg-emerald-500/20 text-emerald-400 font-bold text-xs rounded-lg cursor-default flex items-center gap-2 border border-emerald-500/30">
                  <CheckCircle className="w-4 h-4" /> REGISTERED
                </button>
              ) : (
                <button
                  onClick={() => handleRegisterClick(event)}
                  className="px-6 py-3 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-500 transition-all shadow-lg hover:shadow-emerald-500/20 active:translate-y-0.5"
                >
                  Join Event
                </button>
              )
            ) : (
              <Link
                to={`/events/${event.id}`}
                className="px-6 py-3 bg-white/10 text-white font-bold text-sm rounded-xl hover:bg-white/20 transition-colors border border-white/10"
              >
                View Report
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="pt-28 pb-12 min-h-screen bg-transparent">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-emerald-400 text-xs font-bold mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {category ? category.toUpperCase() + ' EVENTS' : 'GENERAL EVENTS'}
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">{title}</h2>
            </div>
            <button className="px-4 py-2 bg-black/30 text-slate-300 rounded-lg text-sm font-bold border border-white/10 hover:text-white hover:border-emerald-500/50 transition-all flex items-center gap-2 backdrop-blur-sm">
              <Filter className="w-4 h-4" /> FILTERS
            </button>
          </div>
        </div>

        {upcomingEvents.length > 0 && (
          <div className="mb-20">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-lime-500" /> Upcoming
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingEvents.map(event => renderEventCard(event, true))}
            </div>
          </div>
        )}

        {pastEvents.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-slate-500 mb-8 flex items-center gap-2 font-mono uppercase tracking-widest">
              / Archive
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-80 hover:opacity-100 transition-opacity">
              {pastEvents.map(event => renderEventCard(event, false))}
            </div>
          </div>
        )}

        {filteredEvents.length === 0 && (
          <div className="text-center py-20 bg-black/20 rounded-[3rem] border border-white/10 border-dashed backdrop-blur-sm">
            <p className="text-slate-400 text-lg">NO EVENTS FOUND</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900/90 backdrop-blur-xl w-[95%] md:w-full max-w-lg rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-white/20 my-auto max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors z-20 backdrop-blur-sm"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="h-40 relative shrink-0">
                <img src={selectedEvent.coverImage || selectedEvent.image} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8 w-full">
                  <p className="text-lime-400 text-xs font-mono font-bold uppercase mb-2 tracking-wide">EVENT_REGISTRATION</p>
                  <h3 className="text-3xl text-white font-black tracking-tight leading-none">{selectedEvent.title}</h3>
                </div>
              </div>

              {showSuccess ? (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-lime-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-lime-500 border border-lime-500/20">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-2">Confirmed</h4>
                  <p className="text-slate-400 font-mono text-sm mb-6">You have been added to the register.</p>

                  {successLink && (
                    <a href={successLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white font-bold rounded-xl hover:bg-[#128C7E] transition-colors shadow-lg">
                      Join WhatsApp Group <ArrowRight className="w-4 h-4" />
                    </a>
                  )}

                  <button onClick={() => setSelectedEvent(null)} className="block w-full mt-6 text-slate-500 hover:text-white text-sm">
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <div className="px-8 py-4 bg-slate-800/50 border-b border-slate-800 flex gap-6 text-slate-300 text-xs font-mono shrink-0">
                    <span className="flex items-center gap-2"><Calendar className="w-3 h-3 text-lime-400" /> {new Date(selectedEvent.date).toLocaleDateString()}</span>
                    {selectedEvent.venue && <span className="flex items-center gap-2"><MapPin className="w-3 h-3 text-cyan-400" /> {selectedEvent.venue}</span>}
                  </div>

                  <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    {!user ? (
                      <div className="text-center py-8">
                        <p className="mb-6 text-slate-400">Authentication required for registration.</p>
                        <Link to="/login" className="px-8 py-3 bg-lime-600 text-white font-bold rounded-xl hover:bg-lime-500 transition-colors inline-block">Login Now</Link>
                      </div>
                    ) : (
                      <>
                        <div className="p-4 bg-lime-500/5 rounded-xl border border-lime-500/10 mb-4 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] text-lime-400 font-mono uppercase tracking-widest mb-1">MEMBER</p>
                            <p className="text-sm text-white font-bold">{user.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-1">BATCH</p>
                            <p className="text-sm text-slate-300 font-mono">{user.batch}</p>
                          </div>
                        </div>

                        {/* Mobile Number Field - Mandatory */}
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 font-mono">
                            Mobile Number <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            value={mobileNumber}
                            placeholder="Default contact for updates"
                            onChange={(e) => setMobileNumber(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white focus:border-lime-500 outline-none placeholder-slate-600"
                          />
                        </div>

                        {/* Competition Selection - if competitions exist */}
                        {selectedEvent.competitions && selectedEvent.competitions.length > 0 && (
                          <div>
                            <label className="block text-xs font-bold text-lime-400 uppercase tracking-widest mb-2 font-mono animate-pulse">
                              Select Competition <span className="text-red-400">*</span>
                            </label>
                            <select
                              required
                              value={selectedCompetition}
                              onChange={(e) => setSelectedCompetition(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-lime-500/50 bg-slate-800 text-white focus:border-lime-500 outline-none ring-1 ring-lime-500/20"
                            >
                              <option value="">Choose a competition...</option>
                              {selectedEvent.competitions.map((comp, i) => (
                                <option key={i} value={comp.name}>{comp.name}</option>
                              ))}
                            </select>
                            <p className="text-[10px] text-slate-500 mt-2">
                              Select the specific competition you wish to participate in.
                            </p>
                          </div>
                        )}

                        {selectedEvent.formFields?.map(field => {
                          const isBatchField = field.id === 'batch' || field.label.toLowerCase().includes('batch');
                          const defaultValue = isBatchField ? user.batch : undefined;

                          return (
                            <div key={field.id}>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 font-mono">
                                {field.label} {field.required && <span className="text-red-400">*</span>}
                              </label>
                              {field.type === 'select' ? (
                                <select
                                  required={field.required}
                                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                                  className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white focus:border-lime-500 outline-none"
                                >
                                  <option value="">Select option...</option>
                                  {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                              ) : (
                                <input
                                  type={field.type}
                                  required={field.required}
                                  defaultValue={defaultValue}
                                  readOnly={isBatchField}
                                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                                  className={`w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white focus:border-lime-500 outline-none ${isBatchField ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                />
                              )}
                            </div>
                          );
                        })}

                        <div className="pt-4">
                          <button type="submit" className="w-full py-4 bg-lime-600 text-white font-bold rounded-xl hover:bg-lime-500 transition-colors shadow-lg shadow-lime-500/20 flex justify-center items-center gap-2 group">
                            Confirm Registration <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </>
                    )}
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
