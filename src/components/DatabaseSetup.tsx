import { useState, useContext } from 'react';
import { doc, updateDoc, setDoc, addDoc, collection, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { DataContext } from '../context/DataContext';
import { DEFAULT_CONTENT, Event, Secretary } from '../types';
import { Loader2, Database } from 'lucide-react';

export default function DatabaseSetup() {
  const { user } = useContext(DataContext);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSetup = async () => {
    if (!user) {
      setMsg("Please log in first!");
      return;
    }
    setLoading(true);
    setMsg("Starting setup...");
    try {
      // 1. Make current user Admin
      await updateDoc(doc(db, "users", user.uid), { role: 'admin' });
      setMsg("You are now Admin.");

      // 2. Initialize Site Content if missing
      const contentRef = doc(db, "site_content", "main");
      const contentSnap = await getDoc(contentRef);
      if (!contentSnap.exists()) {
        await setDoc(contentRef, DEFAULT_CONTENT);
        setMsg("Initialized Site Content.");
      }

      // 3. Add Sample Secretary if collection empty (check via fetching one)
      // Since we can't easily check collection size without reading, we'll just add one if user requests
      // Actually, let's just force add one for demo
      const sampleSecretary: Secretary = {
        id: "sec_1",
        name: "Jane Doe",
        role: "General Secretary",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
        description: "Leading the eco-initiative with passion.",
        order: 1
      };
      
      // Check if this ID exists to avoid dupes on multiple clicks
      const secRef = doc(db, "secretaries", "sec_1");
      const secSnap = await getDoc(secRef);
      if (!secSnap.exists()) {
         await setDoc(secRef, sampleSecretary); // saving with specific ID
         setMsg("Added sample Secretary.");
      }

      // 4. Add Sample Event
      const sampleEvent: Partial<Event> = {
         title: "Campus Clean-up Drive",
         category: "campus",
         date: new Date().toISOString().split('T')[0],
         venue: "Main Quadrangle",
         description: "Join us for a campus-wide cleanup event. Refreshments provided!",
         image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=600",
         badgeImage: "🧹",
         badgeName: "Cleaner",
         formFields: [{ id: "f1", label: "Why do you want to join?", type: "text", required: true }]
      };
      await addDoc(collection(db, "events"), sampleEvent);
      setMsg("Added sample Event. Setup Complete!");
      
      // Delay to show success
      setTimeout(() => window.location.reload(), 2000);

    } catch (e: any) {
      console.error(e);
      setMsg("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button 
        onClick={handleSetup}
        disabled={loading}
        className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-lg flex items-center gap-2 transition-all"
        title="Setup Database"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Database className="w-5 h-5"/>}
        <span className="text-xs font-bold">{msg || "Setup DB"}</span>
      </button>
    </div>
  );
}
