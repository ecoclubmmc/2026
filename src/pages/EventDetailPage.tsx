import { useContext, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowLeft, Image as ImageIcon, X, Check } from 'lucide-react';
import { DataContext } from '../context/DataContext';

export default function EventDetailPage() {
  const { id } = useParams();
  const { events, registerForEvent, user } = useContext(DataContext);
  const event = events.find(e => e.id === id);

  const [showRegister, setShowRegister] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [mobileNumber, setMobileNumber] = useState('');
  const [selectedCompetition, setSelectedCompetition] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successLink, setSuccessLink] = useState('');

  if (!event) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex flex-col items-center justify-center bg-transparent text-white">
        <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
        <Link to="/events" className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 font-bold">
          Back to Events
        </Link>
      </div>
    );
  }

  const isPast = new Date(event.date) < new Date();

  // Auto-fill mobile from user profile
  useEffect(() => {
    if (user?.mobile) {
      setMobileNumber(user.mobile);
    }
  }, [user]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^\d{10}$/.test(mobileNumber)) {
      alert('Mobile number must be exactly 10 digits');
      return;
    }

    if (event.competitions && event.competitions.length > 0 && !selectedCompetition) {
      alert('Please select a competition');
      return;
    }

    setIsSubmitting(true);
    await registerForEvent(event.id, {
      ...formData,
      mobile: mobileNumber,
      batch: user?.batch, // Auto-link batch
      competition: selectedCompetition
    });
    setIsSubmitting(false);

    let link = '';
    if (selectedCompetition && event.competitions) {
      const comp = event.competitions.find(c => c.name === selectedCompetition);
      if (comp) link = comp.whatsappLink;
    }

    setSuccessLink(link);
    setShowRegister(false);
    setShowSuccess(true);
  };

  return (
    <div className="min-h-screen bg-transparent pt-24 pb-12">
      {/* Hero Cover */}
      <div className="relative h-[400px] w-full mt-6 rounded-[2.5rem] overflow-hidden mx-auto container shadow-2xl border border-white/20 px-0 md:px-6">
        <div className="relative h-full w-full md:rounded-[2.5rem] overflow-hidden">
          <img
            src={event.coverImage || event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
            <Link
              to={event.category === 'visit' ? '/field-visits' : (event.category === 'campus' ? '/campus-activities' : '/events')}
              className="inline-flex items-center text-slate-300 hover:text-white mb-6 transition-colors font-bold text-sm uppercase tracking-wider backdrop-blur-md bg-black/30 px-4 py-2 rounded-full border border-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to {event.category === 'visit' ? 'Visits' : (event.category === 'campus' ? 'Activities' : 'Events')}
            </Link>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">{event.title}</h1>
            <div className="flex flex-wrap gap-6 text-slate-200 text-lg">
              <span className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                <Calendar className="w-5 h-5 text-emerald-400" />
                {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              {event.venue && (
                <span className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                  {event.venue}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 mt-12 grid lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          {/* About */}
          <section className="bg-black/60 backdrop-blur-md p-8 md:p-12 rounded-[2.5rem] border border-white/10 shadow-xl">
            <h2 className="text-3xl font-bold text-white mb-6">About the Event</h2>
            <p className="text-slate-300 leading-relaxed text-lg whitespace-pre-wrap">
              {event.description}
            </p>
          </section>

          {/* Gallery */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 bg-black/40 w-fit px-6 py-3 rounded-full border border-white/10 backdrop-blur-sm">
              <ImageIcon className="w-6 h-6 text-emerald-500" /> Event Gallery
            </h2>

            {event.galleries && event.galleries.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {event.galleries.map((img, idx) => (
                  <div key={idx} className="aspect-square rounded-3xl overflow-hidden bg-black/40 shadow-sm border border-white/10 group cursor-pointer">
                    <img
                      src={img}
                      alt={`Gallery ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-black/40 backdrop-blur-md p-12 rounded-[2.5rem] border border-dashed border-white/20 text-center text-slate-500">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No gallery images uploaded yet.</p>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Registration Card */}
          <div className="bg-black/60 backdrop-blur-md p-8 rounded-4xl shadow-xl border border-white/10 sticky top-24">
            <div className="mb-6 pb-6 border-b border-white/10">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Status</p>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isPast ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`} />
                <span className="text-white font-bold text-lg">{isPast ? 'Event Ended' : 'Registration Open'}</span>
              </div>
            </div>

            {!isPast && (
              event.competitions && event.competitions.length > 0 ? (
                // If event has competitions, always show register button (users can register for multiple competitions)
                <button
                  onClick={() => { setShowRegister(true); setMobileNumber(user?.mobile || ''); setSelectedCompetition(''); }}
                  className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-500 transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95 border border-emerald-500/50"
                >
                  {user?.registeredEvents?.includes(event.id) ? 'Register for Another Competition' : 'Register Now'}
                </button>
              ) : (
                // If no competitions, show registered state if already registered
                user?.registeredEvents?.includes(event.id) ? (
                  <div className="w-full py-4 bg-emerald-500/20 text-emerald-400 rounded-xl font-bold text-lg border border-emerald-500/30 flex items-center justify-center gap-2">
                    <Check className="w-5 h-5" /> Registered
                  </div>
                ) : (
                  <button
                    onClick={() => { setShowRegister(true); setMobileNumber(user?.mobile || ''); setSelectedCompetition(''); }}
                    className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-500 transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95 border border-emerald-500/50"
                  >
                    Register Now
                  </button>
                )
              )
            )}

            {isPast && (
              <button disabled className="w-full py-4 bg-white/5 text-slate-500 rounded-xl font-bold text-lg cursor-not-allowed border border-white/10">
                Registration Closed
              </button>
            )}
          </div>

          {/* Rules Card */}
          {!isPast && event.rules && event.rules.length > 0 && (
            <div className="bg-rose-500/10 backdrop-blur-md p-8 rounded-4xl shadow-sm border border-rose-500/20">
              <h3 className="text-lg font-bold text-rose-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                ⚠️ Rules & Info
              </h3>
              <ul className="space-y-3">
                {event.rules.map((rule, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                    <span className="text-rose-500 mt-1">•</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Competitions Card */}
          {event.competitions && event.competitions.length > 0 && (
            <div className="bg-black/60 backdrop-blur-md p-8 rounded-4xl shadow-sm border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4">Competitions</h3>
              <ul className="space-y-3">
                {event.competitions.map((comp, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    {comp.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Badge Card */}
          <div className="bg-linear-to-br from-black/80 to-slate-900/80 backdrop-blur-md p-8 rounded-4xl shadow-lg text-center text-white relative overflow-hidden border border-white/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
            <div className="relative z-10">
              <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">EARN A BADGE</p>
              <div className="my-6 flex justify-center transform hover:scale-110 transition-transform duration-500 cursor-default">
                <div className="text-7xl drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">{event.badgeEmoji || '🌟'}</div>
              </div>
              <h3 className="text-xl font-bold mb-1">{event.badgeName}</h3>
              <p className="text-slate-400 text-sm">Participate to unlock!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-4xl border border-emerald-500/50 p-8 max-w-md w-full text-center relative shadow-2xl shadow-emerald-500/20 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 outline-4 outline-emerald-500/10">
              <Check className="w-10 h-10 text-emerald-400" />
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">Registration Successful!</h3>
            <p className="text-slate-400 mb-8">You have successfully registered for <span className="text-emerald-400 font-bold">{event.title}</span>.</p>

            <div className="space-y-3">
              {successLink && (
                <a
                  href={successLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-4 bg-[#25D366] text-white font-bold rounded-xl hover:bg-[#20bd5a] transition-colors shadow-lg shadow-emerald-900/20"
                >
                  <div className="w-6 h-6 flex items-center justify-center bg-white/20 rounded-full">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" className="w-4 h-4 invert brightness-0" />
                  </div>
                  Join WhatsApp Group
                </a>
              )}
              <button
                onClick={() => setShowSuccess(false)}
                className="w-full py-4 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors border border-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {showRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900/90 w-full max-w-md rounded-4xl border border-white/20 shadow-2xl overflow-hidden backdrop-blur-xl">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="text-xl font-bold text-white">Event Registration</h3>
              <button onClick={() => setShowRegister(false)} className="text-slate-400 hover:text-white transition-colors bg-white/10 p-2 rounded-full hover:bg-white/20">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="p-8 space-y-5">

              {/* Mobile Number - Mandatory */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Mobile Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={mobileNumber}
                  placeholder="e.g. 9876543210"
                  className="w-full p-4 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500 focus:bg-black/60 transition-colors"
                  onChange={e => setMobileNumber(e.target.value)}
                />
              </div>

              {/* Competition Selection */}
              {event.competitions && event.competitions.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-lime-400 uppercase tracking-widest mb-2 animate-pulse">
                    Select Competition <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    value={selectedCompetition}
                    className="w-full p-4 bg-black/40 border border-lime-500/30 rounded-xl text-white outline-none focus:border-lime-500 focus:bg-black/60 transition-colors"
                    onChange={e => setSelectedCompetition(e.target.value)}
                  >
                    <option value="">Choose competition...</option>
                    {event.competitions.map((c, i) => (
                      <option key={i} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {event.formFields && event.formFields.map(field => (
                <div key={field.id}>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    {field.label} {field.required && <span className="text-red-400">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      required={field.required}
                      className="w-full p-4 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500 focus:bg-black/60 transition-colors"
                      onChange={e => setFormData({ ...formData, [field.id]: e.target.value })}
                    />
                  ) : (
                    <input
                      type={field.type}
                      required={field.required}
                      className="w-full p-4 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500 focus:bg-black/60 transition-colors"
                      onChange={e => setFormData({ ...formData, [field.id]: e.target.value })}
                    />
                  )}
                </div>
              ))}

              {!user && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm rounded-xl">
                  Authentication required to register.
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!user || isSubmitting}
                  className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg hover:shadow-emerald-500/20"
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Registration'} <Check className="w-5 h-5" />
                </button>
                {!user && (
                  <Link to="/login" className="block text-center mt-4 text-emerald-400 hover:text-white text-sm font-bold uppercase tracking-wider">
                    Login to continue
                  </Link>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
