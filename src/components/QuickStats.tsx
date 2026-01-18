import { useContext } from 'react';
import { DataContext } from '../context/DataContext';
import { Calendar, Users, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function QuickStats() {
  const { events } = useContext(DataContext);
  
  // Calculate Stats
  const allEvents = events || [];
  const fieldVisits = allEvents.filter(e => e.category === 'visit');
  const campusActivities = allEvents.filter(e => e.category === 'campus');
  
  const stats = [
    { label: 'Total Events', value: allEvents.length, icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Field Visits', value: fieldVisits.length, icon: MapPin, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Campus Activities', value: campusActivities.length, icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10' }
  ];

  return (
    <div className="container mx-auto px-6 mb-12">
      <div className="grid md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex items-center gap-4 hover:border-white/20 transition-all shadow-lg"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <h4 className="text-3xl font-bold text-white">{stat.value}</h4>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
