import React, { useState, useEffect } from 'react';
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
}