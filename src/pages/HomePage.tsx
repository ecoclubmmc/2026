import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, Users, Leaf, ArrowUpRight, Clock, Eye } from 'lucide-react';
import { DataContext } from '../context/DataContext';
import HeroDesign from '../components/HeroDesign';
import EditableText from '../components/EditableText';
import QuickStats from '../components/QuickStats';

export default function HomePage() {
  const { content, events } = useContext(DataContext);
  const upcomingEvents = events ? events.filter(e => new Date(e.date) >= new Date()).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()) : [];

  return (
    <div className="min-h-screen pb-24">
      <HeroDesign />
      
      <div className="container mx-auto max-w-7xl px-6 grid lg:grid-cols-12 gap-6">
        
        {/* Join CTA - Spans 8 Cols */}
        <div className="lg:col-span-8 bg-black/40 backdrop-blur-md rounded-[2.5rem] p-8 md:p-12 border border-white/10 relative overflow-hidden flex flex-col justify-center min-h-[400px] shadow-2xl">
           <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-emerald-500/20 to-transparent rounded-full blur-[80px] -mr-20 -mt-20" />
           <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200">Movement</span>
              </h2>
              <p className="text-slate-200 text-lg mb-8 max-w-xl leading-relaxed">
                Eco Club isn't just a student body; it's a commitment to a greener future. Participate in our upcoming events and make a difference.
              </p>
              <Link to="/events" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-950 rounded-full font-bold hover:bg-emerald-400 hover:text-white transition-all group shadow-lg">
                View Activities <ArrowUpRight className="w-5 h-5 group-hover:rotate-45 transition-transform" />
              </Link>
           </div>
        </div>

        {/* Upcoming Events Module - Spans 4 Cols */}
        <div className="lg:col-span-4 bg-black/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10 flex flex-col relative overflow-hidden shadow-2xl">
           <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-white text-xl flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" /> Upcoming
              </h3>
              <Link to="/events" className="text-xs font-bold text-emerald-400 hover:underline">VIEW ALL</Link>
           </div>
           
           <div className="space-y-4 flex-1">
             {upcomingEvents.length > 0 ? (
               upcomingEvents.slice(0, 3).map(evt => (
                 <Link key={evt.id} to={`/events/${evt.id}`} className="block p-4 bg-white/5 rounded-2xl hover:bg-white/10 border border-white/5 hover:border-emerald-500/30 transition-all group">
                    <div className="flex justify-between items-start">
                       <div>
                          <p className="font-bold text-slate-200 group-hover:text-emerald-400 transition-colors line-clamp-1">{evt.title}</p>
                          <p className="text-xs text-slate-400 mt-1">{new Date(evt.date).toLocaleDateString()}</p>
                       </div>
                       <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center border border-white/10 group-hover:border-emerald-500/50">
                          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400" />
                       </div>
                    </div>
                 </Link>
               ))
             ) : (
               <div className="flex-1 flex items-center justify-center text-slate-400 italic text-center p-4">
                 No upcoming events.
               </div>
             )}
           </div>
        </div>

        {/* Divider / Title Module */}
        <div className="lg:col-span-12 py-8 flex items-center gap-4">
           <div className="h-[1px] bg-white/20 flex-1" />
           <span className="font-bold text-white/50 text-sm tracking-widest uppercase">Our Impact & Legacy</span>
           <div className="h-[1px] bg-white/20 flex-1" />
        </div>

        {/* Quick Stats - Spans 12 Cols */}
        <div className="lg:col-span-12">
            <QuickStats />
        </div>

        {/* Vision - Spans 6 */}
        <div className="lg:col-span-6 bg-black/40 backdrop-blur-md rounded-[2.5rem] p-8 md:p-10 border border-white/10 hover:border-white/20 transition-all">
             <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-6">
                <Eye className="w-6 h-6 text-emerald-400" />
             </div>
             <h4 className="text-2xl font-bold text-white mb-4">Vision</h4>
             <div className="text-slate-300 leading-relaxed text-lg">
                <EditableText value={content.history || "Our vision is to..."} contentKey="history" className="bg-transparent" />
             </div>
        </div>

        {/* Mission - Spans 6 */}
        <div className="lg:col-span-6 bg-black/40 backdrop-blur-md rounded-[2.5rem] p-8 md:p-10 border border-white/10 hover:border-white/20 transition-all">
             <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-6">
                <Award className="w-6 h-6 text-emerald-400" />
             </div>
             <h4 className="text-2xl font-bold text-white mb-4">Mission</h4>
             <div className="text-slate-300 leading-relaxed text-lg">
                <EditableText value={content.mission || "Our mission is to..."} contentKey="mission" className="bg-transparent" />
             </div>
        </div>

        {/* Works - Grid of 3 (Span 4 each) */}
        {content.works.map((work, idx) => (
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: idx * 0.1 }}
             key={idx}
             className="lg:col-span-4 bg-white/90 backdrop-blur-md text-emerald-950 rounded-[2.5rem] p-8 border border-white/50 hover:scale-[1.02] transition-transform shadow-xl"
           >
              <div className="mb-6">
                 {/* Icon Switcher - Dark icon on white */}
                 {work.icon === 'users' ? <Users className="w-8 h-8 text-emerald-700" /> : work.icon === 'leaf' ? <Leaf className="w-8 h-8 text-emerald-700" /> : <Award className="w-8 h-8 text-emerald-700" />}
              </div>
              <h4 className="text-xl font-bold mb-3">{work.title}</h4>
              <p className="text-slate-600 leading-relaxed">{work.desc}</p>
           </motion.div>
        ))}
      </div>
    </div>
  );
}
