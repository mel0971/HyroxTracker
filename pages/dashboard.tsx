import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../lib/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import { translations, Language } from '../lib/translations';

interface Performance {
  id: string;
  station: string;
  time: number;
  date: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>('fr');
  const [user, setUser] = useState<any>(null);
  const [performances, setPerformances] = useState<Performance[]>([]);
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
      if (!currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
        try {
          const q = query(collection(db, 'performances'), where('userId', '==', currentUser.uid));
          const querySnapshot = await getDocs(q);
          setPerformances(
            querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Performance[]
          );
        } catch (error) {
          console.log('Error:', error);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.log('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl font-black" style={{ fontFamily: 'Arial Black, sans-serif' }}>⏳ {t.loading}...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur border-b-2 border-cyan-400/30 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-cyan-400" style={{ fontFamily: 'Arial Black, sans-serif' }}>⚡ HYROXTRACKER</h1>
            <p className="text-gray-300">💪 {language === 'fr' ? 'Tableau de Bord' : 'Dashboard'}</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={toggleLanguage}
              className="px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black rounded-lg transition transform hover:scale-105"
              style={{ fontFamily: 'Arial Black, sans-serif' }}
            >
              {language === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR'}
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-lg transition transform hover:scale-105"
              style={{ fontFamily: 'Arial Black, sans-serif' }}
            >
              🚪 {t.logout}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl shadow-2xl p-8 mb-8 text-white border border-cyan-300">
          <h2 className="text-3xl font-black mb-2" style={{ fontFamily: 'Arial Black, sans-serif' }}>🎯 {language === 'fr' ? 'Bienvenue Athlète !' : 'Welcome Athlete !'}</h2>
          <p className="text-lg font-bold" style={{ fontFamily: 'Arial, sans-serif' }}>{language === 'fr' ? 'Êtes-vous prêt à dominer le Hyrox ?' : 'Are you ready to dominate Hyrox?'} 🔥</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-xl p-6 border border-cyan-400/30 hover:border-cyan-400/60 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-black" style={{ fontFamily: 'Arial Black, sans-serif' }}>📊 {t.trackPerformance}</p>
                <p className="text-4xl font-black text-cyan-400">{performances.length}</p>
              </div>
              <div className="text-6xl">📈</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-xl p-6 border border-cyan-400/30 hover:border-cyan-400/60 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-black" style={{ fontFamily: 'Arial Black, sans-serif' }}>🏆 CATÉGORIE</p>
                <p className="text-3xl font-black text-cyan-400">Elite</p>
              </div>
              <div className="text-6xl">🎖️</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-xl p-6 border border-cyan-400/30 hover:border-cyan-400/60 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-black" style={{ fontFamily: 'Arial Black, sans-serif' }}>⏱️ {t.targetTime}</p>
                <p className="text-3xl font-black text-cyan-400">60 min</p>
              </div>
              <div className="text-6xl">⏰</div>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-xl p-6 border border-cyan-400/30">
            <h3 className="text-2xl font-black text-cyan-400 mb-4" style={{ fontFamily: 'Arial Black, sans-serif' }}>📊 {t.trackPerformance}</h3>
            <p className="text-gray-400 mb-4">{language === 'fr' ? 'Enregistrez vos temps et analysez votre progression' : 'Log your times and analyze your progress'}</p>
            <Link
              href="/tracking"
              className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black rounded-lg transition transform hover:scale-105"
              style={{ fontFamily: 'Arial Black, sans-serif' }}
            >
              ➕ {t.logNewPerformance}
            </Link>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-xl p-6 border border-cyan-400/30">
            <h3 className="text-2xl font-black text-cyan-400 mb-4" style={{ fontFamily: 'Arial Black, sans-serif' }}>🏅 {t.benchmarks}</h3>
            <p className="text-gray-400 mb-4">{language === 'fr' ? 'Comparez vos performances avec les meilleurs athlètes' : 'Compare your performance with the best athletes'}</p>
            <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black rounded-lg transition transform hover:scale-105" style={{ fontFamily: 'Arial Black, sans-serif' }}>
              📊 {t.benchmarks}
            </button>
          </div>
        </div>

        {/* Performances List */}
        {performances.length > 0 && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-xl p-6 border border-cyan-400/30">
            <h3 className="text-2xl font-black text-cyan-400 mb-6" style={{ fontFamily: 'Arial Black, sans-serif' }}>🎯 {language === 'fr' ? 'Vos Performances' : 'Your Performances'}</h3>
            <div className="space-y-3">
              {performances.map((perf, index) => (
                <div key={perf.id} className="bg-slate-800/50 border border-cyan-400/20 hover:border-cyan-400/50 rounded-lg p-4 flex justify-between items-center transition">
                  <div>
                    <p className="text-white font-black text-lg" style={{ fontFamily: 'Arial Black, sans-serif' }}>#{index + 1} - {perf.station}</p>
                    <p className="text-gray-400 text-sm">{perf.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-cyan-400 font-black text-2xl">{perf.time}s</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Button */}
        <div className="mt-12 text-center">
          <Link
            href="/tracking"
            className="inline-block px-12 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-xl rounded-xl transition transform hover:scale-105 shadow-2xl"
            style={{ fontFamily: 'Arial Black, sans-serif' }}
          >
            🚀 {language === 'fr' ? 'Commencer l\'Entraînement' : 'Start Training'}
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/50 border-t border-cyan-400/30 p-6 mt-12">
        <p className="text-center text-gray-400 font-black" style={{ fontFamily: 'Arial, sans-serif' }}>
          💪 {language === 'fr' ? 'DOMINE LE HYROX' : 'DOMINATE HYROX'} 💪
        </p>
      </footer>
    </div>
  );
}
