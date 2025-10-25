import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../lib/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Link from 'next/link';

interface Performance {
  id: string;
  station: string;
  time: number;
  date: string;
}

interface UserData {
  name: string;
  category: string;
  targetTime: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);

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
          console.log('Error fetching performances:', error);
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
      console.log('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-orange-900 to-orange-700 flex items-center justify-center">
        <div className="text-white text-2xl font-bold">⏳ Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-orange-900 to-orange-700">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur border-b-2 border-orange-500/30 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-orange-500">⚡ HyroxTracker</h1>
            <p className="text-gray-300">💪 Suivez Vos Performances Hyrox</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition transform hover:scale-105"
          >
            🚪 Déconnexion
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl shadow-2xl p-8 mb-8 text-white border border-orange-400">
          <h2 className="text-3xl font-black mb-2">🎯 Bienvenue, Athlète !</h2>
          <p className="text-lg">Vous êtes prêt à dominer le Hyrox ? 🔥</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Stat 1 */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl p-6 border border-orange-500/30 hover:border-orange-500/60 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-bold">📊 PERFORMANCES</p>
                <p className="text-4xl font-black text-orange-500">{performances.length}</p>
              </div>
              <div className="text-6xl">📈</div>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl p-6 border border-orange-500/30 hover:border-orange-500/60 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-bold">🏆 CATÉGORIE</p>
                <p className="text-3xl font-black text-orange-500">Elite</p>
              </div>
              <div className="text-6xl">🎖️</div>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl p-6 border border-orange-500/30 hover:border-orange-500/60 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-bold">⏱️ TEMPS CIBLE</p>
                <p className="text-3xl font-black text-orange-500">60 min</p>
              </div>
              <div className="text-6xl">⏰</div>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Suivi Performances */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl p-6 border border-orange-500/30">
            <h3 className="text-2xl font-black text-orange-500 mb-4">📊 Suivi des Performances</h3>
            <p className="text-gray-400 mb-4">Enregistrez vos temps et analysez votre progression</p>
            <Link
              href="/tracking"
              className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-lg transition transform hover:scale-105"
            >
              ➕ Ajouter une Performance
            </Link>
          </div>

          {/* Benchmarks */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl p-6 border border-orange-500/30">
            <h3 className="text-2xl font-black text-orange-500 mb-4">🏅 Benchmarks</h3>
            <p className="text-gray-400 mb-4">Comparez vos performances avec les meilleurs athlètes</p>
            <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-lg transition transform hover:scale-105">
              📊 Voir les Benchmarks
            </button>
          </div>
        </div>

        {/* Performances List */}
        {performances.length > 0 && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl p-6 border border-orange-500/30">
            <h3 className="text-2xl font-black text-orange-500 mb-6">🎯 Vos Dernières Performances</h3>
            <div className="space-y-3">
              {performances.map((perf, index) => (
                <div key={perf.id} className="bg-black/40 rounded-lg p-4 flex justify-between items-center border border-orange-500/20 hover:border-orange-500/50 transition">
                  <div>
                    <p className="text-white font-bold text-lg">#{index + 1} - {perf.station}</p>
                    <p className="text-gray-400 text-sm">{perf.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-orange-500 font-black text-2xl">{perf.time}s</p>
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
            className="inline-block px-12 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black text-xl rounded-xl transition transform hover:scale-105 shadow-2xl"
          >
            🚀 Commencer l'Entraînement
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/50 border-t border-orange-500/30 p-6 mt-12">
        <p className="text-center text-gray-400">🔥 Dominez le Hyrox 🔥</p>
      </footer>
    </div>
  );
}
