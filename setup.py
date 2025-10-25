import os
import json

# Créer les fichiers
files = {
    "lib/firebase.ts": """import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;""",

    "lib/translations.ts": """export const translations = {
  fr: {
    appTitle: 'HyroxTracker',
    tagline: 'Suivez Vos Performances Hyrox',
    login: 'Connexion',
    signup: 'Inscription',
    email: 'Email',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    logout: 'Déconnexion',
    dashboard: 'Tableau de Bord',
    profile: 'Profil',
    hyroxCategory: 'Catégorie Hyrox',
    targetTime: 'Objectif (min)',
    age: 'Âge',
    gender: 'Genre',
    male: 'Homme',
    female: 'Femme',
    trackPerformance: 'Suivi des Performances',
    logNewPerformance: 'Ajouter une Performance',
    date: 'Date',
    totalTime: 'Temps Total (sec)',
    skierg: 'SkiErg',
    sledPush: 'Sled Push',
    sledPull: 'Sled Pull',
    burpeeBroadJumps: 'Burpee Broad Jumps',
    rowErg: 'Row Erg',
    farmerCarry: 'Farmer Carry',
    sandbagLunges: 'Sandbag Lunges',
    wallBalls: 'Wall Balls',
    time: 'Temps (sec)',
    benchmarks: 'Benchmarks',
    personalBest: 'Meilleur Personnel',
    categoryAverage: 'Moyenne de Catégorie',
    yourPerformance: 'Votre Performance',
    improvement: 'Amélioration',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    submit: 'Soumettre',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès!',
    loginRequired: 'Veuillez vous connecter',
    fillAllFields: 'Veuillez remplir tous les champs',
    passwordMismatch: 'Les mots de passe ne correspondent pas',
    accountCreated: 'Compte créé avec succès!',
    loginSuccess: 'Connexion réussie!',
    language: 'Langue',
  },
  en: {
    appTitle: 'HyroxTracker',
    tagline: 'Track Your Hyrox Performance',
    login: 'Login',
    signup: 'Sign Up',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    logout: 'Logout',
    dashboard: 'Dashboard',
    profile: 'Profile',
    hyroxCategory: 'Hyrox Category',
    targetTime: 'Target Time (min)',
    age: 'Age',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    trackPerformance: 'Track Performance',
    logNewPerformance: 'Log New Performance',
    date: 'Date',
    totalTime: 'Total Time (sec)',
    skierg: 'SkiErg',
    sledPush: 'Sled Push',
    sledPull: 'Sled Pull',
    burpeeBroadJumps: 'Burpee Broad Jumps',
    rowErg: 'Row Erg',
    farmerCarry: 'Farmer Carry',
    sandbagLunges: 'Sandbag Lunges',
    wallBalls: 'Wall Balls',
    time: 'Time (sec)',
    benchmarks: 'Benchmarks',
    personalBest: 'Personal Best',
    categoryAverage: 'Category Average',
    yourPerformance: 'Your Performance',
    improvement: 'Improvement',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    submit: 'Submit',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success!',
    loginRequired: 'Please log in',
    fillAllFields: 'Please fill all fields',
    passwordMismatch: 'Passwords do not match',
    accountCreated: 'Account created successfully!',
    loginSuccess: 'Login successful!',
    language: 'Language',
  }
};

export type Language = 'fr' | 'en';""",

    "pages/_app.tsx": """import type { AppProps } from 'next/app';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}""",

    "pages/index.tsx": """import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/login');
  }, [router]);

  return null;
}""",

    "pages/login.tsx": """import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { translations, Language } from '../lib/translations';

export default function Login() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>('fr');
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    category: 'Open',
    targetTime: 60,
    age: 30,
    gender: 'male',
  });

  const t = translations[language];

  useEffect(() => {
    const savedLang = localStorage.getItem('hyrox-language') as Language;
    if (savedLang) setLanguage(savedLang);
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'fr' ? 'en' : 'fr';
    setLanguage(newLang);
    localStorage.setItem('hyrox-language', newLang);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/dashboard');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === 'targetTime' || name === 'age' ? parseInt(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        if (form.password !== form.confirmPassword) {
          alert(t.passwordMismatch);
          setLoading(false);
          return;
        }

        if (!form.name || form.password.length < 6) {
          alert(t.fillAllFields);
          setLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
        const user = userCredential.user;

        await setDoc(doc(db, 'users', user.uid), {
          name: form.name,
          email: form.email,
          category: form.category,
          targetTime: form.targetTime,
          age: form.age,
          gender: form.gender,
          createdAt: new Date().toISOString(),
        });

        alert(t.accountCreated);
        router.push('/dashboard');
      } else {
        if (!form.email || !form.password) {
          alert(t.fillAllFields);
          setLoading(false);
          return;
        }

        await signInWithEmailAndPassword(auth, form.email, form.password);
        alert(t.loginSuccess);
        router.push('/dashboard');
      }
    } catch (error: any) {
      alert(\`Error: \${error.message}\`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-orange-500 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-right mb-4">
          <button
            onClick={toggleLanguage}
            className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-semibold"
          >
            {language === 'fr' ? 'EN' : 'FR'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-600 mb-2">{t.appTitle}</h1>
            <p className="text-gray-600">{t.tagline}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t.profile}</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Athlete"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t.hyroxCategory}</label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option>Open</option>
                      <option>Doubles</option>
                      <option>Elite</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t.age}</label>
                    <input
                      type="number"
                      name="age"
                      value={form.age}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t.gender}</label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="male">{t.male}</option>
                      <option value="female">{t.female}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t.targetTime}</label>
                    <input
                      type="number"
                      name="targetTime"
                      value={form.targetTime}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t.email}</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t.password}</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {isSignup && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t.confirmPassword}</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-orange-500 text-white font-bold py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? t.loading : isSignup ? t.signup : t.login}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              {isSignup ? t.alreadyHaveAccount : t.signupNow}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}""",

    "pages/dashboard.tsx": """import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { translations, Language } from '../lib/translations';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Performance {
  id: string;
  date: string;
  totalTime: number;
  stations: {
    [key: string]: number;
  };
}

interface UserProfile {
  name: string;
  category: string;
  targetTime: number;
  age: number;
  gender: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [language, setLanguage] = useState<Language>('fr');
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const t = translations[language];

  useEffect(() => {
    const savedLang = localStorage.getItem('hyrox-language') as Language;
    if (savedLang) setLanguage(savedLang);
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'fr' ? 'en' : 'fr';
    setLanguage(newLang);
    localStorage.setItem('hyrox-language', newLang);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        }
        
        const q = query(
          collection(db, 'performances'),
          where('userId', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const perfs: Performance[] = [];
        querySnapshot.forEach((doc) => {
          perfs.push({ id: doc.id, ...doc.data() } as Performance);
        });
        setPerformances(perfs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (loading) return <div className="p-8">{t.loading}</div>;

  const chartData = performances
    .slice()
    .reverse()
    .map(p => ({
      date: new Date(p.date).toLocaleDateString(),
      totalTime: p.totalTime,
    }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">{t.appTitle}</h1>
            <p className="text-gray-600">{t.tagline}</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={toggleLanguage}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
            >
              {language === 'fr' ? 'EN' : 'FR'}
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              {t.logout}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {profile && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-blue-700">{t.profile}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-gray-600 text-sm">{t.profile}</p>
                <p className="font-semibold">{profile.name}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">{t.hyroxCategory}</p>
                <p className="font-semibold">{profile.category}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">{t.targetTime}</p>
                <p className="font-semibold">{profile.targetTime} min</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">{t.age}</p>
                <p className="font-semibold">{profile.age} ans</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-blue-700">{t.trackPerformance}</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="totalTime" stroke="#0ea5e9" name="Total Time (sec)" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">{t.logNewPerformance}</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-blue-700">{t.benchmarks}</h2>
          {performances.length > 0 ? (
            <div className="space-y-4">
              {performances.slice(0, 5).map(p => (
                <div key={p.id} className="border-l-4 border-orange-500 pl-4 py-2">
                  <p className="font-semibold">{new Date(p.date).toLocaleDateString()}</p>
                  <p className="text-gray-600">Total: {p.totalTime} sec</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">{t.logNewPerformance}</p>
          )}
        </div>

        <button
          onClick={() => router.push('/track')}
          className="w-full bg-gradient-to-r from-blue-600 to-orange-500 text-white font-bold py-4 rounded-lg hover:shadow-lg transition"
        >
          {t.logNewPerformance}
        </button>
      </main>
    </div>
  );
}""",

    "pages/track.tsx": """import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { translations, Language } from '../lib/translations';

interface FormData {
  date: string;
  totalTime: number;
  skierg: number;
  sledPush: number;
  sledPull: number;
  burpeeBroadJumps: number;
  rowErg: number;
  farmerCarry: number;
  sandbagLunges: number;
  wallBalls: number;
}

export default function TrackPerformance() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [language, setLanguage] = useState<Language>('fr');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormData>({
    date: new Date().toISOString().split('T')[0],
    totalTime: 0,
    skierg: 0,
    sledPush: 0,
    sledPull: 0,
    burpeeBroadJumps: 0,
    rowErg: 0,
    farmerCarry: 0,
    sandbagLunges: 0,
    wallBalls: 0,
  });

  const t = translations[language];
  const stations = [
    { key: 'skierg', label: t.skierg },
    { key: 'sledPush', label: t.sledPush },
    { key: 'sledPull', label: t.sledPull },
    { key: 'burpeeBroadJumps', label: t.burpeeBroadJumps },
    { key: 'rowErg', label: t.rowErg },
    { key: 'farmerCarry', label: t.farmerCarry },
    { key: 'sandbagLunges', label: t.sandbagLunges },
    { key: 'wallBalls', label: t.wallBalls },
  ];

  useEffect(() => {
    const savedLang = localStorage.getItem('hyrox-language') as Language;
    if (savedLang) setLanguage(savedLang);
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'fr' ? 'en' : 'fr';
    setLanguage(newLang);
    localStorage.setItem('hyrox-language', newLang);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === 'date' ? value : parseInt(value) || 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!user) return;

      if (!form.date) {
        alert(t.fillAllFields);
        setSubmitting(false);
        return;
      }

      await addDoc(collection(db, 'performances'), {
        userId: user.uid,
        date: form.date,
        totalTime: form.totalTime,
        stations: {
          skierg: form.skierg,
          sledPush: form.sledPush,
          sledPull: form.sledPull,
          burpeeBroadJumps: form.burpeeBroadJumps,
          rowErg: form.rowErg,
          farmerCarry: form.farmerCarry,
          sandbagLunges: form.sandbagLunges,
          wallBalls: form.wallBalls,
        },
        createdAt: serverTimestamp(),
      });

      alert(t.success);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error:', error);
      alert(t.error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8">{t.loading}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">{t.appTitle}</h1>
          <button
            onClick={toggleLanguage}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
          >
            {language === 'fr' ? 'EN' : 'FR'}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold mb-8 text-blue-700">{t.logNewPerformance}</h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.date} *
                </label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.totalTime} *
                </label>
                <input
                  type="number"
                  name="totalTime"
                  value={form.totalTime}
                  onChange={handleChange}
                  placeholder="e.g., 3600"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">8 {t.trackPerformance}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stations.map((station) => (
                  <div key={station.key}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {station.label} ({t.time})
                    </label>
                    <input
                      type="number"
                      name={station.key}
                      value={form[station.key as keyof FormData]}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-blue-600 to-orange-500 text-white font-bold py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50"
              >
                {submitting ? t.loading : t.save}
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="flex-1 bg-gray-300 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-400 transition"
              >
                {t.cancel}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}""",

    "styles/globals.css": """@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}""",

    "tsconfig.json": """{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "jsx": "preserve",
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "incremental": true,
    "isolatedModules": true,
    "noEmit": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}""",

    "next.config.js": """module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
}""",

    "tailwind.config.js": """module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}""",

    "postcss.config.js": """module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}""",
}

# Créer tous les fichiers
for filepath, content in files.items():
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'✅ Créé: {filepath}')

print('\\n🎉 TOUS LES FICHIERS CRÉÉS AVEC SUCCÈS!')
print('\\nMaintenant, dans le terminal, tapez: npm run dev')
