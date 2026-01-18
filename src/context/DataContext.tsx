import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  collection, doc, onSnapshot, setDoc, addDoc, updateDoc, deleteDoc, getDoc 
} from 'firebase/firestore';
import { 
  onAuthStateChanged, signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, signOut, updateProfile,
  sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup 
} from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { db, auth } from '../firebase';
import { 
  SiteContent, Event, Secretary, Registration, UserProfile, 
  Theme, DEFAULT_CONTENT, Badge 
} from '../types';

type DataContextType = {
  content: SiteContent;
  updateContent: (updates: Partial<SiteContent>) => Promise<void>;
  events: Event[];
  addEvent: (evt: Event) => Promise<void>;
  updateEvent: (id: string, updates: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  registrations: Registration[];
  allUsers: UserProfile[]; // Added for Admin Stats
  registerForEvent: (eventId: string, formData: any) => Promise<void>;
  user: UserProfile | null;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, name: string, batch: string, avatar: string, mobile: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  googleLogin: () => Promise<{ user: any; isNewUser: boolean; needsCompletion: boolean }>;
  completeGoogleLogin: (uid: string, data: { name: string; mobile: string; batch: string; avatar: string; email: string }) => Promise<void>;
  theme: Theme;
  setTheme: (t: Theme) => void;
  loading: boolean;
  secretaries: Secretary[];
  addSecretary: (sec: Secretary) => Promise<void>;
  updateSecretary: (id: string, updates: Partial<Secretary>) => Promise<void>;

  deleteSecretary: (id: string) => Promise<void>;
  updateUserProfile: (uid: string, updates: Partial<UserProfile>) => Promise<void>;
};

export const DataContext = createContext<DataContextType>({} as any);

export function useData() {
    return useContext(DataContext);
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);
  const [events, setEvents] = useState<Event[]>([]);
  const [secretaries, setSecretaries] = useState<Secretary[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [theme, setTheme] = useState<Theme>({ primaryColor: '#10b981', secondaryColor: '#06b6d4' });
  const [loading, setLoading] = useState(true);

  // --- Real-time Data Sync ---
  useEffect(() => {
    // 1. Content Sync
    const contentUnsub = onSnapshot(doc(db, "site_content", "main"), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        // Merge with default content to ensure new fields (like socialLinks) exist
        setContent({ ...DEFAULT_CONTENT, ...data } as SiteContent);
      } else {
        // Initialize if missing
        setDoc(doc(db, "site_content", "main"), DEFAULT_CONTENT);
      }
    });

    // 2. Events Sync
    const eventsUnsub = onSnapshot(collection(db, "events"), (snapshot) => {
      const loadedEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
      setEvents(loadedEvents);
    });

    // 3. Secretaries Sync
    const secretariesUnsub = onSnapshot(collection(db, "secretaries"), (snapshot) => {
      const loadedSecretaries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Secretary));
      // Sort by order if available, else by name
      loadedSecretaries.sort((a, b) => (a.order || 0) - (b.order || 0));
      setSecretaries(loadedSecretaries);
    });

    return () => { contentUnsub(); eventsUnsub(); secretariesUnsub(); };
  }, []);

  // 4. Registrations & Users Sync (Admin Only)
  useEffect(() => {
    if (user?.role === 'admin') {
      const regUnsub = onSnapshot(collection(db, "registrations"), (snapshot) => {
        const loadedRegs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Registration));
        setRegistrations(loadedRegs);
      });
      
      const usersUnsub = onSnapshot(collection(db, "users"), (snapshot) => {
        const loadedUsers = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
        setAllUsers(loadedUsers);
      });

      return () => { regUnsub(); usersUnsub(); };
    } else {
      setRegistrations([]);
      setAllUsers([]);
    }
  }, [user?.role]);

  // --- Actions ---
  const updateContent = async (updates: Partial<SiteContent>) => {
    console.log("DataContext: Attempting to update content:", updates);
    try {
      // Optimistic update
      setContent(prev => ({ ...prev, ...updates }));
      // DB Update
      const docRef = doc(db, "site_content", "main");
      await setDoc(docRef, updates, { merge: true });
      console.log("DataContext: Successfully wrote to site_content/main");
    } catch (e: any) {
      console.error("DataContext: Failed to update content:", e);
      if (e.code === 'permission-denied') {
        alert("Permission Denied: You do not have admin rights to edit this content.");
      } else {
        alert("Error saving settings to database. Check console for details.");
      }
    }
  };

  const addEvent = async (evt: Event) => {
    const { id: _, ...eventData } = evt; // Destructure id to exclude it
    await addDoc(collection(db, "events"), eventData);
  };

  const updateEvent = async (id: string, updates: Partial<Event>) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, ...data } = updates;
    await updateDoc(doc(db, "events", id), data);
  };
  
  const deleteEvent = async (id: string) => {
    await deleteDoc(doc(db, "events", id));
  };

  const addSecretary = async (sec: Secretary) => {
    // Explicitly destructure to ensure we only save what we intend
    const { name, role, image, description, order } = sec;
    const dataToSave = { name, role, image, description, order };
    
    console.log("DataContext: Saving secretary to Firestore:", dataToSave);
    try {
      const docRef = await addDoc(collection(db, "secretaries"), dataToSave);
      console.log("DataContext: Secretary saved with ID:", docRef.id);
    } catch (e) {
      console.error("DataContext: Error saving secretary:", e);
      throw e;
    }
  };

  const updateSecretary = async (id: string, updates: Partial<Secretary>) => {
    await updateDoc(doc(db, "secretaries", id), updates);
  };

  const deleteSecretary = async (id: string) => {
    await deleteDoc(doc(db, "secretaries", id));
  };

  // --- Auth Handlers ---
  useEffect(() => {
    let userUnsub: (() => void) | null = null;
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // Clean up previous user listener
      if (userUnsub) {
        userUnsub();
        userUnsub = null;
      }
      
      if (currentUser) {
        // Set up real-time listener for user profile
        try {
          const docRef = doc(db, "users", currentUser.uid);
          
          // Use onSnapshot for real-time updates
          userUnsub = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
              setUser(docSnap.data() as UserProfile);
            } else {
              // Fallback if doc missing (shouldn't happen on normal flow)
              setUser({
                uid: currentUser.uid,
                name: currentUser.displayName || "User",
                email: currentUser.email || "",
                role: "student",
                badges: [],
                batch: "2024",
                avatar: "eco1",
                department: "",
                year: "",
                registeredEvents: []
              });
            }
          });
        } catch (error) {
          console.error("Error setting up user listener:", error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    
    return () => {
      unsubscribe();
      if (userUnsub) userUnsub();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signup = async (email: string, pass: string, name: string, batch: string, avatar: string, mobile: string) => {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      // Update Auth Profile
      await updateProfile(res.user, { displayName: name });

      // Create Firestore Profile
      const newUserProfile: UserProfile = {
        uid: res.user.uid,
        name: name,
        email: email,
        role: 'student', // Default role
        badges: [],
        batch: batch,
        mobile: mobile,
        avatar: avatar,
        department: '', // Default empty, can be updated in profile
        year: '',       // Default empty
        registeredEvents: []
      };
      
      await setDoc(doc(db, "users", res.user.uid), newUserProfile);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const googleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      
      const docRef = doc(db, "users", res.user.uid);
      const docSnap = await getDoc(docRef);

      const exists = docSnap.exists();
      const data = exists ? docSnap.data() : null;
      
      // Check if profile exists but is incomplete (missing mobile or batch is default)
      const isIncomplete = exists && (!data?.mobile || data?.batch === "2024");

      return { 
        user: res.user, 
        isNewUser: !exists,
        needsCompletion: !exists || isIncomplete
      };
    } catch (e) {
      console.error("Google Sign In Error:", e);
      throw e;
    }
  };

  const completeGoogleLogin = async (uid: string, data: { name: string; mobile: string; batch: string; avatar: string; email: string }) => {
    const docRef = doc(db, "users", uid);
    


    // If it's a completely new user, we want defaults. 
    // If it's an update, we don't want to reset role.
    // The safest way is to read first? We can assume we are "completing" so we set these specific fields.
    // But for a NEW user, we need 'role': 'student'.
    
    // Let's just use setDoc with merge, but include defaults ONLY if they don't exist?
    // Firestore merge doesn't support "set if missing" easily without a read.
    // BUT we know completeGoogleLogin is called for BOTH new and incomplete users.
    
    // Let's assume 'student' is safe default for anyone going through this flow.
    // (Admins wouldn't be fixing their incomplete profile this way usually, or if they do, role might be reset).
    
    // Better approach: Check if it exists strictly inside here? 
    // Or just pass "isNew" flag?
    
    // Let's just set the defaults. If an admin logs in and has no mobile, their role might become student.
    // That's a risk. 
    // Let's read the doc again or rely on merge behavior.
    
    // Actually, simply NOT sending 'role' fits "merge". 
    // BUT for a new user, 'role' will be missing!
    
    // Solution: Get the doc first.
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
       // New User - Set full defaults
       const newUser: UserProfile = {
         uid,
         name: data.name,
         email: data.email,
         role: 'student',
         badges: [],
         batch: data.batch,
         avatar: data.avatar,
         mobile: data.mobile,
         department: "",
         year: "",
         registeredEvents: []
       };
       await setDoc(docRef, newUser);
    } else {
       // Existing User - Just update specific fields
       await setDoc(docRef, {
         name: data.name,
         mobile: data.mobile,
         batch: data.batch,
         avatar: data.avatar,
         // We do NOT touch role or badges
       }, { merge: true });
    }
  };

  const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
    try {
      const docRef = doc(db, "users", uid);
      await setDoc(docRef, updates, { merge: true });
      console.log("DataContext: User profile updated successfully");
    } catch (e) {
      console.error("DataContext: Error updating user profile:", e);
      throw e;
    }
  };

  const registerForEvent = async (eventId: string, formData: any) => {
    if (!user) return;
    
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    // 1. Create Registration Record
    const newRegData = {
      userId: user.uid,
      userName: user.name,
      userEmail: user.email,
      eventId,
      eventTitle: event.title,
      timestamp: new Date().toISOString(),
      formData,
      mobile: user.mobile || '' // Added mobile number
    };
    
    await addDoc(collection(db, "registrations"), newRegData);

    // 2. Add Badge & Update Registered Events
    const newBadge: Badge = {
      id: Math.random().toString(36).substr(2, 9),
      eventId,
      name: event.badgeName,
      emoji: event.badgeEmoji, // Updated field
      status: 'pending'
    };
    
    // Safety check if user.badges is undefined
    const currentBadges = user.badges || [];
    const updatedBadges = [...currentBadges, newBadge];
    
    const currentRegisteredEvents = user.registeredEvents || [];
    const updatedRegisteredEvents = [...currentRegisteredEvents, eventId];

    await updateDoc(doc(db, "users", user.uid), { 
      badges: updatedBadges,
      registeredEvents: updatedRegisteredEvents
    });
  };

  // More aggressive timeout for loading state
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    }, 2000); 
    return () => clearTimeout(timeout);
  }, [loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-lime-500 animate-spin" />
          <p className="text-slate-400 font-medium animate-pulse">Loading EcoClub...</p>
        </div>
      </div>
    );
  }

  return (
    <DataContext.Provider value={{ 
      content, updateContent, events, addEvent, updateEvent, deleteEvent, 
      registrations, registerForEvent, user, login, signup, logout, resetPassword, googleLogin, completeGoogleLogin, updateUserProfile, theme, setTheme, loading,
      secretaries, addSecretary, updateSecretary, deleteSecretary, allUsers
    }}>
      {children}
    </DataContext.Provider>
  );
}
